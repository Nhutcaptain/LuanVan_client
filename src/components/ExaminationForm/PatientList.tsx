"use client";
import { useSocket } from "@/hook/useSocket";
import api from "@/lib/axios";
import React, { useEffect, useState } from "react";

interface PatientList {
  queueNumber: number;
  fullName: string;
  _id: string;
  status: string;
  patientId: {
    _id: string;
    fullName: string;
  };
  examinationId: string;
  testOrders: {
    serviceId: string;
    status: string;
    resultFileUrl: string;
  }[];
}

interface TestOrder {
  serviceId: string;
  status: string;
  resultFileUrl: string;
}

interface Props {
  onPatientSelected: (id: string) => void;
  doctorId: string;
  selectedPatient: string;
  onAppointmentSelected: (id: string) => void;
  onOvertimeChange: (e: boolean) => void;
}

const PatientList = (props: Props) => {
  const {
    onPatientSelected,
    doctorId,
    selectedPatient,
    onAppointmentSelected,
    onOvertimeChange,

  } = props;
  const [appointments, setAppointments] = useState<PatientList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOvertime, setIsOvertime] = useState(false)

  const { socket, joinRoom, leaveRoom } = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
    {
      eventHandlers: {
        "test-order-updated": ({
          patientId,
          testOrders,
        }: {
          patientId: string;
          testOrders: any[];
        }) => {
          setAppointments((prev) =>
            prev.map((app) =>
              app.patientId._id === patientId ? { ...app, testOrders } : app
            )
          );
        },
        "appointment-status-changed": (updatedAppointment: PatientList) => {
          setAppointments((prev) =>
            prev.map((app) =>
              app._id === updatedAppointment._id ? updatedAppointment : app
            )
          );
        },
      },
    }
  );

  // Fetch test orders for each examination
  const fetchTestOrders = async (examinationId: string) => {
    try {
      const res = await api.get(`appointment/testOrder/${examinationId}`);
      return res.data || [];
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    if (!doctorId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Join socket room
        joinRoom(`doctor-${doctorId}`);

        // Fetch appointments
        const res = await api.get(
          `/appointment/appointments/today/${doctorId}`
        );
        if (res.status === 200) {
          setIsOvertime(res.data.isOvertime);
          // Fetch test orders for each appointment in parallel
          const appointmentsWithTestOrders = await Promise.all(
            res.data.appointments.map(async (appointment: PatientList) => {
              if (appointment.examinationId) {
                const testOrders = await fetchTestOrders(
                  appointment.examinationId
                );
                return { ...appointment, testOrders };
              }
              return appointment;
            })
          );

          setAppointments(appointmentsWithTestOrders);
        }
      } catch (err: any) {
        if(err?.response?.status === 404) return;
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      leaveRoom(`doctor-${doctorId}`);
    };
  }, [doctorId, joinRoom, leaveRoom]);

  const handlePatientClick = async (appointment: PatientList) => {
    // Don't allow selection if status is completed
    if (appointment.status === "completed") {
      return;
    }

    onOvertimeChange(isOvertime);

    onPatientSelected(appointment.patientId._id);
    onAppointmentSelected(appointment._id);

    if (
      appointment.status !== "waiting_result" &&
      appointment.status !== "completed"
    ) {
      try {
        const res = await api.put(`/appointment/${appointment._id}/status`, {
          status: "examining",
        });
        if (res.status === 200) {
          setAppointments((prev) =>
            prev.map((app) => (app._id === res.data._id ? res.data : app))
          );
        }
      } catch (err) {
        console.error("Failed to update appointment status:", err);
      }
    }
  };

  const statusDisplayMap: Record<string, string> = {
    examining: "(Đang khám)",
    waiting_result: "(Chờ kết quả xét nghiệm)",
    completed: "(Đã khám xong)",
  };

  const countPendingTests = (testOrders: TestOrder[] = []) => {
    return testOrders.filter(
      (test) => test.status === "ordered" || test.status === "in_progress"
    ).length;
  };
  const areAllTestsCompleted = (testOrders: TestOrder[] = []) => {
    return (
      testOrders.length > 0 &&
      testOrders.every((test) => test.status === "completed")
    );
  };

  if (loading) {
    return (
      <div className="patient-list-container">
        Đang tải danh sách bệnh nhân...
      </div>
    );
  }

  if (error) {
    return <div className="patient-list-container text-red-500">{error}</div>;
  }

  return (
    <div className="patient-list-container">
      <h1 className="patient-list-title">Danh sách bệnh nhân</h1>

      <table className="patient-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên bệnh nhân</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => {
              const pendingTests = countPendingTests(appointment.testOrders);
              const isCompleted = appointment.status === "completed";
              
              return (
                <tr
                  key={appointment._id}
                  className={`patient-row ${
                    selectedPatient === appointment.patientId._id && !isCompleted
                      ? "patient-selected"
                      : ""
                  } ${
                    isCompleted ? "bg-green-100 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"
                  }`}
                  onClick={() => handlePatientClick(appointment)}
                >
                  <td className={isCompleted ? "italic" : ""}>{appointment.queueNumber}</td>
                  <td className={isCompleted ? "italic" : ""}>{appointment.patientId.fullName}</td>
                  <td className="flex flex-col">
                    {isCompleted ? (
                      <span className="text-green-600 italic">Đã khám xong</span>
                    ) : (
                      <>
                        {areAllTestsCompleted(appointment.testOrders) &&
                          appointment.status === "waiting_result" && (
                            <span className="text-green-600">
                              (Đã có kết quả xét nghiệm)
                            </span>
                          )}

                        {!areAllTestsCompleted(appointment.testOrders) &&
                          countPendingTests(appointment.testOrders) > 0 && (
                            <span className="text-orange-500">
                              {countPendingTests(appointment.testOrders)} xét nghiệm
                              đang chờ
                            </span>
                          )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3}>Không có bệnh nhân nào</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-buttons">
          <button className="pagination-button inactive" disabled>
            Trước
          </button>
          <button className="pagination-button active">1</button>
          <button className="pagination-button inactive">2</button>
          <button className="pagination-button inactive">Sau</button>
        </div>
      </div>
    </div>
  );
};

export default PatientList;