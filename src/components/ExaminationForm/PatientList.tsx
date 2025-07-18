"use client";
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
}

interface Props {
  onPatientSelected: (id: string) => void;
  doctorId: string;
  selectedPatient: string;
  onAppointmentSelected: (id: string) => void;
}

const PatientList = (props: Props) => {
  const { onPatientSelected, doctorId, selectedPatient, onAppointmentSelected } = props;
  const [appointments, setAppointments] = useState<PatientList[]>([]);
  const [patientStatusMap, setPatientStatusMap] = useState<{
    [patientId: string]: string;
  }>({});

  useEffect(() => {
    if (!doctorId) return;
    const fetchAppointmentToday = async () => {
      const res = await api.get(`/appointment/appointments/today/${doctorId}`);
      if (res.status === 200) {
        setAppointments(res.data.appointments);
      }
    };
    fetchAppointmentToday();
  }, [doctorId]);

  const handlePatientClick = (patientId: string) => {
    onPatientSelected(patientId);
    setPatientStatusMap((prev) => ({
      ...prev,
      [patientId]: "examining",
    }));
  };

  const statusDisplayMap: Record<string, string> = {
    examining: "(Đang khám)",
    waiting_result: "Chờ kết quả xét nghiệm",
    completed: "Hoàn tất khám",
  };

  return (
    <div className="patient-list-container">
      <h1 className="patient-list-title">Danh sách bệnh nhân</h1>

      <table className="patient-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên bệnh nhân</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
              <tr
                key={appointment._id}
                className={`${
                  selectedPatient === appointment.patientId._id
                    ? "patient-selected"
                    : ""
                }`}
                onClick={async () => {
                  onPatientSelected(appointment.patientId._id);
                  onAppointmentSelected(appointment._id);
                  const res = await api.put(`/appointment/${appointment._id}/status`, {
                    status: "examining",
                  });
                  if(res.status === 200) {
                    setAppointments(prev => 
                      prev.map(app => 
                        app._id === res.data._id ? res.data : app
                      )
                    )
                  }
                  
                }}
              >
                <td>{appointment.queueNumber}</td>
                <td className="">
                  <span>{appointment.patientId.fullName}</span>
                  <span>
                    {statusDisplayMap[appointment.status]}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>0</td>
              <td>Không có bệnh nhân nào</td>
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
