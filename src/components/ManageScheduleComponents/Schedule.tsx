// components/schedules/ScheduleList.tsx
'use client'
import {Location} from '@/interface/LocationInterface'
interface Department {
  _id: string;
  name: string;
}

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  locationId: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  nameSlug: string;
  departmentId: string;
}

interface ScheduleDay {
  dayOfWeek: number;
  shiftIds: Shift[];
}

interface WeeklySchedule {
  _id: string;
  doctorId: string;
  schedule: ScheduleDay[];
  isActive: boolean;
}

interface ScheduleListProps {
  schedules: WeeklySchedule[];
  doctors: Doctor[];
  departments: Department[];
  locations: Location[];
  daysOfWeek: string[];
  onEdit: (schedule: WeeklySchedule) => void;
  onDelete: (doctorId: string) => void;
  onToggleStatus: (id: string) => void;
  onSelectDoctor: (id: string, schedule: ScheduleDay[]) => void;
  getDoctorName: (id: string) => string;
  getDepartmentName: (id: string) => string;
  getLocationName: (id: string) => string;
  getShiftName: (id: string) => string;
}

const ScheduleList = ({
  schedules,
  doctors,
  departments,
  locations,
  daysOfWeek,
  onEdit,
  onDelete,
  onToggleStatus,
  onSelectDoctor,
  getDoctorName,
  getDepartmentName,
  getLocationName,
  getShiftName,
}: ScheduleListProps) => {
  return (
    <>
      <h2>Danh sách Lịch Làm Việc</h2>
      {schedules.length === 0 ? (
        <p className="no-data">Chưa có lịch làm việc nào được tạo</p>
      ) : (
        <div className="schedules-grid">
          {schedules.map(schedule => {
            const doctor = doctors.find(d => d._id === schedule.doctorId);
            const department = departments.find(d => d._id === doctor?.departmentId);
            
            return (
              <div key={schedule._id} className={`schedule-card ${!schedule.isActive ? 'inactive' : ''}`} 
              onClick={() => {
                onEdit(schedule)
              }}>
                <div className="card-header">
                  <div>
                    <h3>{getDoctorName(schedule.doctorId)}</h3>
                    <p className="specialty">{department?.name}</p>
                  </div>
                  <div className={`status-badge ${schedule.isActive ? 'active' : 'inactive'}`}>
                    {schedule.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </div>
                </div>
                
                <div className="schedule-days">
                  {schedule.schedule?.length === 0 ? (
                    <p className="no-shifts">Chưa có ca làm việc nào được phân công</p>
                  ) : (
                    schedule.schedule?.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((day, i) => (
                      <div key={i} className="schedule-day">
                        <div className="day-location">
                          <strong>{daysOfWeek[day.dayOfWeek]}</strong>
                          {day.shiftIds.length > 0 && (
                            <span className="location">
                              {getLocationName(day.shiftIds[0].locationId)}
                            </span>
                          )}
                        </div>
                        <ul>
                          {day.shiftIds.map((shift,index) => (
                            <li key={index}>
                              <span className="shift-name">{shift.name}</span>
                              <span className="shift-time">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="card-actions">
                  <button onClick={() => onEdit(schedule)} className="edit-btn">
                    Sửa
                  </button>
                  <button onClick={() => onDelete(schedule.doctorId)} className="delete-btn">
                    Xóa
                  </button>
                  <button 
                    onClick={() => onToggleStatus(schedule._id)}
                    className={`status-btn ${schedule.isActive ? 'deactivate' : 'activate'}`}
                  >
                    {schedule.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ScheduleList;