"use client";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { Appointment } from "@/interface/AppointmentInterface";
import { toast } from "react-toastify";
import { getDoctorIdByUserId } from "@/utils/user";
import api from "@/lib/axios";

const DoctorAppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const doctorId = await getDoctorIdByUserId();
      if (!doctorId) return;
      try {
        const res = await api.get(
          `/appointment/getAppointmentsByDoctor/${doctorId}`
        );
        if (res.status === 200) {
          setAppointments(res.data);
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách lịch khám");
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const today = new Date();
    const appointmentDate = new Date(dateString);

    if (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    ) {
      return "Hôm nay";
    }

    return appointmentDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatSession = (session: string) => {
    const sessionMap: Record<string, string> = {
      morning: "Buổi sáng (8:00 - 12:00)",
      afternoon: "Buổi chiều (13:00 - 17:00)",
      evening: "Buổi tối (18:00 - 20:00)",
    };
    return sessionMap[session] || session;
  };

  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      scheduled: "status-scheduled",
      completed: "status-completed",
      cancelled: "status-cancelled",
    };
    return statusClasses[status] || "";
  };

  const openAppointmentDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
    document.body.style.overflow = "hidden"; // Ngăn scroll khi modal mở
  };

  const closeAppointmentDetail = () => {
    setShowDetail(false);
    document.body.style.overflow = "auto"; // Cho phép scroll lại khi modal đóng
  };

  return (
    <div className="appointments-container">
      <h2 className="appointments-title">Danh sách lịch hẹn</h2>

      {appointments.length === 0 ? (
        <p className="no-appointments">Không có lịch hẹn nào</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map((appointment) => (
            <li
              key={appointment._id}
              className="appointment-card"
              onClick={() => openAppointmentDetail(appointment)}
            >
              <div className="appointment-header">
                <span
                  className={`appointment-status ${getStatusClass(
                    appointment.status || "scheduled"
                  )}`}
                >
                  {appointment.status === "scheduled"
                    ? "Đã đặt"
                    : appointment.status === "completed"
                    ? "Hoàn thành"
                    : "Đã hủy"}
                </span>
                <span className="appointment-date">
                  {formatDate(appointment.appointmentDate)}
                </span>
              </div>

              <div className="appointment-body">
                <p className="appointment-session">
                  <strong>Ca khám:</strong> {formatSession(appointment.session)}
                </p>

                <p className="appointment-patient">
                  <strong>Bệnh nhân:</strong>{" "}
                  {(appointment.patientId as any)?.fullName ||
                    "Không có thông tin"}
                </p>

                {appointment.reason && (
                  <p className="appointment-reason">
                    <strong>Lý do:</strong>{" "}
                    {appointment.reason.substring(0, 50)}
                    {appointment.reason.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Custom Modal hiển thị chi tiết lịch hẹn */}
      {showDetail && selectedAppointment && (
        <div className="appointment-modal">
          <div className="modal-overlay" onClick={closeAppointmentDetail}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={closeAppointmentDetail}>
              &times;
            </button>
            <h2 className="modal-title">Chi tiết lịch hẹn</h2>

            <div className="detail-section">
              <h3>Thông tin lịch hẹn</h3>
              <div className="detail-row">
                <span className="detail-label">Ngày khám:</span>
                <span className="detail-value">
                  {formatDate(selectedAppointment.appointmentDate)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ca khám:</span>
                <span className="detail-value">
                  {formatSession(selectedAppointment.session)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trạng thái:</span>
                <span
                  className={`detail-value ${getStatusClass(
                    selectedAppointment.status || "scheduled"
                  )}`}
                >
                  {selectedAppointment.status === "scheduled"
                    ? "Đã đặt"
                    : selectedAppointment.status === "completed"
                    ? "Hoàn thành"
                    : "Đã hủy"}
                </span>
              </div>
              {selectedAppointment.location && (
                <div className="detail-row">
                  <span className="detail-label">Địa điểm:</span>
                  <span className="detail-value">
                    {selectedAppointment.location}
                  </span>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Thông tin bệnh nhân</h3>
              <div className="detail-row">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.fullName ||
                    "Không có thông tin"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.phone ||
                    "Không có thông tin"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.email ||
                    "Không có thông tin"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ngày sinh:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.dateOfBirth
                    ? new Date(
                        (selectedAppointment.patientId as any).dateOfBirth
                      ).toLocaleDateString("vi-VN")
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Giới tính:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.gender === "male"
                    ? "Nam"
                    : (selectedAppointment.patientId as any)?.gender ===
                      "female"
                    ? "Nữ"
                    : "Khác/Không có thông tin"}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Thông tin khám bệnh</h3>
              <div className="detail-row">
                <span className="detail-label">Lý do khám:</span>
                <span className="detail-value">
                  {selectedAppointment.reason || "Không có thông tin"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tiền sử bệnh:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.medicalHistory ||
                    "Không có thông tin"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dị ứng:</span>
                <span className="detail-value">
                  {(selectedAppointment.patientId as any)?.allergies ||
                    "Không có thông tin"}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className="detail-row">
                  <span className="detail-label">Ghi chú:</span>
                  <span className="detail-value">
                    {selectedAppointment.notes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentsList;
