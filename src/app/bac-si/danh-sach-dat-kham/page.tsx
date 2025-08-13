"use client";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { Appointment } from "@/interface/AppointmentInterface";
import { toast, ToastContainer } from "react-toastify";
import api from "@/lib/axios";
import Swal from "sweetalert2";

const DoctorAppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showType, setShowType] = useState<"all" | "regular" | "overtime">("all");
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [stopType, setStopType] = useState<"day" | "session" | "overtime">("session");
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"confirm" | "reject">("confirm");
  const [rejectReason, setRejectReason] = useState("");

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
          console.log(sortedAppointments);
          setSelectedAppointments([]); // Reset selected appointments when data changes
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách lịch khám");
      }
    };

    fetchAppointments();
  }, [selectedDate, showType]);

  const getStartTime = (session: string) => {
    const timeMatch = session.match(/(\d+)(?:AM|PM)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      return `${hour.toString().padStart(2, "0")}:00:00`;
    }
    return "00:00:00";
  };

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

  const getConfirmStatusClass = (status: string) => {
    const confirmStatusClasses: Record<string, string> = {
      pending: "confirm-status-pending",
      confirmed: "confirm-status-confirmed",
      rejected: "confirm-status-rejected",
    };
    return confirmStatusClasses[status] || "";
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
      Swal.fire({
        title: 'Đang cập dừng tất cả lịch khám',
        icon: 'info',
        didOpen: () => Swal.showLoading()
      })

      const payload = {
        date: selectedDate,
        type: stopType,
        cancelReason: "Bác sĩ bận đột xuất",
      };

      const res = await api.post(`/appointment/stopAppointments/${doctorId}`, payload);

      if (res.status === 200) {
        setIsStopModalOpen(false);
        setSelectedDate(selectedDate); // Trigger useEffect
        Swal.close();
        Swal.fire({
          title: 'Đã dừng tất cả lịch khám thành công',
          icon: 'success',
          showConfirmButton: true,
        })
      }
    } catch (error) {
      toast.error("Lỗi khi dừng lịch hẹn");
      Swal.close();
      Swal.fire({
          title: 'Lỗi khi dừng lịch hẹn',
          icon: 'error',
          showConfirmButton: true,
        })
    }
  };

  const isRegularHours = (session: string) => {
    const timeMatch = session.match(/(\d+)(AM|PM)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const period = timeMatch[2].toLowerCase();
      return (hour >= 8 && period === "am") || (hour < 5 && period === "pm");
    }
    return false;
  };

  const toggleAppointmentSelection = (appointmentId: string) => {
    setSelectedAppointments(prev => 
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  const selectAllAppointments = () => {
    if (selectedAppointments.length === appointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(appointments.map(app => app._id || ""));
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    try {
      Swal.fire({
        title: 'Đang xác nhận lịch hẹn',
        icon: 'info',
        didOpen: () => Swal.showLoading()
      });

      const res = await api.patch(`/appointment/confirm/${appointmentId}`, {
        status: "confirmed"
      });

      if (res.status === 200) {
        setAppointments(prev => prev.map(app => 
          app._id === appointmentId ? { ...app, confirmStatus: "confirmed" } : app
        ));
        
        Swal.close();
        Swal.fire({
          title: 'Xác nhận lịch hẹn thành công',
          icon: 'success',
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: 'Lỗi khi xác nhận lịch hẹn',
        icon: 'error',
        showConfirmButton: true,
      });
    }
  };

  const rejectAppointment = async (appointmentId: string, reason: string) => {
    try {
      Swal.fire({
        title: 'Đang từ chối lịch hẹn',
        icon: 'info',
        didOpen: () => Swal.showLoading()
      });

      const res = await api.patch(`/appointment/confirm/${appointmentId}`, {
        status: "rejected",
        rejectReason: reason
      });

      if (res.status === 200) {
        setAppointments(prev => prev.map(app => 
          app._id === appointmentId ? { ...app, confirmStatus: "rejected" } : app
        ));
        
        Swal.close();
        Swal.fire({
          title: 'Từ chối lịch hẹn thành công',
          icon: 'success',
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: 'Lỗi khi từ chối lịch hẹn',
        icon: 'error',
        showConfirmButton: true,
      });
    }
  };

  const confirmAllSelected = async () => {
    if (selectedAppointments.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một lịch hẹn");
      return;
    }

    try {
      Swal.fire({
        title: `Đang xác nhận ${selectedAppointments.length} lịch hẹn`,
        icon: 'info',
        didOpen: () => Swal.showLoading()
      });

      const payload = {
        appointmentIds: selectedAppointments,
        action: "confirm"
      };

      const res = await api.post('/appointment/bulkConfirm', payload);

      if (res.status === 200) {
        setAppointments(prev => prev.map(app => 
          selectedAppointments.includes(app._id || "") 
            ? { ...app, confirmStatus: "confirmed" } 
            : app
        ));
        
        setSelectedAppointments([]);
        Swal.close();
        Swal.fire({
          title: 'Xác nhận lịch hẹn thành công',
          icon: 'success',
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: 'Lỗi khi xác nhận lịch hẹn',
        icon: 'error',
        showConfirmButton: true,
      });
    }
  };

  const rejectAllSelected = async () => {
    if (selectedAppointments.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một lịch hẹn");
      return;
    }

    Swal.fire({
      title: 'Lý do từ chối',
      input: 'text',
      inputPlaceholder: 'Nhập lý do từ chối...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          Swal.fire({
            title: `Đang từ chối ${selectedAppointments.length} lịch hẹn`,
            icon: 'info',
            didOpen: () => Swal.showLoading()
          });

          const payload = {
            appointmentIds: selectedAppointments,
            action: "reject",
            reason: result.value
          };

          const res = await api.post('/appointment/bulkConfirm', payload);

          if (res.status === 200) {
            setAppointments(prev => prev.map(app => 
              selectedAppointments.includes(app._id || "") 
                ? { ...app, confirmStatus: "rejected" } 
                : app
            ));
            
            setSelectedAppointments([]);
            Swal.close();
            Swal.fire({
              title: 'Từ chối lịch hẹn thành công',
              icon: 'success',
              showConfirmButton: true,
            });
          }
        } catch (error) {
          Swal.close();
          Swal.fire({
            title: 'Lỗi khi từ chối lịch hẹn',
            icon: 'error',
            showConfirmButton: true,
          });
        }
      }
    });
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

        <div className="control-group">
          {/* <button
            className="stop-appointments-btn"
            onClick={() => setIsStopModalOpen(true)}
          >
            Dừng lịch hẹn
          </button> */}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAppointments.length > 0 && (
        <div className="bulk-actions-container">
          <div className="bulk-actions-info">
            Đã chọn {selectedAppointments.length} lịch hẹn
          </div>
          <div className="bulk-actions-buttons">
            <button
              className="btn-confirm-all"
              onClick={confirmAllSelected}
            >
              Xác nhận tất cả
            </button>
            <button
              className="btn-reject-all"
              onClick={rejectAllSelected}
            >
              Từ chối tất cả
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <p className="no-appointments">Không có lịch hẹn nào trong ngày này</p>
      ) : (
        <div className="appointments-list-container">
          <div className="appointments-list-header">
            <h3 className="appointments-date-header">
              {formatDate(selectedDate)}
            </h3>
            
            <div className="select-all-checkbox">
              <input
                type="checkbox"
                checked={selectedAppointments.length === appointments.length && appointments.length > 0}
                onChange={selectAllAppointments}
              />
              <span>Chọn tất cả</span>
            </div>
          </div>

          <ul className="appointments-list">
            {appointments.map((appointment) => (
              <li
                key={appointment._id}
                className={`appointment-card ${
                  appointment.isOvertime ? "overtime" : ""
                }`}
              >
                <div className="appointment-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedAppointments.includes(appointment._id || "")}
                    onChange={() => toggleAppointmentSelection(appointment._id || "")}
                  />
                </div>
                
                <div className="appointment-content" onClick={() => openAppointmentDetail(appointment)}>
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
                    
                    <span
                      className={`appointment-confirm-status ${getConfirmStatusClass(
                        appointment.confirmStatus || "pending"
                      )}`}
                    >
                      {appointment.confirmStatus === "pending"
                        ? "Chờ xác nhận"
                        : appointment.confirmStatus === "confirmed"
                        ? "Đã xác nhận"
                        : "Đã từ chối"}
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
                </div>
                
                {appointment.confirmStatus === "pending" && (
                  <div className="appointment-actions">
                    <button
                      className="btn-confirm"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmAppointment(appointment._id || "");
                      }}
                    >
                      Xác nhận
                    </button>
                    <button
                      className="btn-reject"
                      onClick={(e) => {
                        e.stopPropagation();
                        Swal.fire({
                          title: 'Lý do từ chối',
                          input: 'text',
                          inputPlaceholder: 'Nhập lý do từ chối...',
                          showCancelButton: true,
                          confirmButtonText: 'Xác nhận',
                          cancelButtonText: 'Hủy',
                        }).then((result) => {
                          if (result.isConfirmed && result.value) {
                            rejectAppointment(appointment._id || "", result.value);
                          }
                        });
                      }}
                    >
                      Từ chối
                    </button>
                  </div>
                )}
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
                
                <span
                  className={`appointment-confirm-status ${getConfirmStatusClass(
                    selectedAppointment.confirmStatus || "pending"
                  )}`}
                >
                  {selectedAppointment.confirmStatus === "pending"
                    ? "Chờ xác nhận"
                    : selectedAppointment.confirmStatus === "confirmed"
                    ? "Đã xác nhận"
                    : "Đã từ chối"}
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
                
                {selectedAppointment.confirmStatus === "pending" && (
                  <>
                    <button 
                      className="btn btn-reject"
                      onClick={() => {
                        Swal.fire({
                          title: 'Lý do từ chối',
                          input: 'text',
                          inputPlaceholder: 'Nhập lý do từ chối...',
                          showCancelButton: true,
                          confirmButtonText: 'Xác nhận',
                          cancelButtonText: 'Hủy',
                        }).then((result) => {
                          if (result.isConfirmed && result.value) {
                            rejectAppointment(selectedAppointment._id || "", result.value);
                            closeAppointmentDetail();
                          }
                        });
                      }}
                    >
                      Từ chối
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        confirmAppointment(selectedAppointment._id || "");
                        closeAppointmentDetail();
                      }}
                    >
                      Xác nhận
                    </button>
                  </>
                )}
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
      
      <ToastContainer />
    </div>
  );
};

export default DoctorAppointmentsList;