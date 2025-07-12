"use client";
import { useState, useEffect } from "react";
import "./styles.css";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Convergence } from "next/font/google";
import { WeeklySchedule } from "@/interface/Shifts";

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
}

const DoctorProfile = () => {
  const params = useParams();
  const nameSlug = params.doctorNameSlug as string;

  const [expandedSections, setExpandedSections] = useState({
    experience: false,
    certificate: false,
    schedule: false,
  });
  const [age, setAge] = useState<number | null>(null);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/doctors/getDoctorBySlug?nameSlug=${nameSlug}`
        );
        setDoctorData(res.data);
        console.log(res.data);
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

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    }
  }, [doctorData?.dateOfBirth]);

  const toggleSection = (
    section: "experience" | "certificate" | "schedule"
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!doctorData) {
    return <div className="error">Không tìm thấy thông tin bác sĩ</div>;
  }

  const covertGender = (gender: string) => {
    return gender === "male" ? "Name" : "Nữ";
  };

  const handleBooking = () => {
    router.push(
      `/quan-ly/dat-lich-kham?doctorId=${doctorData._id}&specialtyId=${doctorData.specialtyId._id}&departmentId=${doctorData.departmentId._id}`
    );
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dayOfWeek] || `Ngày ${dayOfWeek}`;
};

  return (
    <div className="doctor-profile-container">
      <div className="profile-header">
        <h1>Thông tin Bác sĩ</h1>
      </div>

      <div className="profile-content">
        <div className="info-section">
          <div className="basic-info">
            <h2 className="doctor-name">{doctorData.fullName}</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Tuổi:</span>
                <span className="info-value">{age !== null ? age : "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Giới tính:</span>
                <span className="info-value">
                  {covertGender(doctorData.gender ?? "") || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Chuyên khoa:</span>
                <span className="info-value">
                  {doctorData.specialtyId.name}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Kinh nghiệm:</span>
                <span className="info-value">
                  {doctorData.experience?.length || 0} năm
                </span>
              </div>
            </div>
          </div>

          <div className="sections-container">
            {/* Experience Section */}
            <div
              className={`expandable-section ${
                expandedSections.experience ? "expanded" : ""
              }`}
            >
              <button
                className="expand-button"
                onClick={() => toggleSection("experience")}
              >
                <h3 className="section-titles">Kinh nghiệm làm việc</h3>
                <span className="expand-icon">
                  {expandedSections.experience ? "−" : "+"}
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
            <div
              className={`expandable-section ${
                expandedSections.certificate ? "expanded" : ""
              }`}
            >
              <button
                className="expand-button"
                onClick={() => toggleSection("certificate")}
              >
                <h3 className="section-titles">Chứng chỉ</h3>
                <span className="expand-icon">
                  {expandedSections.certificate ? "−" : "+"}
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
            {/*Schedule Section */}
            <div
              className={`expandable-section ${
                expandedSections.schedule ? "expanded" : ""
              }`}
            >
              <button
                className="expand-button"
                onClick={() => toggleSection("schedule")}
              >
                <h3 className="section-titles">Lịch làm việc</h3>
                <span className="expand-icon">
                  {expandedSections.schedule ? "−" : "+"}
                </span>
              </button>
              <div className="section-content">
                {doctorData.schedule &&
                doctorData.schedule.schedule ? (
                  <div className="schedule-container">
                    {/* Hiển thị trạng thái hoạt động */}
                    {typeof doctorData.schedule.isActive !==
                      "undefined" && (
                      <div className="schedule-status">
                        Trạng thái:
                        <span
                          className={
                            doctorData.schedule.isActive
                              ? "active"
                              : "inactive"
                          }
                        >
                          {doctorData.schedule.isActive
                            ? " Đang hoạt động"
                            : " Tạm ngừng"}
                        </span>
                      </div>
                    )}

                    {/* Sắp xếp theo dayOfWeek và hiển thị lịch */}
                    {doctorData.schedule.schedule
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((daySchedule) => {
                        const dayName = getDayName(daySchedule.dayOfWeek);
                        return (
                          <div
                            key={`day-${daySchedule.dayOfWeek}`}
                            className="day-schedule"
                          >
                            <h4 className="day-title">{dayName}</h4>
                            {daySchedule.shiftIds.length > 0 ? (
                              <ul className="shift-list">
                                {daySchedule.shiftIds.map((shift, index) => (
                                  <li
                                    key={`shift-${daySchedule.dayOfWeek}-${index}`}
                                  >
                                    <span className="shift-name">
                                      {shift.name}:{" "}
                                    </span>
                                    <span className="shift-time">
                                      {(shift.startTime)} -{" "}
                                      {(shift.endTime)}
                                    </span>
                                    {/* Có thể thêm location nếu cần */}
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
                ) : (
                  <p className="no-info">Chưa có thông tin lịch làm việc</p>
                )}
              </div>
            </div>
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
          </div>
          <div className="set-appointment-btn" onClick={handleBooking}>
            <button className="appointment-button">Đặt lịch hẹn</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
