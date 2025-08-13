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
  PausePeriods,
} from "@/interface/Shifts";
import api from "@/lib/axios";
import { jwtDecode } from "jwt-decode";
import OvertimeScheduleForm from "@/components/ManageScheduleComponents/OvertimeScheduleForm";
import "./styles.css";
import Modal from "@/components/ModalComponent/ModalComponent";
import Swal from "sweetalert2";

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
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [currentScheduleToPause, setCurrentScheduleToPause] = useState<{
    scheduleId: string;
    dayOfWeek: number;
  } | null>(null);
  const [pauseForm, setPauseForm] = useState({
    startDate: "",
    endDate: "",
    indefinite: false,
    reason: "",
  });

  const [pauseType, setPauseType] = useState<"temporary" | "indefinite">(
    "temporary"
  );
  const [doctorId, setDoctorId] = useState("");

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
    // Nếu đang active, hiển thị modal tạm ngừng
    if (weeklySchedule.isActive) {
      setCurrentScheduleToPause({
        scheduleId,
        dayOfWeek: weeklySchedule.dayOfWeek,
      });
      setShowPauseModal(true);
      return;
    }

    // Nếu đang inactive, bật lại ngay lập tức
    try {
      const updatedSchedule = {
        ...weeklySchedule,
        isActive: true,
        pausePeriods: [], // Xóa tất cả các khoảng tạm ngừng khi bật lại
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

  const handleSubmitPause = async () => {
    if (!currentScheduleToPause || !overtimeSchedules) return;

    const result = await Swal.fire({
      title: "Xác nhận ngừng lịch !",
      text: "Sau khi ngừng lịch, các lịch đặt hẹn khám của bệnh nhân vào ngày ngừng lịch đều sẽ bị huỷ, BẠN CÓ MUỐN TIẾP TỤC?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;
    try {
      const scheduleToUpdate = overtimeSchedules.weeklySchedule.find(
        (s) => s.dayOfWeek === currentScheduleToPause.dayOfWeek
      );

      if (!scheduleToUpdate) return;
      Swal.fire({
        title: 'Đang cập nhật',
        icon: 'info',
        didOpen: () => Swal.showLoading(),
      })

      let updatedSchedule;

      if (pauseType === "indefinite") {
        // Ngừng vô thời hạn - chỉ cần đặt isActive = false
        updatedSchedule = {
          ...scheduleToUpdate,
          isActive: false,
          pausePeriods: scheduleToUpdate.pausePeriods || [], // Giữ nguyên pausePeriods hiện có
        };
      } else {
        // Ngừng theo thời gian - thêm vào pausePeriods
        const newPausePeriod: PausePeriods = {
          startDate: new Date(pauseForm.startDate),
          endDate: new Date(pauseForm.endDate),
          reason: pauseForm.reason,
        };

        updatedSchedule = {
          ...scheduleToUpdate,
          pausePeriods: [
            ...(scheduleToUpdate.pausePeriods || []),
            newPausePeriod,
          ],
          // Chỉ đánh isActive = false nếu ngày bắt đầu là hôm nay hoặc trong quá khứ
          isActive: new Date(pauseForm.startDate) > new Date(),
        };
      }

      const response = await api.put(
        `/schedule/updateOvertimeSchedule/${currentScheduleToPause.scheduleId}`,
        updatedSchedule
      );

      if (response.status === 200) {
        Swal.close();
        Swal.fire({
          title: 'Đã ngừng lịch thành công',
          icon: 'success',
          showCancelButton: true,
        })
        fetchOvertimeSchedules();
        setShowPauseModal(false);
        setPauseForm({
          startDate: "",
          endDate: "",
          indefinite: false,
          reason: "",
        });
        setPauseType("temporary");
      }
    } catch (error) {
      console.error("Lỗi khi tạm ngừng lịch:", error);
      alert("Có lỗi xảy ra khi tạm ngừng lịch");
    }
  };

  const handleDeletePausePeriod = async (
    scheduleId: string,
    dayOfWeek: number,
    pauseIndex: number
  ) => {
     const result = await Swal.fire({
      title: "Xác nhận xoá ngừng lịch !",
      text: "Bạn có chắc muốn xoá khoảng thời gian ngừng lịch này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if(!result.isConfirmed) return;

    try {
      const scheduleToUpdate = overtimeSchedules?.weeklySchedule.find(
        (s) => s.dayOfWeek === dayOfWeek
      );

      if (!scheduleToUpdate) return;

      const updatedPausePeriods = [...scheduleToUpdate.pausePeriods];
      updatedPausePeriods.splice(pauseIndex, 1);

      const updatedSchedule = {
        ...scheduleToUpdate,
        pausePeriods: updatedPausePeriods,
        // Nếu không còn pausePeriods nào và đang inactive thì bật lại
        isActive:
          updatedPausePeriods.length === 0 ? true : scheduleToUpdate.isActive,
      };

      const response = await api.put(
        `/schedule/updateOvertimeSchedule/${scheduleId}`,
        updatedSchedule
      );

      if (response.status === 200) {
        fetchOvertimeSchedules();
      }
    } catch (error) {
      console.error("Lỗi khi xóa khoảng tạm ngừng:", error);
      alert("Có lỗi xảy ra khi xóa khoảng tạm ngừng");
    }
  };

  const handleDeleteSchedule = async (dateOfWeek: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch khám này?")) return;

    try {
      const response = await api.delete(`/schedule/deleteOvertimeSchedule`, {
        data: {
          doctorId: doctorId,
          dayOfWeek: dateOfWeek,
        },
      });
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
    const doctorId = localStorage.getItem("doctorId");
    if (!doctorId) return;
    setDoctorId(doctorId);
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

  // Kiểm tra và cập nhật trạng thái isActive dựa trên pausePeriods
  useEffect(() => {
  if (!overtimeSchedules) return;

  const now = new Date();

  overtimeSchedules.weeklySchedule.forEach((schedule) => {
    let isActive = schedule.isActive;
    let needsUpdate = false;

    // Kiểm tra pausePeriods
    if (schedule.pausePeriods && schedule.pausePeriods.length > 0) {
      const activePauses = schedule.pausePeriods.filter(
        (pause) =>
          new Date(pause.startDate) <= now && now <= new Date(pause.endDate)
      );

      // Nếu đang có pause active → set isActive = false
      if (activePauses.length > 0 && isActive) {
        isActive = false;
        needsUpdate = true;
      }
      // Nếu không có pause active nhưng isActive = false → bật lại
      else if (activePauses.length === 0 && !isActive) {
        isActive = true;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      api
        .put(`/schedule/updateOvertimeSchedule/${overtimeSchedules._id}`, {
          dayOfWeek: schedule.dayOfWeek,
          slots: schedule.slots || [], // giữ nguyên slots
          isActive,
          locationId: schedule.locationId,
          pausePeriods: schedule.pausePeriods || [],
        })
        .then(() => {
          console.log(`Đã cập nhật trạng thái cho ngày ${schedule.dayOfWeek}`);
          fetchOvertimeSchedules();
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật trạng thái tự động:", error);
        });
    }
  });
}, [overtimeSchedules]);


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
                    weeklySchedule.isActive ? "active" : "paused"
                  }`}
                >
                  <div className="schedule-header">
                    <h4>
                      {
                        [
                          "Chủ nhật",
                          "Thứ 2",
                          "Thứ 3",
                          "Thứ 4",
                          "Thứ 5",
                          "Thứ 6",
                          "Thứ 7",
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
                          weeklySchedule.isActive ? "active" : "paused"
                        }`}
                      >
                        {weeklySchedule.isActive ? "Ngừng" : "Bật lại"}
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
                          handleDeleteSchedule(weeklySchedule.dayOfWeek)
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

                  {/* Hiển thị các khoảng tạm ngừng */}
                  {!weeklySchedule.isActive &&
                    weeklySchedule.pausePeriods?.length === 0 && (
                      <div className="pause-info">
                        <span>Đã ngừng hoạt động (vô thời hạn)</span>
                        <button
                          onClick={() =>
                            handleToggleActive(
                              overtimeSchedules._id ?? "",
                              weeklySchedule
                            )
                          }
                          className="btn-resume"
                        >
                          Bật lại
                        </button>
                      </div>
                    )}

                  {weeklySchedule.pausePeriods &&
                    weeklySchedule.pausePeriods.length > 0 && (
                      <div className="pause-periods">
                        <h5>Thời gian tạm ngừng:</h5>
                        <ul>
                          {weeklySchedule.pausePeriods.map(
                            (pause, pauseIndex) => (
                              <li key={pauseIndex}>
                                <span>
                                  Ngừng từ{" "}
                                  {new Date(pause.startDate).toLocaleDateString(
                                    "vi-VN"
                                  )}{" "}
                                  đến{" "}
                                  {new Date(pause.endDate).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                  : {pause.reason}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeletePausePeriod(
                                      overtimeSchedules._id ?? "",
                                      weeklySchedule.dayOfWeek,
                                      pauseIndex
                                    )
                                  }
                                  className="btn-delete-pause"
                                >
                                  Xóa
                                </button>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa có lịch khám ngoài giờ</p>
          )}
        </div>
      </div>

      {/* Modal tạm ngừng lịch */}
      {showPauseModal && (
        <Modal
        isOpen={showPauseModal}
          title={"Tạm ngừng lịch khám"}
          onClose={() => setShowPauseModal(false)}
        >
          <div className="pause-modal">
            <h3>Tạm ngừng lịch khám</h3>

            <div className="pause-type-selector">
              <label className="pause-type-option">
                <input
                  type="radio"
                  name="pauseType"
                  checked={pauseType === "temporary"}
                  onChange={() => setPauseType("temporary")}
                />
                <span>Ngừng theo thời gian</span>
              </label>
              <label className="pause-type-option">
                <input
                  type="radio"
                  name="pauseType"
                  checked={pauseType === "indefinite"}
                  onChange={() => setPauseType("indefinite")}
                />
                <span>Ngừng cho đến khi được bật lại</span>
              </label>
            </div>

            <div className="form-group">
              <label>Ngày bắt đầu tạm ngừng:</label>
              <input
                type="date"
                value={pauseForm.startDate}
                onChange={(e) =>
                  setPauseForm({ ...pauseForm, startDate: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {pauseType === "temporary" && (
              <div className="form-group">
                <label>Ngày kết thúc tạm ngừng:</label>
                <input
                  type="date"
                  value={pauseForm.endDate}
                  onChange={(e) =>
                    setPauseForm({ ...pauseForm, endDate: e.target.value })
                  }
                  min={
                    pauseForm.startDate ||
                    new Date().toISOString().split("T")[0]
                  }
                />
              </div>
            )}

            <div className="form-group">
              <label>Lý do tạm ngừng:</label>
              <textarea
                value={pauseForm.reason}
                onChange={(e) =>
                  setPauseForm({ ...pauseForm, reason: e.target.value })
                }
                placeholder="Nhập lý do tạm ngừng..."
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setPauseForm({
                    startDate: "",
                    endDate: "",
                    indefinite: false,
                    reason: "",
                  });
                  setPauseType("temporary");
                }}
                className="btn-cancel"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitPause}
                className="btn-confirm"
                disabled={
                  !pauseForm.startDate ||
                  (pauseType === "temporary" && !pauseForm.endDate)
                }
              >
                Xác nhận
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorSchedulePage;
