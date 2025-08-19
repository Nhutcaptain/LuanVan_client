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
  const [selectedAppointmentsByDate, setSelectedAppointmentsByDate] = useState<Record<string, string[]>>({});
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentWeek, setCurrentWeek] = useState(getWeekRange(new Date()));
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().split("T")[0].substring(0, 7));

  function getWeekRange(date: Date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    };
  }

  function getMonthRange(monthString: string) {
    const [year, month] = monthString.split("-");
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0);
    
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0]
    };
  }

  const formatSession = (session: string) => {
    return session
      .replace(/(\d+)(AM|PM)/gi, (match, hour, period) => {
        const h = parseInt(hour);
        const time = period.toLowerCase() === "pm" && h !== 12 ? h + 12 : h === 12 && period.toLowerCase() === "am" ? 0 : h;
        return `${time.toString().padStart(2, "0")}:00`;
      })
      .replace("-", " - ");
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

  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) return;

      try {
        let params: any = {
          type: showType === "all" ? undefined : showType,
          view: viewMode
        };

        if (viewMode === "day") {
          params.date = selectedDate;
        } else if (viewMode === "week") {
          params.date = currentWeek.start;
        } else if (viewMode === "month") {
          params.date = currentMonth;
        }

        const res = await api.get(
          `/appointment/getAppointmentsByDoctor/${doctorId}`,
          { params }
        );

        if (res.status === 200) {
          const sortedAppointments = res.data.sort(
            (a: Appointment, b: Appointment) => {
              const dateA = new Date(`${a.appointmentDate}T${a.session.split("-")[0].includes("AM") ? "08" : "14"}:00:00`);
              const dateB = new Date(`${b.appointmentDate}T${b.session.split("-")[0].includes("AM") ? "08" : "14"}:00:00`);
              return dateA.getTime() - dateB.getTime();
            }
          );
          setAppointments(sortedAppointments);
          setSelectedAppointmentsByDate({});
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách lịch khám");
      }
    };

    fetchAppointments();
  }, [selectedDate, showType, viewMode, currentWeek, currentMonth]);

  const navigateWeek = (direction: "prev" | "next") => {
    const currentStart = new Date(currentWeek.start);
    const newDate = new Date(currentStart);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -7 : 7));
    setCurrentWeek(getWeekRange(newDate));
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonth.split("-");
    let newYear = parseInt(year);
    let newMonth = parseInt(month);
    
    if (direction === "prev") {
      newMonth = newMonth === 1 ? 12 : newMonth - 1;
      newYear = newMonth === 12 ? newYear - 1 : newYear;
    } else {
      newMonth = newMonth === 12 ? 1 : newMonth + 1;
      newYear = newMonth === 1 ? newYear + 1 : newYear;
    }
    
    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, "0")}`);
  };

  const groupAppointmentsByDate = () => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach(appointment => {
      if (!grouped[appointment.appointmentDate]) {
        grouped[appointment.appointmentDate] = [];
      }
      grouped[appointment.appointmentDate].push(appointment);
    });
    
    return grouped;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
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

  const toggleAppointmentSelection = (appointmentId: string, date: string) => {
    setSelectedAppointmentsByDate(prev => {
      const newState = { ...prev };
      if (!newState[date]) {
        newState[date] = [];
      }
      
      if (newState[date].includes(appointmentId)) {
        newState[date] = newState[date].filter(id => id !== appointmentId);
      } else {
        newState[date] = [...newState[date], appointmentId];
      }
      
      if (newState[date].length === 0) {
        delete newState[date];
      }
      
      return newState;
    });
  };

  const selectAllAppointmentsForDate = (date: string, appointments: Appointment[]) => {
    setSelectedAppointmentsByDate(prev => {
      const currentSelected = prev[date] || [];
      const allAppointmentIds = appointments
        .filter(app => app.confirmStatus === "pending")
        .map(app => app._id || "");
      
      if (currentSelected.length === allAppointmentIds.length && allAppointmentIds.length > 0) {
        const newState = { ...prev };
        delete newState[date];
        return newState;
      } else {
        return {
          ...prev,
          [date]: allAppointmentIds
        };
      }
    });
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
        toast.success("Xác nhận lịch hẹn thành công");
      }
    } catch (error) {
      Swal.close();
      toast.error("Lỗi khi xác nhận lịch hẹn");
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
        toast.success("Từ chối lịch hẹn thành công");
      }
    } catch (error) {
      Swal.close();
      toast.error("Lỗi khi từ chối lịch hẹn");
    }
  };

  const confirmAllForDate = async (date: string) => {
    const appointmentIds = selectedAppointmentsByDate[date] || [];
    if (appointmentIds.length === 0) return;

    try {
      Swal.fire({
        title: `Đang xác nhận ${appointmentIds.length} lịch hẹn`,
        icon: 'info',
        didOpen: () => Swal.showLoading()
      });

      const payload = {
        appointmentIds,
        action: "confirm"
      };

      const res = await api.post('/appointment/bulkConfirm', payload);

      if (res.status === 200) {
        setAppointments(prev => prev.map(app => 
          appointmentIds.includes(app._id || "") 
            ? { ...app, confirmStatus: "confirmed" } 
            : app
        ));
        
        setSelectedAppointmentsByDate(prev => {
          const newState = { ...prev };
          delete newState[date];
          return newState;
        });
        
        Swal.close();
        toast.success(`Đã xác nhận ${appointmentIds.length} lịch hẹn`);
      }
    } catch (error) {
      Swal.close();
      toast.error("Lỗi khi xác nhận lịch hẹn");
    }
  };

  const rejectAllForDate = async (date: string) => {
    const appointmentIds = selectedAppointmentsByDate[date] || [];
    if (appointmentIds.length === 0) return;

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
            title: `Đang từ chối ${appointmentIds.length} lịch hẹn`,
            icon: 'info',
            didOpen: () => Swal.showLoading()
          });

          const payload = {
            appointmentIds,
            action: "reject",
            reason: result.value
          };

          const res = await api.post('/appointment/bulkConfirm', payload);

          if (res.status === 200) {
            setAppointments(prev => prev.map(app => 
              appointmentIds.includes(app._id || "") 
                ? { ...app, confirmStatus: "rejected" } 
                : app
            ));
            
            setSelectedAppointmentsByDate(prev => {
              const newState = { ...prev };
              delete newState[date];
              return newState;
            });
            
            Swal.close();
            toast.success(`Đã từ chối ${appointmentIds.length} lịch hẹn`);
          }
        } catch (error) {
          Swal.close();
          toast.error("Lỗi khi từ chối lịch hẹn");
        }
      }
    });
  };

  const handleStopAppointments = async () => {
    try {
      const doctorId = localStorage.getItem("doctorId");
      if (!doctorId) return;
      
      Swal.fire({
        title: 'Đang dừng tất cả lịch khám',
        icon: 'info',
        didOpen: () => Swal.showLoading()
      });

      const payload = {
        date: selectedDate,
        type: stopType,
        cancelReason: "Bác sĩ bận đột xuất",
      };

      const res = await api.post(`/appointment/stopAppointments/${doctorId}`, payload);

      if (res.status === 200) {
        setIsStopModalOpen(false);
        setSelectedDate(selectedDate);
        Swal.close();
        toast.success("Đã dừng tất cả lịch khám thành công");
      }
    } catch (error) {
      Swal.close();
      toast.error("Lỗi khi dừng lịch hẹn");
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <li
      key={appointment._id}
      className={`appointment-card ${appointment.isOvertime ? "overtime" : ""}`}
    >
      {appointment.confirmStatus === "pending" && (
        <div className="appointment-checkbox">
          <input
            type="checkbox"
            checked={selectedAppointmentsByDate[appointment.appointmentDate]?.includes(appointment._id || "") || false}
            onChange={() => toggleAppointmentSelection(appointment._id || "", appointment.appointmentDate)}
          />
        </div>
      )}
      
      <div className="appointment-content" onClick={() => openAppointmentDetail(appointment)}>
        <div className="appointment-header">
          <span className={`appointment-status ${getStatusClass(appointment.status || "scheduled")}`}>
            {appointment.status === "scheduled" ? "Đã đặt"
              : appointment.status === "completed" ? "Hoàn thành"
              : appointment.status === "examining" ? "Đang khám"
              : appointment.status === "waiting_result" ? "Chờ kết quả"
              : "Đã hủy"}
          </span>
          
          <span className={`appointment-confirm-status ${getConfirmStatusClass(appointment.confirmStatus || "pending")}`}>
            {appointment.confirmStatus === "pending" ? "Chờ xác nhận"
              : appointment.confirmStatus === "confirmed" ? "Đã xác nhận"
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
            {(appointment.patientId as any)?.fullName || "Không có thông tin"}
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
  );

  const renderGroupedAppointments = () => {
    const grouped = groupAppointmentsByDate();
    
    return (
      <div className="grouped-appointments-container">
        {Object.entries(grouped).map(([date, dailyAppointments]) => {
          const selectedCount = selectedAppointmentsByDate[date]?.length || 0;
          const pendingAppointments = dailyAppointments.filter(app => app.confirmStatus === "pending");
          
          return (
            <div key={date} className="daily-appointments-group">
              <div className="group-header-container">
                <h3 className="group-date-header">
                  {formatDate(date)}
                  <span className="appointment-count">({dailyAppointments.length} lịch)</span>
                </h3>
                
                {pendingAppointments.length > 0 && (
                  <div className="select-all-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCount === pendingAppointments.length && pendingAppointments.length > 0}
                      onChange={() => selectAllAppointmentsForDate(date, dailyAppointments)}
                    />
                    <span>Chọn tất cả ({pendingAppointments.length} lịch chờ)</span>
                  </div>
                )}
              </div>
              
              {selectedCount > 0 && (
                <div className="bulk-actions-container">
                  <div className="bulk-actions-info">
                    Đã chọn {selectedCount} lịch hẹn
                  </div>
                  <div className="bulk-actions-buttons">
                    <button
                      className="btn-confirm-all"
                      onClick={() => confirmAllForDate(date)}
                    >
                      Xác nhận tất cả
                    </button>
                    <button
                      className="btn-reject-all"
                      onClick={() => rejectAllForDate(date)}
                    >
                      Từ chối tất cả
                    </button>
                  </div>
                </div>
              )}
              
              <ul className="appointments-list">
                {dailyAppointments.map(renderAppointmentCard)}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayViewAppointments = () => {
    const pendingAppointments = appointments.filter(app => app.confirmStatus === "pending");
    const selectedCount = selectedAppointmentsByDate[selectedDate]?.length || 0;
    
    return (
      <div className="appointments-list-container">
        <div className="appointments-list-header">
          <h3 className="appointments-date-header">
            {formatDate(selectedDate)}
          </h3>
          
          {pendingAppointments.length > 0 && (
            <div className="select-all-checkbox">
              <input
                type="checkbox"
                checked={selectedCount === pendingAppointments.length && pendingAppointments.length > 0}
                onChange={() => selectAllAppointmentsForDate(selectedDate, appointments)}
              />
              <span>Chọn tất cả ({pendingAppointments.length} lịch chờ)</span>
            </div>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="bulk-actions-container">
            <div className="bulk-actions-info">
              Đã chọn {selectedCount} lịch hẹn
            </div>
            <div className="bulk-actions-buttons">
              <button
                className="btn-confirm-all"
                onClick={() => confirmAllForDate(selectedDate)}
              >
                Xác nhận tất cả
              </button>
              <button
                className="btn-reject-all"
                onClick={() => rejectAllForDate(selectedDate)}
              >
                Từ chối tất cả
              </button>
            </div>
          </div>
        )}

        <ul className="appointments-list">
          {appointments.map(renderAppointmentCard)}
        </ul>
      </div>
    );
  };

  return (
    <div className="appointments-container">
      <h2 className="appointments-title">Danh sách lịch hẹn</h2>

      <div className="appointments-controls">
        <div className="control-group">
          <label>Chế độ xem:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === "day"}
                onChange={() => setViewMode("day")}
              />
              Theo ngày
            </label>
            <label>
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === "week"}
                onChange={() => setViewMode("week")}
              />
              Theo tuần
            </label>
            <label>
              <input
                type="radio"
                name="viewMode"
                checked={viewMode === "month"}
                onChange={() => setViewMode("month")}
              />
              Theo tháng
            </label>
          </div>
        </div>

        {viewMode === "day" && (
          <div className="control-group">
            <label htmlFor="appointment-date">Ngày:</label>
            <input
              type="date"
              id="appointment-date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        )}

        {viewMode === "week" && (
          <div className="control-group week-navigation">
            <button onClick={() => navigateWeek("prev")}>&lt; Tuần trước</button>
            <span>
              {formatDate(currentWeek.start)} - {formatDate(currentWeek.end)}
            </span>
            <button onClick={() => navigateWeek("next")}>Tuần sau &gt;</button>
          </div>
        )}

        {viewMode === "month" && (
          <div className="control-group month-navigation">
            <button onClick={() => navigateMonth("prev")}>&lt; Tháng trước</button>
            <span>
              Tháng {currentMonth.split("-")[1]}/{currentMonth.split("-")[0]}
            </span>
            <button onClick={() => navigateMonth("next")}>Tháng sau &gt;</button>
          </div>
        )}

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

        {/* <div className="control-group">
          <button 
            className="btn-stop-appointments"
            onClick={() => setIsStopModalOpen(true)}
          >
            Dừng lịch khám
          </button>
        </div> */}
      </div>

      {appointments.length === 0 ? (
        <p className="no-appointments">Không có lịch hẹn nào trong khoảng thời gian này</p>
      ) : viewMode === "day" ? (
        renderDayViewAppointments()
      ) : (
        renderGroupedAppointments()
      )}

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
                <span className={`appointment-status ${getStatusClass(selectedAppointment.status || "scheduled")}`}>
                  {selectedAppointment.status === "scheduled" ? "Đã đặt"
                    : selectedAppointment.status === "completed" ? "Hoàn thành"
                    : selectedAppointment.status === "examining" ? "Đang khám"
                    : selectedAppointment.status === "waiting_result" ? "Chờ kết quả"
                    : "Đã hủy"}
                </span>
                
                <span className={`appointment-confirm-status ${getConfirmStatusClass(selectedAppointment.confirmStatus || "pending")}`}>
                  {selectedAppointment.confirmStatus === "pending" ? "Chờ xác nhận"
                    : selectedAppointment.confirmStatus === "confirmed" ? "Đã xác nhận"
                    : "Đã từ chối"}
                </span>
                
                {selectedAppointment.isOvertime && (
                  <span className="overtime-badge">Ngoài giờ</span>
                )}
              </div>
            </div>

            <div className="modal-body">
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

              <div className="info-section">
                <h3 className="section-title">
                  <i className="icon-user"></i> Thông tin bệnh nhân
                </h3>
                <div className="info-card">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Họ và tên:</span>
                      <span className="info-value highlight">
                        {(selectedAppointment.patientId as any)?.fullName || "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Số điện thoại:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.phone || "Không có thông tin"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Ngày sinh:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.dateOfBirth
                          ? new Date((selectedAppointment.patientId as any).dateOfBirth)
                              .toLocaleDateString("vi-VN")
                          : "Không có thông tin"}
                      </span>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Giới tính:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.gender === "male" ? "Nam"
                          : (selectedAppointment.patientId as any)?.gender === "female" ? "Nữ"
                          : "Khác/Không có thông tin"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">
                        {(selectedAppointment.patientId as any)?.email || "Không có thông tin"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                          {(selectedAppointment.patientId as any)?.medicalHistory}
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