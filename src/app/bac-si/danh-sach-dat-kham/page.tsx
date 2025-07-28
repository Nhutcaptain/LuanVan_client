"use client";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { Appointment } from "@/interface/AppointmentInterface";
import { toast, ToastContainer } from "react-toastify";
import api from "@/lib/axios";

const DoctorAppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showType, setShowType] = useState<"all" | "regular" | "overtime">(
    "all"
  );
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [stopType, setStopType] = useState<"day" | "session" | "overtime">(
    "session"
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) return;

      try {
        const res = await api.get(
          `/appointment/getAppointmentsByDoctor/${doctorId}`,
          {
            params: {
              date: selectedDate,
              type: showType === "all" ? undefined : showType,
            },
          }
        );

        if (res.status === 200) {
          // Sắp xếp lịch hẹn theo thời gian
          const sortedAppointments = res.data.sort(
            (a: Appointment, b: Appointment) => {
              const dateA = new Date(
                `${a.appointmentDate}T${getStartTime(a.session)}`
              );
              const dateB = new Date(
                `${b.appointmentDate}T${getStartTime(b.session)}`
              );
              return dateA.getTime() - dateB.getTime();
            }
          );
          setAppointments(sortedAppointments);
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách lịch khám");
      }
    };

    fetchAppointments();
  }, [selectedDate, showType]);

  // Hàm lấy giờ bắt đầu từ session
  const getStartTime = (session: string) => {
    const timeMatch = session.match(/(\d+)(?:AM|PM)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      return `${hour.toString().padStart(2, "0")}:00:00`;
    }
    return "00:00:00";
  };

  // Định dạng ngày tháng
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

  // Định dạng session
  const formatSession = (session: string) => {
    // Chuyển đổi từ dạng "9AM-12PM" sang "09:00 - 12:00"
    const formatted = session
      .replace(/(\d+)(AM|PM)/gi, (match, hour, period) => {
        const h = parseInt(hour);
        const time = period.toLowerCase() === "pm" && h !== 12 ? h + 12 : h;
        return `${time.toString().padStart(2, "0")}:00`;
      })
      .replace("-", " - ");

    return formatted;
  };

  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      scheduled: "status-scheduled",
      completed: "status-completed",
      cancelled: "status-cancelled",
      examining: "status-examining",
      waiting_result: "status-waiting",
    };
    return statusClasses[status] || "";
  };

  const openAppointmentDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
    document.body.style.overflow = "hidden";
  };

  const closeAppointmentDetail = () => {
    setShowDetail(false);
    document.body.style.overflow = "auto";
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleStopAppointments = async () => {
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) return;

      const payload = {
        date: selectedDate,
        type: stopType,
        reason: "Bác sĩ bận đột xuất",
      };

      const res = await api.post(`/appointment/stopAppointments/${doctorId}`, payload);

      if (res.status === 200) {
        toast.success("Đã dừng lịch hẹn thành công");
        setIsStopModalOpen(false);
        // Refresh danh sách lịch hẹn
        setSelectedDate(selectedDate); // Trigger useEffect
      }
    } catch (error) {
      toast.error("Lỗi khi dừng lịch hẹn");
    }
  };

  const isRegularHours = (session: string) => {
    // Kiểm tra xem session có phải là giờ hành chính (8AM-5PM) không
    const timeMatch = session.match(/(\d+)(AM|PM)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const period = timeMatch[2].toLowerCase();
      return (hour >= 8 && period === "am") || (hour < 5 && period === "pm");
    }
    return false;
  };

  return (
    <div className="appointments-container">
      <h2 className="appointments-title">Danh sách lịch hẹn</h2>

      {/* Controls */}
      <div className="appointments-controls">
        <div className="control-group">
          <label htmlFor="appointment-date">Ngày:</label>
          <input
            type="date"
            id="appointment-date"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>

        <div className="control-group">
          <label>Loại lịch:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="showType"
                checked={showType === "all"}
                onChange={() => setShowType("all")}
              />
              Tất cả
            </label>
            <label>
              <input
                type="radio"
                name="showType"
                checked={showType === "regular"}
                onChange={() => setShowType("regular")}
              />
              Hành chính
            </label>
            <label>
              <input
                type="radio"
                name="showType"
                checked={showType === "overtime"}
                onChange={() => setShowType("overtime")}
              />
              Ngoài giờ
            </label>
          </div>
        </div>

        <button
          className="stop-appointments-btn"
          onClick={() => setIsStopModalOpen(true)}
        >
          Dừng lịch hẹn
        </button>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <p className="no-appointments">Không có lịch hẹn nào trong ngày này</p>
      ) : (
        <div className="appointments-list-container">
          <h3 className="appointments-date-header">
            {formatDate(selectedDate)}
          </h3>

          <ul className="appointments-list">
            {appointments.map((appointment) => (
              <li
                key={appointment._id}
                className={`appointment-card ${
                  appointment.isOvertime ? "overtime" : ""
                }`}
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
                      : appointment.status === "examining"
                      ? "Đang khám"
                      : appointment.status === "waiting_result"
                      ? "Chờ kết quả"
                      : "Đã hủy"}
                  </span>
                  <span className="appointment-time">
                    {formatSession(appointment.session)}
                  </span>
                  {appointment.isOvertime && (
                    <span className="overtime-badge">Ngoài giờ</span>
                  )}
                </div>

                <div className="appointment-body">
                  <p className="appointment-patient">
                    <strong>Bệnh nhân:</strong>{" "}
                    {(appointment.patientId as any)?.fullName ||
                      "Không có thông tin"}
                  </p>

                  {appointment.queueNumber && (
                    <p className="appointment-queue">
                      <strong>Số thứ tự:</strong> {appointment.queueNumber}
                    </p>
                  )}

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
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetail && selectedAppointment && (
        <div className="appointment-modal">
          <div className="modal-overlay" onClick={closeAppointmentDetail}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={closeAppointmentDetail}>
              &times;
            </button>

            <div className="modal-header">
              <h2 className="modal-title">Chi tiết lịch hẹn</h2>
              <div className="appointment-meta">
                <span
                  className={`appointment-status ${getStatusClass(
                    selectedAppointment.status || "scheduled"
                  )}`}
                >
                  {selectedAppointment.status === "scheduled"
                    ? "Đã đặt"
                    : selectedAppointment.status === "completed"
                    ? "Hoàn thành"
                    : selectedAppointment.status === "examining"
                    ? "Đang khám"
                    : selectedAppointment.status === "waiting_result"
                    ? "Chờ kết quả"
                    : "Đã hủy"}
                </span>
                {selectedAppointment.isOvertime && (
                  <span className="overtime-badge">Ngoài giờ</span>
                )}
              </div>
            </div>

            <div className="modal-body">
              {/* Thông tin chính */}
              <div className="info-card">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Ngày khám:</span>
                    <span className="info-value">
                      {formatDate(selectedAppointment.appointmentDate)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Giờ khám:</span>
                    <span className="info-value">
                      {formatSession(selectedAppointment.session)}
                    </span>
                  </div>
                </div>

                {selectedAppointment.queueNumber && (
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Số thứ tự:</span>
                      <span className="info-value">
                        {selectedAppointment.queueNumber}
                      </span>
                    </div>
                  </div>
                )}

                {selectedAppointment.location && (
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Địa điểm:</span>
                      <span className="info-value">
                        {selectedAppointment.location}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thông tin bệnh nhân */}
              <div className="info-section">
                <h3 className="section-title">
                  <i className="icon-user"></i> Thông tin bệnh nhân
                </h3>
                <div className="info-card">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Họ và tên:</span>
                      <span className="info-value highlight">
                        {(selectedAppointment.patientId as any)?.fullName ||
                          "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Số điện thoại:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.phone ||
                          "Không có thông tin"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Ngày sinh:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.dateOfBirth
                          ? new Date(
                              (selectedAppointment.patientId as any).dateOfBirth
                            ).toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Giới tính:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.gender ===
                        "male"
                          ? "Nam"
                          : (selectedAppointment.patientId as any)?.gender ===
                            "female"
                          ? "Nữ"
                          : "Khác/Không có thông tin"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.email ||
                          "Không có thông tin"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin khám bệnh */}
              <div className="info-section">
                <h3 className="section-title">
                  <i className="icon-medical"></i> Thông tin khám bệnh
                </h3>
                <div className="info-card">
                  <div className="info-row">
                    <div className="info-item full-width">
                      <span className="info-label">Lý do khám:</span>
                      <span className="info-value">
                        {selectedAppointment.reason || "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  {(selectedAppointment.patientId as any)?.medicalHistory && (
                    <div className="info-row">
                      <div className="info-item full-width">
                        <span className="info-label">Tiền sử bệnh:</span>
                        <span className="info-value">
                          {
                            (selectedAppointment.patientId as any)
                              ?.medicalHistory
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {(selectedAppointment.patientId as any)?.allergies && (
                    <div className="info-row">
                      <div className="info-item full-width">
                        <span className="info-label">Dị ứng:</span>
                        <span className="info-value">
                          {(selectedAppointment.patientId as any)?.allergies}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedAppointment.notes && (
                    <div className="info-row">
                      <div className="info-item full-width">
                        <span className="info-label">Ghi chú:</span>
                        <span className="info-value">
                          {selectedAppointment.notes}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={closeAppointmentDetail}
                >
                  Đóng
                </button>
                {/* {selectedAppointment.status === "scheduled" && (
                  <button className="btn btn-primary">Bắt đầu khám</button>
                )} */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stop Appointments Modal */}
      {isStopModalOpen && (
        <div className="appointment-modal">
          <div
            className="modal-overlay"
            onClick={() => setIsStopModalOpen(false)}
          ></div>
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setIsStopModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="modal-title">Dừng lịch hẹn</h2>

            <div className="detail-section">
              <p>
                Bạn đang dừng lịch hẹn cho ngày{" "}
                <strong>{formatDate(selectedDate)}</strong>
              </p>

              <div className="radio-group vertical">
                <label>
                  <input
                    type="radio"
                    name="stopType"
                    checked={stopType === "session"}
                    onChange={() => setStopType("session")}
                  />
                  Dừng ca hiện tại
                </label>
                <label>
                  <input
                    type="radio"
                    name="stopType"
                    checked={stopType === "day"}
                    onChange={() => setStopType("day")}
                  />
                  Dừng cả ngày
                </label>
                <label>
                  <input
                    type="radio"
                    name="stopType"
                    checked={stopType === "overtime"}
                    onChange={() => setStopType("overtime")}
                  />
                  Dừng các ca ngoài giờ
                </label>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setIsStopModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn-confirm"
                  onClick={handleStopAppointments}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default DoctorAppointmentsList;
