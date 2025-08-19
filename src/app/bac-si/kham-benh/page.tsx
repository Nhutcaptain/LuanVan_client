"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";
import ExaminationForm from "@/components/ExaminationForm/ExaminationFormComponent";
import api from "@/lib/axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PatientList from "@/components/ExaminationForm/PatientList";
import { DoctorInterface } from "@/interface/DoctorInterface";
import { Service } from "@/interface/ServiceInterface";
import ServiceList from "@/components/ExaminationForm/ServiceList";
import { IPatient } from "@/interface/patientInterface";
import { Appointment } from "@/interface/AppointmentInterface";
import { ExaminationFormData } from "@/interface/ExaminationInterface";
import { useSocket } from "@/hook/useSocket";

const ExaminationPage = () => {
  const router = useRouter();
  const MySwal = withReactContent(Swal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [doctorInfo, setDoctorInfo] = useState<DoctorInterface | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [patientInfo, setPatientInfo] = useState<IPatient>();
  const [paraclinicalOrders, setParaclinicalOrders] = useState([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [tempExamination, setTempExamination] = useState<ExaminationFormData>();
  const [isTempExaminationChange, setIsTempExaminationChange] = useState(false);
  const [provisional, setProvisional] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);

  const { socket, joinRoom, leaveRoom } = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
    {
      eventHandlers: {
        "examination-update": (data) => {

          if (tempExamRef.current?._id === data.examinationId) {
            setTempExamination((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                testOrders: data.data.testOrders,
              };
            });
          }
        },
      },
    }
  );

  const tempExamRef = useRef(tempExamination);

  useEffect(() => {
    tempExamRef.current = tempExamination;
  }, [tempExamination]);

  const currentRoomRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tempExamination?._id) return;

    const roomId = `examination_${tempExamination._id}`;

    // Rời room cũ nếu có
    if (currentRoomRef.current) {
      leaveRoom(currentRoomRef.current);
    }

    // Tham gia room mới
    joinRoom(roomId);
    currentRoomRef.current = roomId;

    return () => {
      if (currentRoomRef.current) {
        leaveRoom(currentRoomRef.current);
        currentRoomRef.current = null;
      }
    };
  }, [tempExamination?._id, joinRoom, leaveRoom]);

  useEffect(() => {
    const id = localStorage.getItem("doctorId");
    if (id) setDoctorId(id);
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/getByDoctorId/${id}`);
        if (res.status === 200) {
          setDoctorInfo(res.data);
        }
      } catch (error: any) {}
    };
    fetchDoctor();
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setTempExamination(undefined);
    setSelectedServices([]);
    const fetchTempAppointment = async () => {
      try {
        const res = await api.post("/examination/temp_get", {
          doctorId,
          patientId: selectedPatient,
          date: new Date(),
        });
        if (res.status === 200) {
          setTempExamination(res.data);
        }
      } catch (error: any) {}
    };
    fetchTempAppointment();
  }, [selectedPatient]);

  useEffect(() => {
    if (!doctorInfo?.departmentId) return;
    const fetchServices = async () => {
      try {
        const res = await api.get(`/service/getAll/`);
        if (res.status === 200) {
          setServices(res.data);
        }
      } catch (error: any) {}
    };
    fetchServices();
  }, [doctorInfo?.departmentId]);

  useEffect(() => {
    setSelectedServices([]);
    if (tempExamination?.testOrders.length && services.length > 0) {
      const matched = services.filter((service) =>
        tempExamination.testOrders.some((s: any) => s.serviceId === service._id)
      );
      setSelectedServices(matched);
    }
  }, [tempExamination]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      isOvertimeAppointment: isOvertime,
      status: "completed", // đảm bảo luôn là giá trị này
    };
    if (tempExamination) {
      const res = await api.put(
        `/examination/update/${tempExamination._id}`,
        payload
      );
      if (res.status === 200) {
        // setTempExamination(res.data);
        setSelectedPatient("");
        setTempExamination(undefined);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      const response = await api.put(
        `/appointment/${selectedAppointment}/status`,
        {
          examination: tempExamination._id,
          status: "completed",
        }
      );
      setIsSubmitting(false);
    } else {
      try {
        const res = await api.post("/patient/postExamination", payload);
        if (res.status === 200) {
          // setTempExamination(res.data);
          setSelectedPatient("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        const response = await api.put(
          `/appointment/${selectedAppointment}/status`,
          {
            examinationId: res.data._id,
            status: "completed",
          }
        );
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveTemp = async (data: any) => {
    const payload = {
      ...data,
      status: "waiting_result", // đảm bảo luôn là giá trị này
    };
    if (tempExamination) {
      const res = await api.put(
        `/examination/update/${tempExamination._id}`,
        payload
      );
      if (res.status === 200) {
        setTempExamination(res.data);
      }
      const response = await api.put(
        `/appointment/${selectedAppointment}/status`,
        {
          examination: tempExamination._id,
          status: "waiting_result",
        }
      );
    } else {
      const response = await api.post("/examination/temp_save", data);
      setTempExamination(response.data);
      const res = await api.put(`/appointment/${selectedAppointment}/status`, {
        examinationId: response.data._id,
        status: "waiting_result",
      });
    }
  };

  const handleSelectedServicesChange = useCallback((selected: Service[]) => {
    setSelectedServices(selected);
  }, []);

  return (
    <div className="new-examination-page">
      <div className="page-header">
        <h1>Ghi Nhận Kết Quả Khám Bệnh</h1>
        <button onClick={() => router.back()} className="back-button">
          Quay Lại
        </button>
      </div>

      <div className="main-page">
        <ExaminationForm
          initialExamination={tempExamination}
          doctorId={doctorId}
          doctorInfo={doctorInfo}
          onSaveTerm={handleSaveTemp}
          onPatientInfo={setPatientInfo}
          selectedPatient={selectedPatient}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          selectedServices={selectedServices}
          onProvisionalChange={setProvisional}
        />
        <div className="side-page">
          <PatientList
            onOvertimeChange={setIsOvertime}
            onPatientSelected={setSelectedPatient}
            doctorId={doctorId ?? ""}
            selectedPatient={selectedPatient}
            onAppointmentSelected={setSelectedAppointment}
          ></PatientList>

          <ServiceList
            services={services}
            patientInfo={patientInfo ?? null}
            doctorInfo={doctorInfo ?? null}
            initialSelectedServices={selectedServices}
            onSelectedServicesChange={handleSelectedServicesChange}
            tempExamination={tempExamination}
            selectedPatient={selectedPatient}
            provisional={provisional}
          />
        </div>
      </div>
    </div>
  );
};

export default ExaminationPage;
