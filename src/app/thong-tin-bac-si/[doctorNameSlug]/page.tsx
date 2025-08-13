"use client";
import { useState, useEffect } from "react";
import "./styles.css";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { FaChevronDown, FaChevronUp, FaCalendarAlt, FaUserMd, FaGraduationCap, FaAward, FaVenusMars, FaBirthdayCake, FaBriefcaseMedical, FaClock } from "react-icons/fa";
import { WeeklySchedule } from "@/interface/Shifts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Doctor {
  _id: string;
  fullName: string;
  avatar: {
    publicId: string;
    url: string;
  };
  certificate: string[];
  experience: string[];
  departmentId: {
    _id: string;
    name: string;
  };
  specialtyId: {
    _id: string;
    name: string;
  };
  schedule: WeeklySchedule;
  dateOfBirth: Date;
  gender?: string;
  degree: string;
  academicTitle: string;
  description: string;
}

interface OvertimeSlot {
  startTime: string;
  endTime: string;
}

interface PausePeriod {
  startDate: Date;
  endDate: Date;
  reason: string;
}

interface WeeklyOvertimeSlot {
  dayOfWeek: number;
  isActive: boolean;
  slots: OvertimeSlot[];
  pausePeriods: PausePeriod[];
  locationId: string;
}

interface OvertimeSchedule {
  doctorId: string;
  weeklySchedule: WeeklyOvertimeSlot[];
}

const DoctorProfile = () => {
  const params = useParams();
  const nameSlug = params.doctorNameSlug as string;

  const [expandedSections, setExpandedSections] = useState({
    experience: false,
    certificate: false,
    schedule: false,
    overtime: false,
  });
  const [age, setAge] = useState<number | null>(null);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [overtimeSchedule, setOvertimeSchedule] = useState<OvertimeSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) setRole(role);
    
    const fetchData = async () => {
      try {
        const res = await api.get(`/doctors/getDoctorBySlug?nameSlug=${nameSlug}`);
        setDoctorData(res.data);
        
        // Fetch overtime schedule after getting doctor data
        if (res.data?._id) {
          try {
            const overtimeRes = await api.get(`/schedule/getOvertimeSchedule/${res.data._id}`);
            setOvertimeSchedule(overtimeRes.data);
          } catch (error) {
            console.error("Error fetching overtime schedule:", error);
            setOvertimeSchedule(null);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nameSlug]);

  useEffect(() => {
    if (doctorData?.dateOfBirth) {
      const birthDate = new Date(doctorData.dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    }
  }, [doctorData?.dateOfBirth]);

  const toggleSection = (section: "experience" | "certificate" | "schedule" | "overtime") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const covertGender = (gender: string) => {
    return gender === "male" ? "Nam" : "Nữ";
  };

  const handleBooking = () => {
    router.push(
      `/quan-ly/dat-lich-kham?doctorId=${doctorData?._id}&specialtyId=${doctorData?.specialtyId._id}&departmentId=${doctorData?.departmentId._id}`
    );
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dayOfWeek] || `Ngày ${dayOfWeek}`;
  };

  const getPrefixTitle = (academicTitle?: string, degree?: string) => {
    const titleMap: Record<string, string> = {
      "Associate Professor": "PGS",
      "Professor": "GS",
    };

    const degreeMap: Record<string, string> = {
      "PhD": "Tiến sĩ",
      "Master": "Thạc sĩ",
      "Doctor": "Bác sĩ",
    };

    const title = titleMap[academicTitle || ""] || "";
    const degreeShort = degreeMap[degree || ""] || "";

    const prefixParts = [title, degreeShort].filter(Boolean);
    return prefixParts.join(".");
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const isOvertimeActive = () => {
    if (!overtimeSchedule) return false;
    return overtimeSchedule.weeklySchedule.some(day => day.isActive && day.slots.length > 0);
  };

  if (loading) {
    return (
      <div className="doctor-profile-container">
        <div className="profile-header">
          <Skeleton height={40} width={300} />
        </div>
        <div className="profile-content">
          <div className="info-section">
            <div className="basic-info">
              <Skeleton height={40} width="70%" />
              <div className="info-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="info-item">
                    <Skeleton height={20} width="100%" />
                  </div>
                ))}
              </div>
              <div className="info-item">
                <Skeleton height={80} />
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="expandable-section">
                <Skeleton height={50} />
              </div>
            ))}
          </div>
          <div className="image-section">
            <Skeleton height={300} width={250} />
          </div>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="doctor-profile-container">
        <div className="error-message">
          <h2>Không tìm thấy thông tin bác sĩ</h2>
          <p>Xin vui lòng kiểm tra lại đường dẫn hoặc quay lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-container">
      <div className="profile-header">
        <h1>
          <FaUserMd className="header-icon" />
          Thông tin Bác sĩ
        </h1>
      </div>

      <div className="profile-content">
        <div className="info-section">
          <div className="basic-info">
            <h2 className="doctor-name">
              {getPrefixTitle(doctorData.academicTitle, doctorData.degree)} {doctorData.fullName}
            </h2>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">
                  <FaBirthdayCake className="info-icon" /> Tuổi:
                </span>
                <span className="info-value">{age !== null ? age : "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaVenusMars className="info-icon" /> Giới tính:
                </span>
                <span className="info-value">
                  {covertGender(doctorData.gender ?? "") || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaBriefcaseMedical className="info-icon" /> Chuyên khoa:
                </span>
                <span className="info-value">
                  {doctorData.departmentId.name}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaAward className="info-icon" /> Kinh nghiệm:
                </span>
                <span className="info-value">
                  {doctorData.experience?.length || 0} năm
                </span>
              </div>
            </div>
            
            <div className="info-item description-item">
              <span className="info-label intro">
                <FaUserMd className="info-icon" /> Giới thiệu
              </span>
              <p className="info-value intro">
                {doctorData.description || "Chưa có thông tin giới thiệu"}
              </p>
            </div>
          </div>

          <div className="sections-container">
            {/* Experience Section */}
            <div className={`expandable-section ${expandedSections.experience ? "expanded" : ""}`}>
              <button className="expand-button" onClick={() => toggleSection("experience")}>
                <h3 className="section-title">
                  <FaBriefcaseMedical className="section-icon" /> Kinh nghiệm làm việc
                </h3>
                <span className="expand-icon">
                  {expandedSections.experience ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div className="section-content">
                {doctorData.experience && doctorData.experience.length > 0 ? (
                  <ul className="styled-list">
                    {doctorData.experience.map((exp, index) => (
                      <li key={`exp-${index}`}>
                        <span className="list-bullet">•</span>
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-info">Chưa có thông tin kinh nghiệm</p>
                )}
              </div>
            </div>

            {/* Certificate Section */}
            <div className={`expandable-section ${expandedSections.certificate ? "expanded" : ""}`}>
              <button className="expand-button" onClick={() => toggleSection("certificate")}>
                <h3 className="section-title">
                  <FaGraduationCap className="section-icon" /> Chứng chỉ
                </h3>
                <span className="expand-icon">
                  {expandedSections.certificate ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div className="section-content">
                {doctorData.certificate && doctorData.certificate.length > 0 ? (
                  <ul className="styled-list">
                    {doctorData.certificate.map((cert, index) => (
                      <li key={`cert-${index}`}>
                        <span className="list-bullet">•</span>
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-info">Chưa có thông tin chứng chỉ</p>
                )}
              </div>
            </div>

            {/* Regular Schedule Section */}
            <div className={`expandable-section ${expandedSections.schedule ? "expanded" : ""}`}>
              <button className="expand-button" onClick={() => toggleSection("schedule")}>
                <h3 className="section-title">
                  <FaCalendarAlt className="section-icon" /> Lịch làm việc chính
                </h3>
                <span className="expand-icon">
                  {expandedSections.schedule ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>
              <div className="section-content">
                {doctorData.schedule && doctorData.schedule.schedule ? (
                  <div className="schedule-container">
                    {typeof doctorData.schedule.isActive !== "undefined" && (
                      <div className="schedule-status">
                        Trạng thái:
                        <span className={doctorData.schedule.isActive ? "active" : "inactive"}>
                          {doctorData.schedule.isActive ? " Đang hoạt động" : " Tạm ngừng"}
                        </span>
                      </div>
                    )}

                    <div className="schedule-grid">
                      {doctorData.schedule.schedule
                        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                        .map((daySchedule) => {
                          const dayName = getDayName(daySchedule.dayOfWeek);
                          return (
                            <div key={`day-${daySchedule.dayOfWeek}`} className="day-schedule">
                              <h4 className="day-title">{dayName}</h4>
                              {daySchedule.shiftIds.length > 0 ? (
                                <ul className="shift-list">
                                  {daySchedule.shiftIds.map((shift, index) => (
                                    <li key={`shift-${daySchedule.dayOfWeek}-${index}`}>
                                      <span className="shift-name">{shift.name}: </span>
                                      <span className="shift-time">
                                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="no-shift">Không có ca làm việc</p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <p className="no-info">Chưa có thông tin lịch làm việc</p>
                )}
              </div>
            </div>

            {/* Overtime Schedule Section */}
            {isOvertimeActive() && (
              <div className={`expandable-section ${expandedSections.overtime ? "expanded" : ""}`}>
                <button className="expand-button" onClick={() => toggleSection("overtime")}>
                  <h3 className="section-title">
                    <FaClock className="section-icon" /> Lịch làm việc ngoài giờ
                  </h3>
                  <span className="expand-icon">
                    {expandedSections.overtime ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                <div className="section-content">
                  {overtimeSchedule?.weeklySchedule ? (
                    <div className="schedule-container">
                      <div className="schedule-grid">
                        {overtimeSchedule.weeklySchedule
                          .filter(day => day.isActive && day.slots.length > 0)
                          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                          .map((daySchedule) => {
                            const dayName = getDayName(daySchedule.dayOfWeek);
                            return (
                              <div key={`overtime-day-${daySchedule.dayOfWeek}`} className="day-schedule">
                                <h4 className="day-title">{dayName}</h4>
                                {daySchedule.slots.length > 0 ? (
                                  <ul className="shift-list">
                                    {daySchedule.slots.map((slot, index) => (
                                      <li key={`overtime-slot-${daySchedule.dayOfWeek}-${index}`}>
                                        <span className="shift-name">Ca ngoài giờ: </span>
                                        <span className="shift-time">
                                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="no-shift">Không có ca làm việc ngoài giờ</p>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <p className="no-info">Chưa có thông tin lịch làm việc ngoài giờ</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="image-section">
          <div className="avatar-container">
            <img
              src={doctorData.avatar?.url || "/default-avatar.jpg"}
              alt={`${doctorData.fullName}'s avatar`}
              className="doctor-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.jpg";
              }}
            />
            {role === 'patient' && (
              <button className="appointment-button" onClick={handleBooking}>
                <FaCalendarAlt className="button-icon" />
                Đặt lịch hẹn
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;