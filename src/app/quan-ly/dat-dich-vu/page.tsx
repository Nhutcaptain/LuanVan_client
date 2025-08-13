"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { IUser } from "@/interface/usermodel";

interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  available: boolean;
}

const AppointmentPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [patient, setPatient] = useState<IUser | null>(null);
  const router = useRouter();

  // Lấy danh sách dịch vụ tiêm chủng
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/service/getAllVaccination");
        if (res.status === 200) {
          setServices(res.data);
        }
      } catch (error: any) {
        toast.error("Không thể tải danh sách dịch vụ");
      }
    };
    fetchServices();
  }, []);

  // Lấy thông tin bệnh nhân
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200) {
          setPatient(res.data);
        } else {
          throw new Error("Failed to fetch patient");
        }
      } catch (err) {
        console.error("Failed to fetch patient:", err);
        toast.error("Không thể tải thông tin bệnh nhân");
      }
    };
    fetchPatient();
  }, []);

  // Tạo danh sách khung giờ khi ngày thay đổi
  useEffect(() => {
    if (!selectedDate) return;
    const fetchTimeSlots = async () => {
      const res = await api.get(`/service/available-timeslots`, {
        params: {
          serviceId: selectedService?._id,
          date: selectedDate.toString(),
        },
      });

      setTimeSlots(res.data.data);
      setSelectedTimeSlot(null);
    };
    fetchTimeSlots();
  }, [selectedDate]);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 7; // Bắt đầu từ 7:00
    const endHour = 17; // Kết thúc lúc 17:00
    const interval = 30; // Mỗi 30 phút

    for (let hour = startHour; hour < endHour; hour++) {
      // Bỏ qua khoảng thời gian nghỉ trưa (11:30 - 13:30)
      if (hour === 11) continue;
      if (hour === 12) continue;
      if (hour === 13 && 0 < 30) continue;

      for (let minute = 0; minute < 60; minute += interval) {
        // Bỏ qua khung giờ 11:30
        if (hour === 11 && minute === 30) continue;

        const startTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const endMinute = minute + interval;
        const endHourAdjusted = endMinute >= 60 ? hour + 1 : hour;
        const endMinuteAdjusted = endMinute >= 60 ? endMinute - 60 : endMinute;
        const endTime = `${endHourAdjusted
          .toString()
          .padStart(2, "0")}:${endMinuteAdjusted.toString().padStart(2, "0")}`;

        slots.push({
          startTime,
          endTime,
          displayTime: `${startTime} - ${endTime}`,
          available: Math.random() > 0.3, // Mock - 70% khung giờ available
        });
      }
    }

    setTimeSlots(slots);
    setSelectedTimeSlot(null); // Reset selected time khi đổi ngày
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedService ||
      !selectedDate ||
      !selectedTimeSlot ||
      !agreeToTerms
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin và đồng ý với điều khoản");
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentDateTime = new Date(
        `${selectedDate}T${selectedTimeSlot.startTime}:00`
      );

      const response = await api.post("/appointment/createVacAppointment", {
        patientId: patient?._id,
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        date: appointmentDateTime,
        time: selectedTimeSlot.displayTime,
        // Các trường khác sẽ được xử lý ở backend
      });

      if (response.status === 201) {
        setSubmitSuccess(true);
        toast.success("Đặt lịch tiêm chủng thành công!");

        // Redirect sau 2 giây
        setTimeout(() => {
          router.push("/appointments");
        }, 2000);
      } else {
        throw new Error("Đặt lịch thất bại");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1); // Ngày mai là ngày sớm nhất có thể đặt
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Tối đa 3 tháng sau

  if (!patient) {
    return (
      <div className="container">
        <div className="error-message">
          Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.
        </div>
      </div>
    );
  }

  return (
    <div className="vaccination-booking-container">
      <header className="booking-header">
        <h1>ĐẶT LỊCH TIÊM CHỦNG</h1>
        <p className="booking-subtitle">
          Vui lòng chọn dịch vụ và thời gian phù hợp
        </p>
      </header>

      <main className="booking-main">
        {submitSuccess ? (
          <div className="booking-success">
            <div className="success-icon">✓</div>
            <h2>Đặt lịch tiêm chủng thành công!</h2>
            <p>Bạn sẽ được chuyển đến trang lịch hẹn trong giây lát...</p>
          </div>
        ) : (
          <>
            <div className="patient-info-section">
              <h2 className="section-title">THÔNG TIN BỆNH NHÂN</h2>
              <div className="patient-info-grid">
                <div className="info-item">
                  <label className="info-label">Họ và tên:</label>
                  <p className="info-value">{patient.fullName}</p>
                </div>
                <div className="info-item">
                  <label className="info-label">Ngày sinh:</label>
                  <p className="info-value">
                    {patient.dateOfBirth
                      ? new Date(patient.dateOfBirth).toLocaleDateString()
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="info-item">
                  <label className="info-label">Giới tính:</label>
                  <p className="info-value">
                    {patient.gender === "male"
                      ? "Nam"
                      : patient.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </p>
                </div>
                <div className="info-item">
                  <label className="info-label">Số điện thoại:</label>
                  <p className="info-value">
                    {patient.phone || "Chưa cập nhật"}
                  </p>
                </div>
                {patient.address && (
                  <div className="info-item full-width">
                    <label className="info-label">Địa chỉ:</label>
                    <div className="address-details">
                      {patient.address.houseNumber && (
                        <span>{patient.address.houseNumber}, </span>
                      )}
                      <span>{patient.address.ward.name}, </span>
                      <span>{patient.address.district.name}, </span>
                      <span>{patient.address.province.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="service-selection-section">
              <h2 className="section-title">CHỌN DỊCH VỤ TIÊM CHỦNG</h2>

              <div className="booking-search">
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ tiêm chủng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="booking-search-input"
                />
              </div>

              <div className="services-container">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service._id}
                      className={`service-item ${
                        selectedService?._id === service._id ? "active" : ""
                      }`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <h3>{service.name}</h3>
                      <p className="service-description">
                        {service.description}
                      </p>
                      <div className="service-meta">
                        <span className="service-price">
                          {service.price.toLocaleString()} VND
                        </span>
                        <span className="service-duration">
                          {service.duration} phút
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    Không tìm thấy dịch vụ phù hợp
                  </div>
                )}
              </div>
            </div>

            {selectedService && (
              <div className="selected-service-section">
                <h2 className="section-title">DỊCH VỤ ĐÃ CHỌN</h2>
                <div className="selected-service-card">
                  <h3>{selectedService.name}</h3>
                  <p className="service-description">
                    {selectedService.description}
                  </p>
                  <div className="service-details">
                    <div className="detail-item">
                      <span className="detail-label">Giá:</span>
                      <span className="detail-value">
                        {selectedService.price.toLocaleString()} VND
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Thời gian:</span>
                      <span className="detail-value">
                        {selectedService.duration} phút
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-section">
                <h2 className="section-title">CHỌN THỜI GIAN</h2>

                <div className="form-field">
                  <label htmlFor="appointment-date">Ngày tiêm:</label>
                  <input
                    type="date"
                    id="appointment-date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDate.toISOString().split("T")[0]}
                    max={maxDate.toISOString().split("T")[0]}
                    required
                  />
                </div>

                {selectedDate && (
                  <div className="form-field">
                    <label>Khung giờ trống:</label>
                    <div className="time-slots-container">
                      {timeSlots.length > 0 ? (
                        timeSlots.map((slot, index) => (
                          <button
                            type="button"
                            key={index}
                            className={`time-slot ${
                              !slot.available ? "disabled" : ""
                            } ${
                              selectedTimeSlot?.displayTime === slot.displayTime
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              slot.available && setSelectedTimeSlot(slot)
                            }
                            disabled={!slot.available}
                          >
                            {slot.displayTime}
                            {!slot.available && (
                              <span className="slot-status">(Hết chỗ)</span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="no-slots">Đang tải khung giờ...</div>
                      )}
                    </div>
                    <div className="lunch-notice">
                      <p>
                        ⚠️ Không có lịch tiêm từ 11:30 - 13:30 (giờ nghỉ trưa)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="terms-section">
                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                  />
                  <label htmlFor="agree-terms">
                    Tôi đồng ý với{" "}
                    <a href="/terms" target="_blank">
                      điều khoản và điều kiện
                    </a>{" "}
                    khi đặt lịch tiêm chủng. Tôi hiểu rằng nếu hủy lịch hẹn cần
                    thực hiện trước 24 giờ.
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => router.back()}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={
                    isSubmitting ||
                    !selectedService ||
                    !selectedDate ||
                    !selectedTimeSlot ||
                    !agreeToTerms
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Đang đặt lịch...
                    </>
                  ) : (
                    "Xác nhận đặt lịch"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default AppointmentPage;
