"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [tempExamination, setTempExamination] = useState<ExaminationFormData>()

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
    if(!selectedPatient) return;
    const fetchTempAppointment = async() => {
      try{
        const res = await api.post('/examination/temp_get',{
          doctorId,
          patientId: selectedPatient,
          date: new Date()
        })
        if(res.status === 200) {
          setTempExamination(res.data);
          console.log(res.data);
        }
      }catch(error:any) {

      }
    }
    fetchTempAppointment();
  },[selectedPatient])

  useEffect(() => {
    if (!doctorInfo?.specialtyId) return;
    const fetchServices = async () => {
      try {
        const res = await api.get(
          `/service/getBySpecialtyId/${(doctorInfo.specialtyId as any)._id}`
        );
        if (res.status === 200) {
          setServices(res.data);
        }
      } catch (error: any) {}
    };
    fetchServices();
  }, [doctorInfo?.specialtyId]);

  useEffect(() => {
    if(tempExamination?.testOrders.length && services.length > 0) {
      const matched = services.filter(service => 
        tempExamination.testOrders.some((s: any) => s.serviceId === service._id)
      )
       setSelectedServices(matched)
    }
  },[tempExamination])

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/patient/postExamination", data);
      if (response.status === 201) {
        MySwal.fire({
          title: <strong className="text-2xl">Cập nhật hình ảnh</strong>,
          html: <i className="text-xl">Đã cập nhật ảnh đại diện thành công</i>,
          icon: "success",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTemp = async (data: any) => {
    const payload = {
    ...data,
    status: 'waiting_result', // đảm bảo luôn là giá trị này
  };
    if(tempExamination) {
      const res = await api.put(`/examination/update/${tempExamination._id}`,payload)
      if(res.status === 200) {
        setTempExamination(res.data);
      }
    } else {
      const res = await api.put(`/appointment/${selectedAppointment}/status`, {
        status: "waiting_result",
      });
      const response = await api.post('/examination/temp_save',data);
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
          onSaveTerm={handleSaveTemp}
          onPatientInfo={setPatientInfo}
          selectedPatient={selectedPatient}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          selectedServices={selectedServices}
        />
        <div className="side-page">
          <PatientList
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
          />
        </div>
      </div>
    </div>
  );
};

export default ExaminationPage;
