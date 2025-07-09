// components/schedules/ShiftForm.tsx
'use client'
import { Location } from '@/interface/LocationInterface';

interface ShiftFormProps {
  shiftForm: {
    name: string;
    startTime: string;
    endTime: string;
    locationId: string;
    isEditing: boolean;
    editId: string | null;
  };
  locations: Location[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ShiftForm = ({
  shiftForm,
  locations,
  onChange,
  onSubmit,
  onCancel,
}: ShiftFormProps) => {
  return (
    <>
      <h2>{shiftForm.isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Ca làm việc</h2>
      <form onSubmit={onSubmit} className="shift-form">
        <div className="form-group">
          <label>Tên ca:</label>
          <input
            type="text"
            name="name"
            value={shiftForm.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="time-group">
          <div className="form-group">
            <label>Giờ bắt đầu:</label>
            <input
              type="time"
              name="startTime"
              value={shiftForm.startTime}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Giờ kết thúc:</label>
            <input
              type="time"
              name="endTime"
              value={shiftForm.endTime}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Địa điểm:</label>
          <select
            name="locationId"
            value={shiftForm.locationId}
            onChange={onChange}
            required
          >
            <option>--Chọn địa điểm--</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {shiftForm.isEditing ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {shiftForm.isEditing && (
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default ShiftForm;