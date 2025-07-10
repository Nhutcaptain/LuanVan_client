// components/ScheduleComponent/OvertimeScheduleForm.tsx
"use client";
import { useEffect, useState } from "react";
import { OvertimeSlot, weeklySlotSchema } from "@/interface/Shifts";
import api from "@/lib/axios";
import { Location } from "@/interface/LocationInterface";
import Swal from "sweetalert2";

interface OvertimeScheduleFormProps {
  doctorId: string;
  onScheduleAdded: () => void;
  editData?: weeklySlotSchema & { scheduleId?: string };
  onCancelEdit?: () => void;
}

const OvertimeScheduleForm = ({
  doctorId,
  onScheduleAdded,
  editData,
  onCancelEdit
}: OvertimeScheduleFormProps) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [slots, setSlots] = useState<OvertimeSlot[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [scheduleId, setScheduleId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load locations and edit data if provided
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get("/location/getAll");
        if (response.status === 200) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách địa điểm:", error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải danh sách địa điểm',
          icon: 'error'
        });
      }
    };

    fetchLocations();

    if (editData) {
      setDayOfWeek(editData.dayOfWeek);
      setIsActive(editData.isActive);
      setSlots(editData.slots);
      setLocationId(editData.locationId);
      setScheduleId(editData.scheduleId);
    }
  }, [editData]);

  const resetForm = () => {
    setDayOfWeek(1);
    setIsActive(true);
    setSlots([]);
    setStartTime("");
    setEndTime("");
    setLocationId("");
    setScheduleId(undefined);
  };

  const addSlot = () => {
    if (!startTime || !endTime) {
      Swal.fire({
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc',
        icon: 'warning'
      });
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Swal.fire({
        title: 'Sai định dạng',
        text: 'Vui lòng nhập thời gian đúng định dạng HH:mm',
        icon: 'warning'
      });
      return;
    }

    if (startTime >= endTime) {
      Swal.fire({
        title: 'Thời gian không hợp lệ',
        text: 'Thời gian bắt đầu phải trước thời gian kết thúc',
        icon: 'warning'
      });
      return;
    }

    const newSlot: OvertimeSlot = { startTime, endTime };
    setSlots([...slots, newSlot]);
    setStartTime("");
    setEndTime("");
  };

  const removeSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const handleSubmit = async () => {
    if (slots.length === 0) {
      Swal.fire({
        title: 'Thiếu thông tin',
        text: 'Vui lòng thêm ít nhất một khung giờ',
        icon: 'warning'
      });
      return;
    }

    if (!locationId) {
      Swal.fire({
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn địa điểm khám',
        icon: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      const scheduleData = {
        doctorId,
        dayOfWeek,
        isActive,
        slots,
        locationId
      };

      if (scheduleId) {
        // Update existing schedule
        console.log("Is update overtime schedule:", scheduleData);
        response = await api.put(`/schedule/updateOvertimeSchedule/${scheduleId}`, scheduleData);
      } else {
        // Create new schedule
        response = await api.post("/schedule/createOvertimeSchedule", scheduleData);
      }

      if (response.status === 200) {
        Swal.fire({
          title: 'Thành công',
          text: scheduleId ? 'Cập nhật lịch thành công' : 'Thêm lịch khám ngoài giờ thành công',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        resetForm();
        onScheduleAdded();
        if (onCancelEdit) onCancelEdit();
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Lỗi',
        text: error.response.data.message,
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overtime-schedule-form">
      <h3>{scheduleId ? 'Chỉnh sửa lịch khám' : 'Thêm lịch khám ngoài giờ'}</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Thứ trong tuần:</label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
            className="form-control"
            disabled={isSubmitting}
          >
            <option value={0}>Chủ nhật</option>
            <option value={1}>Thứ 2</option>
            <option value={2}>Thứ 3</option>
            <option value={3}>Thứ 4</option>
            <option value={4}>Thứ 5</option>
            <option value={5}>Thứ 6</option>
            <option value={6}>Thứ 7</option>
          </select>
        </div>

        <div className="form-group">
          <label>Địa điểm khám:</label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="form-control"
            disabled={isSubmitting}
          >
            <option value="">Chọn địa điểm</option>
            {locations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-checkbox-container">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="form-checkbox"
            disabled={isSubmitting}
          />
          <label htmlFor="isActive">Kích hoạt</label>
        </div>
      </div>

      <div className="form-group">
        <label>Thêm khung giờ:</label>
        <div className="time-inputs">
          <div className="time-input-group">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="form-control"
              disabled={isSubmitting}
            />
          </div>
          <span>đến</span>
          <div className="time-input-group">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="form-control"
              disabled={isSubmitting}
            />
          </div>
          <button 
            onClick={addSlot} 
            className="btn btn-add"
            disabled={isSubmitting}
          >
            Thêm khung giờ
          </button>
        </div>
      </div>

      <div className="slots-list">
        <h4>Các khung giờ đã thêm:</h4>
        {slots.length === 0 ? (
          <p>Chưa có khung giờ nào</p>
        ) : (
          <ul>
            {slots.map((slot, index) => (
              <li key={index}>
                {slot.startTime} - {slot.endTime}
                <button
                  onClick={() => removeSlot(index)}
                  className="btn btn-remove"
                  disabled={isSubmitting}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-actions">
        <button
          onClick={handleSubmit}
          className="btn btn-submit"
          disabled={slots.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading">Đang xử lý...</span>
          ) : scheduleId ? (
            'Cập nhật lịch'
          ) : (
            'Lưu lịch khám'
          )}
        </button>
        
        {scheduleId && (
          <button
            onClick={() => {
              resetForm();
              if (onCancelEdit) onCancelEdit();
            }}
            className="btn btn-cancels"
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
        )}
      </div>
    </div>
  );
};

export default OvertimeScheduleForm;