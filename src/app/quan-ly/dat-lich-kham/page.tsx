"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./styles.css";
import SelectComponent from "@/components/SelectComponent/SelectComponent";
import { IUser } from "@/interface/usermodel";
import api from "@/lib/axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import InputComponent from "@/components/InputComponent/InputComponent";
import {
  OvertimeSchedule,
  OvertimeSlot,
  WeeklySchedule,
} from "@/interface/Shifts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { get } from "http";
import Swal from "sweetalert2";
import { Service } from "@/interface/ServiceInterface";
import ServiceList from "./Services/ServiceList";
import { validatePatientInfo } from "@/utils/validatePatientInfo";

interface Department {
  _id: string;
  name: string;
}

interface Specialty {
  _id: string;
  name: string;
  departmentId: string;
  serviceIds: Service[];
}

interface Doctor {
  _id: string;
  name: string;
  specialtyId: string;
  departmentId: string;
  overtimeExaminationPrice: number;
  officeExaminationPrice: number
}

const AppointmentPage = () => {
  const router = useRouter();
  const [patient, setPatient] = useState<IUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const searchParams = useSearchParams();
  const [overtimeSchedule, setOvertimeSchedule] =
    useState<OvertimeSchedule | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<OvertimeSlot[]>(
    []
  );
  const [userId, setUserId] = useState("");
  const [showServiceList, setShowServiceList] = useState(false);
  const [consultationService, setConsultationService] = useState("");
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>();
  const [allowDayOfWeek, setAllowDayOfWeek] = useState<number[] | null>(null);

  const [formData, setFormData] = useState({
    departmentId: "",
    specialtyId: "",
    doctorId: "",
    appointmentDate: "",
    session: "",
    reason: "",
    agreeTerms: false,
    location: "",
  });

  const [loading, setLoading] = useState({
    patient: true,
    departments: true,
    specialties: false,
    doctors: false,
    dates: false,
    submitting: false,
  });

  useEffect(() => {
    const doctorId = searchParams.get("doctorId");
    const departmentId = searchParams.get("departmentId");
    const specialtyId = searchParams.get("specialtyId");
    const fetchUserId = async () => {
      if (!doctorId) return;
      try {
        const res = await api.get(`/users/getUserId/${doctorId}`);
        if (res.status === 200) {
          setUserId(res.data.userId);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy thông tin người dùng này");
      }
    };
    fetchUserId();

    setFormData((prev) => ({
      ...prev,
      departmentId: departmentId || "",
      specialtyId: specialtyId || "",
      doctorId: doctorId || "",
    }));
  }, []);

  // Fetch patient data from backend
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
      } finally {
        setLoading((prev) => ({ ...prev, patient: false }));
      }
    };

    fetchPatient();
  }, []);

  // Fetch departments from backend
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/department/getAllDepartment");

        if (res.status === 200) {
          setDepartments(res.data);
        } else {
          throw new Error("Failed to fetch departments");
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        toast.error("Không thể tải danh sách khoa");
      } finally {
        setLoading((prev) => ({ ...prev, departments: false }));
      }
    };

    fetchDepartments();
  }, []);

  // Fetch specialties when department is selected
  useEffect(() => {
    if (!formData.departmentId) {
      // setSpecialties([]);
      // setFormData(prev => ({ ...prev, specialtyId: '', doctorId: '' }));
      return;
    }

    const fetchSpecialties = async () => {
      try {
        setLoading((prev) => ({ ...prev, specialties: true }));
        const res = await api.get(
          `/department/getAllSpecialtyByDepartmentId/${formData.departmentId}`
        );

        if (res.status === 200) {
          setSpecialties(res.data);
        } else {
          throw new Error("Failed to fetch specialties");
        }
      } catch (err) {
        console.error("Failed to fetch specialties:", err);
        toast.error("Không thể tải danh sách chuyên khoa");
      } finally {
        setLoading((prev) => ({ ...prev, specialties: false }));
      }
    };

    fetchSpecialties();
  }, [formData.departmentId]);

  // Fetch doctors when either department or specialty is selected
  useEffect(() => {
    if (!formData.specialtyId) {
      return;
    }

    const fetchDoctors = async () => {
      try {
        setLoading((prev) => ({ ...prev, doctors: true }));
        const res = await api.get(
          `/doctors/getDoctorBySpecialtyId/${formData.specialtyId}`
        );

        if (res.status === 200) {
          setDoctors(res.data);
        } else {
          throw new Error("Failed to fetch doctors");
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        toast.error("Không thể tải danh sách bác sĩ");
      } finally {
        setLoading((prev) => ({ ...prev, doctors: false }));
      }
    };

    fetchDoctors();
  }, [formData.departmentId, formData.specialtyId]);

  useEffect(() => {
    if (!formData.doctorId) {
      setOvertimeSchedule(null);
      setAvailableTimeSlots([]);
      setFormData((prev) => ({ ...prev, appointmentDate: "", session: "" }));
      return;
    }

    const fetchOvertimeSchedule = async () => {
      try {
        if (!formData.doctorId) return;
        setLoading((prev) => ({ ...prev, dates: true }));
        const res = await api.get(
          `/schedule/getOvertimeSchedule/${formData.doctorId}`
        );

        if (res.status === 200) {
          setOvertimeSchedule(res.data);
        } else {
          throw new Error("Failed to fetch overtime schedule");
        }
      } catch (error: any) {
        if (error.status === 404) return;
        console.error("Failed to fetch overtime schedule:", error);
        toast.error("Không thể tải lịch khám ngoài giờ của bác sĩ");
      } finally {
        setLoading((prev) => ({ ...prev, dates: false }));
      }
    };
    const fetchWeeklySchedule = async () => {
      try {
        if (!formData.doctorId) return;
        const res = await api.get(
          `/schedule/getScheduleByDoctorId/${formData.doctorId}`
        );
        if (res.status === 200) {
          setWeeklySchedule(res.data);
        }
      } catch (error: any) {
        if (error.status === 404) return;
        toast.error("Không thể tải giờ làm việc của bác sĩ");
      }
    };
    fetchWeeklySchedule();

    fetchOvertimeSchedule();
  }, [formData.appointmentDate, formData.doctorId]);

  useEffect(() => {
    if (!formData.appointmentDate || !overtimeSchedule) {
      setAvailableTimeSlots([]);
      setFormData((prev) => ({ ...prev, session: "" }));
      return;
    }

    const selectedDate = new Date(formData.appointmentDate);
    const dayOfWeek = selectedDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    const weeklySlot = overtimeSchedule.weeklySchedule.find(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive
    );

    if (weeklySlot) {
      setAvailableTimeSlots(weeklySlot.slots);
    } else {
      setAvailableTimeSlots([]);
      toast.warning("Bác sĩ không có lịch khám ngoài giờ vào ngày này");
    }
  }, [overtimeSchedule]);

  useEffect(() => {
    if (consultationService === "officeConsultation" && weeklySchedule) {
      const availableDays = weeklySchedule.schedule.map((s) => s.dayOfWeek);
      setAllowDayOfWeek(availableDays);
    } else if (
      consultationService === "overtimeConsultation" &&
      overtimeSchedule
    ) {
      const availableDays = overtimeSchedule?.weeklySchedule.map(
        (item) => item.dayOfWeek
      );
      setAllowDayOfWeek(availableDays);
    }
  }, [consultationService, weeklySchedule, overtimeSchedule]);

  const isDateDisabled = (date: Date) => {
    if (!overtimeSchedule) return true;

    const dayOfWeek = date.getDay();
    return !overtimeSchedule.weeklySchedule.some(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive
    );
  };

  const getSelectedLocationId = () => {
    const selectedDayOfWeek = formData.appointmentDate
      ? new Date(formData.appointmentDate).getDay()
      : null;
    const selectedSchedule = overtimeSchedule?.weeklySchedule.find(
      (item) => item.dayOfWeek === selectedDayOfWeek
    );
    return selectedSchedule ? selectedSchedule.locationId : "";
  };

  const handleTimeSlotChange = (slot: OvertimeSlot) => {
    setFormData((prev) => ({
      ...prev,
      session: `${slot.startTime}-${slot.endTime}`,
      locationId: getSelectedLocation(),
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Nếu là checkbox, dùng checked; còn lại dùng value
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "date"
        ? new Date(value).toISOString().split("T")[0] // giữ định dạng yyyy-mm-dd
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validatePatientInfo(patient);
    if (validationError) {
      toast.info(validationError);
      return;
    }

    if (!formData.agreeTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và dịch vụ");
      return;
    }

    Swal.fire({
      title: "Đang xử lý",
      icon: "info",
      showLoaderOnConfirm: true,
    });

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));

      const res = await api.post("/appointment/createAppointment", {
        patientId: patient?._id,
        doctorId: formData.doctorId,
        departmentId: formData.departmentId,
        specialtyId: formData.specialtyId,
        appointmentDate: formData.appointmentDate,
        session: formData.session,
        reason: formData.reason,
        location: formData.location,
      });

      if (res.status === 201) {
        toast.success("Đặt lịch hẹn thành công!");
        Swal.close();
        Swal.fire({
          title: "Đặt lịch thành công",
          icon: "success",
          showConfirmButton: true,
        });
        setFormData({
          departmentId: "",
          specialtyId: "",
          doctorId: "",
          appointmentDate: "",
          session: "",
          reason: "",
          agreeTerms: false,
          location: "",
        });
      } else {
        throw new Error(res.data.message || "Failed to create appointment");
      }
    } catch (err: any) {
      console.error("Failed to submit appointment:", err);
      Swal.close();
      Swal.fire({
        title: "Có lỗi xảy ra",
        icon: "error",
        showCloseButton: true,
      });
      toast.error(err.message || "Đặt lịch hẹn thất bại. Vui lòng thử lại.");
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (loading.patient || loading.departments) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container">
        <div className="error-message">Không tìm thấy thông tin bệnh nhân</div>
      </div>
    );
  }

  const getSelectedLocation = () => {
    const selectedDayOfWeek = formData.appointmentDate
      ? new Date(formData.appointmentDate).getDay()
      : null;
    const selectedSchedule = overtimeSchedule?.weeklySchedule.find(
      (item) => item.dayOfWeek === selectedDayOfWeek
    );
    return selectedSchedule ? (selectedSchedule.locationId as any).name : "";
  };

  const getAvailableTimeSlots = () => {
    if (!formData.appointmentDate || !consultationService) return;
    const dayOfWeek = new Date(formData.appointmentDate).getDay();

    if (consultationService === "officeConsultation" && weeklySchedule) {
      const scheduleForDay = weeklySchedule.schedule.find(
        (s) => s.dayOfWeek === dayOfWeek
      );
      return (
        scheduleForDay?.shiftIds.map((shift) => ({
          startTime: shift.startTime,
          endTime: shift.endTime,
        })) ?? []
      );
    }

    if (consultationService === "overtimeConsultation" && overtimeSchedule) {
      const scheduleForDay = overtimeSchedule.weeklySchedule.find(
        (s) => s.dayOfWeek === dayOfWeek && s.isActive
      );
      return (
        scheduleForDay?.slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })) ?? []
      );
    }
    return [];
  };

  const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);
  const price = consultationService === 'overtimeConsultation' ? selectedDoctor?.overtimeExaminationPrice : selectedDoctor?.officeExaminationPrice;
  const selectedSpecialty = specialties.find(
    (d) => d._id === formData.specialtyId
  );
  const services = selectedSpecialty?.serviceIds;

  return (
    <div className="container">
      <h1 className="page-title">ĐẶT LỊCH HẸN KHÁM BỆNH</h1>

      {/* Patient information section */}
      <div className="patient-info-section">
        <h2 className="section-title">THÔNG TIN BỆNH NHÂN</h2>
        <div className="patient-info-grid">
          <div className="info-item">
            <label className="info-label">Họ và tên:</label>
            <p className="info-value">{patient.fullName}</p>
          </div>
          <div className="info-item">
            <label className="info-label">Email:</label>
            <p className="info-value">{patient.email}</p>
          </div>
          <div className="info-item">
            <label className="info-label">Số điện thoại:</label>
            <p className="info-value">{patient.phone}</p>
          </div>
          {patient.address && (
            <div className="info-item">
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

      {/* Appointment form */}
      <form onSubmit={handleSubmit} className="appointment-form">
        <h2 className="section-title">THÔNG TIN ĐẶT LỊCH</h2>

        <div className="form-grid">
          <div className="form-column">
            <SelectComponent
              label="Khoa*"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              options={departments.map((dept) => ({
                label: dept.name,
                value: dept._id,
              }))}
              required
            />
            <SelectComponent
              label="Bác sĩ*"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              options={doctors.map((doctor) => ({
                label: doctor.name,
                value: doctor._id,
              }))}
              disabled={
                (!formData.departmentId && !formData.specialtyId) ||
                loading.doctors
              }
              required
            />
          </div>

          <div className="form-column">
            <SelectComponent
              label="Chuyên khoa"
              name="specialtyId"
              value={formData.specialtyId}
              onChange={handleChange}
              options={specialties.map((spec) => ({
                label: spec.name,
                value: spec._id,
              }))}
              disabled={!formData.departmentId || loading.specialties}
            />
          </div>
        </div>
        <div className="consultation-type">
          <label>Loại dịch vụ khám*</label>
          <select
            name="consultationService"
            value={consultationService}
            onChange={(e) => setConsultationService(e.target.value)}
          >
            <option value="">-- Chọn loại dịch vụ --</option>
            <option value="officeConsultation">
              Khám trong giờ hành chính
            </option>
            <option value="overtimeConsultation">Khám ngoài giờ</option>
          </select>
        </div>

        <div className="date-session-container">
          <div className="form-group">
            <label htmlFor="appointmentDate" className="form-label">
              Ngày khám*
            </label>
            <DatePicker
              id="appointmentDate"
              selected={
                formData.appointmentDate
                  ? new Date(formData.appointmentDate)
                  : null
              }
              onChange={(date: Date | null) => {
                setFormData((prev) => ({
                  ...prev,
                  appointmentDate: date ? date.toISOString().split("T")[0] : "",
                }));
              }}
              minDate={new Date()}
              placeholderText="Chọn ngày khám"
              filterDate={(date: Date) =>
                (allowDayOfWeek ?? []).includes(date.getDay())
              }
              dateFormat="yyyy-MM-dd"
              className="form-input"
            />
          </div>

          {getAvailableTimeSlots() && getAvailableTimeSlots()!.length > 0 && (
            <div className="time-slot-picker">
              <label className="time-slot-label">Chọn khung giờ*</label>
              <div className="time-slot-options">
                {getAvailableTimeSlots()?.map((slot, index) => (
                  <button
                    type="button"
                    key={index}
                    className={`time-slot-option ${
                      formData.session === `${slot.startTime}-${slot.endTime}`
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleTimeSlotChange(slot)}
                  >
                    {`${slot.startTime} - ${slot.endTime}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.session && (
            <div className="location">
              <label className="location-label">Địa điểm*</label>
              <p className="location-value">
                {getSelectedLocation() || "Chưa chọn ngày khám"}
              </p>
            </div>
          )}
        </div>
        <div className="price-section">
          <div className="examination-price">
            <label className="price-label">Giá khám: </label>
            <p>
              {price
                ? new Intl.NumberFormat("vi-VN").format(price) + " đ"
                : "Miễn phí"}
            </p>
          </div>
          <p className="notes">
            *Lưu ý: đây là giá chưa bao gồm các xét nghiệm
          </p>
        </div>
        <div className="service-section">
          {showServiceList && (
            <ServiceList services={services ?? []}></ServiceList>
          )}
          {!showServiceList ? (
            <p
              className="show-list"
              onClick={() => setShowServiceList(!showServiceList)}
            >
              Xem các dịch vụ liên quan
            </p>
          ) : (
            <p
              className="hide-list"
              onClick={() => setShowServiceList(!showServiceList)}
            >
              Ẩn bớt
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reason" className="form-label">
            Triệu chứng/Lý do khám
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
            placeholder="Mô tả triệu chứng hoặc lý do khám của bạn..."
          />
        </div>

        <div className="terms-agreement">
          <label className="terms-label">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="terms-checkbox"
              required
            />
            <span className="terms-text">
              Tôi đồng ý với{" "}
              <a href="/terms" className="terms-link">
                điều khoản và dịch vụ
              </a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading.submitting}
        >
          {loading.submitting ? (
            <span className="button-loading">ĐANG XỬ LÝ...</span>
          ) : (
            <span>ĐẶT LỊCH NGAY</span>
          )}
        </button>
      </form>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default AppointmentPage;
