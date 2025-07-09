// components/schedules/ShiftList.tsx
'use client'
import {Location} from '@/interface/LocationInterface'

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

interface ShiftListProps {
  shifts: Shift[];
  locations: Location[];
  onEdit: (shift: Shift) => void;
  onDelete: (id: string) => void;
  getLocationName: (id: string) => string;
}

const ShiftList = ({
  shifts,
  locations,
  onEdit,
  onDelete,
  getLocationName,
}: ShiftListProps) => {
  return (
    <div className="shifts-list">
      <h3>Danh sách Ca làm việc</h3>
      <table>
        <thead>
          <tr>
            <th>Tên ca</th>
            <th>Thời gian</th>
            <th>Địa điểm</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map(shift => (
            <tr key={shift._id}>
              <td>{shift.name}</td>
              <td>{shift.startTime} - {shift.endTime}</td>
              <td>{getLocationName(shift.locationId)}</td>
              <td className="actions">
                <button 
                  onClick={() => onEdit(shift)}
                  className="edit-btn"
                >
                  Sửa
                </button>
                <button 
                  onClick={() => onDelete(shift._id)}
                  className="delete-btn"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftList;