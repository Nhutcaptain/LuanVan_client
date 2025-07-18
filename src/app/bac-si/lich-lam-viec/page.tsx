// pages/doctor-schedule.tsx
"use client";
import { useState, useEffect } from "react";
import DoctorScheduleCalendar from "@/components/ScheduleComponent/DoctorScheduleCalendar";
import {
  Shift,
  SpecialSchedule,
  WeeklySchedule,
  OvertimeSchedule,
  weeklySlotSchema,
} from "@/interface/Shifts";
import api from "@/lib/axios";
import { jwtDecode } from "jwt-decode";
import OvertimeScheduleForm from "@/components/ManageScheduleComponents/OvertimeScheduleForm";
import "./styles.css";

interface DecodedToken {
  userId?: string;
}

const getDoctorIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.userId;
  } catch (error) {
    console.error("Không thể decode token", error);
    return "";
  }
};

const DoctorSchedulePage = () => {
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule | null>(
    null
  );
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<SpecialSchedule[]>(
    []
  );
  const [overtimeSchedules, setOvertimeSchedules] =
    useState<OvertimeSchedule>();
  const [editingSchedule, setEditingSchedule] = useState<{
    schedule: weeklySlotSchema;
    scheduleId: string;
  } | null>(null);

  const doctorId = localStorage.getItem('doctorId');

  const fetchOvertimeSchedules = async () => {
    if (!doctorId) return;
    try {
      const res = await api.get(`/schedule/getOvertimeSchedule/${doctorId}`);
      if (res.status === 200) {
        setOvertimeSchedules(res.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch khám ngoài giờ:", error);
    }
  };

  const handleToggleActive = async (
    scheduleId: string,
    weeklySchedule: weeklySlotSchema
  ) => {
    try {
      const updatedSchedule = {
        ...weeklySchedule,
        isActive: !weeklySchedule.isActive,
      };

      const response = await api.put(
        `/schedule/updateOvertimeSchedule/${scheduleId}`,
        updatedSchedule
      );

      if (response.status === 200) {
        fetchOvertimeSchedules();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch khám này?")) return;

    try {
      const response = await api.delete(
        `/schedule/deleteOvertimeSchedule/${scheduleId}`
      );
      if (response.status === 200) {
        alert("Xóa lịch khám thành công");
        fetchOvertimeSchedules();
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch khám:", error);
      alert("Có lỗi xảy ra khi xóa lịch khám");
    }
  };

  const handleEditSchedule = (
    schedule: weeklySlotSchema,
    scheduleId: string
  ) => {
    setEditingSchedule({
      schedule: { ...schedule },
      scheduleId,
    });
  };

  useEffect(() => {
    fetchOvertimeSchedules();
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    const fetchWeeklySchedule = async () => {
      try {
        const res = await api.get(
          `/schedule/getScheduleByDoctorId/${doctorId}`
        );
        if (res.status === 200) {
          setWeeklySchedules(res.data);
        }
      } catch (error) {
        alert(error);
      }
    };
    fetchWeeklySchedule();
  }, [doctorId]);

  useEffect(() => {
    if (!weeklySchedules?.schedule) return;
    const allShifts: Shift[] = weeklySchedules?.schedule
      ?.flatMap((day) => day.shiftIds)
      .filter(Boolean);
    setShifts(allShifts);
  }, [weeklySchedules]);

  useEffect(() => {
    if (!doctorId) return;
    const fetchSpecialSchedule = async () => {
      try {
        const res = await api.get(
          `/schedule/getAllSpecialSchedule/${doctorId}`
        );
        if (res.status === 200) {
          setSpecialSchedules(res.data);
        }
      } catch (error) {
        alert(error);
      }
    };
    fetchSpecialSchedule();
  }, [doctorId]);

  return (
    <div className="doctor-schedule-page-container">
      <h1>Lịch làm việc bác sĩ</h1>
      <div className="doctor-schedule-calendar">
        <DoctorScheduleCalendar
          doctorId=""
          weeklySchedule={weeklySchedules}
          shifts={shifts}
          specialSchedules={specialSchedules ?? []}
        />
      </div>
      <div className="doctor-overtime-schedule">
        <h2>Lịch khám bệnh ngoài giờ</h2>

        {/* Form thêm/chỉnh sửa lịch khám ngoài giờ */}
        {editingSchedule ? (
          <OvertimeScheduleForm
            doctorId={doctorId ?? ""}
            onScheduleAdded={fetchOvertimeSchedules}
            editData={{
              ...editingSchedule.schedule,
              scheduleId: editingSchedule.scheduleId,
            }}
            onCancelEdit={() => setEditingSchedule(null)}
          />
        ) : (
          <OvertimeScheduleForm
            doctorId={doctorId ?? ""}
            onScheduleAdded={fetchOvertimeSchedules}
          />
        )}

        {/* Hiển thị danh sách lịch khám ngoài giờ hiện có */}
        <div className="overtime-schedules-list">
          <h3>Lịch khám ngoài giờ hiện tại</h3>
          {overtimeSchedules ? (
            <div className="schedule-grid">
              {overtimeSchedules.weeklySchedule.map((weeklySchedule, index) => (
                <div
                  key={`${overtimeSchedules._id}-${index}`}
                  className={`schedule-item ${
                    weeklySchedule.isActive ? "active" : ""
                  }`}
                >
                  <div className="schedule-header">
                    <h4>
                      {
                        [
                          "Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7",
                        ][weeklySchedule.dayOfWeek]
                      }
                    </h4>
                    <div className="schedule-actions">
                      <button
                        onClick={() =>
                          handleToggleActive(
                            overtimeSchedules._id ?? "",
                            weeklySchedule
                          )
                        }
                        className={`btn-toggle ${
                          weeklySchedule.isActive ? "active" : "inactive"
                        }`}
                      >
                        {weeklySchedule.isActive ? "Đang bật" : "Đang tắt"}
                      </button>
                      <button
                        onClick={() =>
                          handleEditSchedule(
                            weeklySchedule,
                            overtimeSchedules._id ?? ""
                          )
                        }
                        className="btn-edit"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSchedule(overtimeSchedules._id ?? "")
                        }
                        className="btn-delete"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  <p>Địa điểm: {(weeklySchedule.locationId as any).name}</p>
                  <ul>
                    {weeklySchedule.slots.map((slot, slotIndex) => (
                      <li key={slotIndex}>
                        {slot.startTime} - {slot.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa có lịch khám ngoài giờ</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
