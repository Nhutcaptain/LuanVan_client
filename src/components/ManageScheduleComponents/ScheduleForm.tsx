// components/schedules/ScheduleForm.tsx
'use client'
import { useState } from 'react';
import Swal from 'sweetalert2';
import { Location } from '@/interface/LocationInterface';

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

interface SpecialSchedule {
  _id: string;
  doctorId: string;
  date: Date;
  type: string;
  note: string;
}

interface ScheduleDay {
  dayOfWeek: number;
  shiftIds: Shift[];
}

interface ScheduleFormProps {
  departments: Department[];
  doctors: Doctor[];
  locations: Location[];
  shifts: Shift[];
  selectedDepartmentId: string;
  selectedDoctorId: string;
  selectedLocationId: string;
  selectedShifts: ScheduleDay[];
  isActive: boolean;
  isEditing: boolean;
  searchTerm: string;
  daysOfWeek: string[];
  onDepartmentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onShiftSelection: (dayIndex: number, shift: Shift, isChecked: boolean) => void;
  onActiveChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchTermChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isShiftSelected: (dayIndex: number, shiftId: string) => boolean;
  // New props for the moved functionality
  selectedDoctors: string[];
  multiSelectMode: boolean;
  fromDate: Date;
  toDate: Date;
  showSpecialDates: string | null;
  specialSchedules: SpecialSchedule[];
  onToggleMultiSelectMode: () => void;
  onDoctorSelection: (doctorId: string) => void;
  onSetShowSpecialDates: (doctorId: string | null) => void;
  onAddSpecialSchedule: (doctorId: string) => void;
  onDeleteSpecialSchedule: (id: string) => void;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  getDoctorName: (id: string) => string;
  getDepartmentName: (id: string) => string;
}

const ScheduleForm = ({
  departments,
  doctors,
  locations,
  shifts,
  selectedDepartmentId,
  selectedDoctorId,
  selectedLocationId,
  selectedShifts,
  isActive,
  isEditing,
  searchTerm,
  daysOfWeek,
  onDepartmentChange,
  onLocationChange,
  onShiftSelection,
  onActiveChange,
  onSearchTermChange,
  onSubmit,
  onReset,
  isShiftSelected,
  // New props
  selectedDoctors,
  multiSelectMode,
  fromDate,
  toDate,
  showSpecialDates,
  specialSchedules,
  onToggleMultiSelectMode,
  onDoctorSelection,
  onSetShowSpecialDates,
  onAddSpecialSchedule,
  onDeleteSpecialSchedule,
  onFromDateChange,
  onToDateChange,
  getDoctorName,
  getDepartmentName,
}: ScheduleFormProps) => {
  const formatDateString = (date: Date) => date.toISOString().split('T')[0];

  const filteredDoctors: Doctor[] = doctors.filter(doctor => {
     return doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <h2>{isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Lịch Làm Việc</h2>
      
      {/* Multi-select toggle and date range */}
      <div className="multi-select-toggle">
        <button 
          onClick={onToggleMultiSelectMode}
          className={`toggle-btn ${multiSelectMode ? 'active' : ''}`}
        >
          {multiSelectMode ? 'Đang chọn nhiều bác sĩ' : 'Xếp lịch cho nhiều bác sĩ'}
        </button>
        {multiSelectMode && (
          <div className="date-range-picker">
            <input 
              type="date" 
              value={formatDateString(fromDate)} 
              onChange={(e) => onFromDateChange(new Date(e.target.value))} 
            />
            <span>đến</span>
            <input 
              type="date" 
              value={formatDateString(toDate)} 
              onChange={(e) => onToDateChange(new Date(e.target.value))} 
              min={formatDateString(fromDate)}
            />
          </div>
        )}
      </div>

      {/* Doctor selection */}
      <div className="doctor-selection">
        <h3>{multiSelectMode ? 'Chọn nhiều bác sĩ' : 'Chọn bác sĩ'}</h3>
        <div className="doctor-grid">
          {filteredDoctors.map(doctor => (
            <div 
              key={doctor._id}
              className={`doctor-card-schedule ${selectedDoctors.includes(doctor._id) ? 'selected' : ''}`}
              onClick={() => onDoctorSelection(doctor._id)}
            >
              <div className="doctor-info">
                <span className="doctor-name">{doctor.fullName}</span>
                <span className="doctor-department">{getDepartmentName(doctor.departmentId)}</span>
              </div>
              <div className="doctor-actions">
                <button 
                  className="special-schedule-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetShowSpecialDates(showSpecialDates === doctor._id ? null : doctor._id);
                  }}
                >
                  Xem lịch đặc biệt
                </button>
                <button 
                  className="add-special-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSpecialSchedule(doctor._id);
                  }}
                >
                  + Thêm ngày đặc biệt
                </button>
              </div>
              {multiSelectMode && (
                <input 
                  type="checkbox" 
                  checked={selectedDoctors.includes(doctor._id)} 
                  readOnly 
                  className="doctor-checkbox"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special dates modal */}
      {showSpecialDates && (
        <div className="special-dates-modal">
          <div className="modal-header">
            <h3>Lịch đặc biệt của {getDoctorName(showSpecialDates)}</h3>
            <button onClick={() => onSetShowSpecialDates(null)}>×</button>
          </div>
          <div className="modal-content">
            {specialSchedules.filter(s => s.doctorId === showSpecialDates).length > 0 ? (
              specialSchedules
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(schedule => (
                  <div key={schedule._id} className="special-schedule-item">
                    <span className="schedule-date">{new Date(schedule.date).toLocaleDateString()}</span>
                    <span className={`schedule-type ${schedule.type.replace(/\s+/g, '-').toLowerCase()}`}>
                      {schedule.type}
                    </span>
                    <span className="schedule-note">{schedule.note}</span>
                    <button 
                      className="delete-btn"
                      onClick={() => onDeleteSpecialSchedule(schedule._id)}
                    >
                      Xóa
                    </button>
                  </div>
                ))
            ) : (
              <p className="no-special-dates">Không có lịch đặc biệt</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Khoa:</label>
          <select
            value={selectedDepartmentId}
            onChange={onDepartmentChange}
            required
          >
            <option value="">-- Chọn khoa --</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {selectedDepartmentId && (
          <div className="form-group">
            <label>Địa điểm làm việc:</label>
            <select
              value={selectedLocationId}
              onChange={onLocationChange}
              required
              disabled={!selectedDoctorId}
            >
              <option value="">-- Chọn địa điểm --</option>
              {locations.map(location => (
                <option key={location._id} value={location._id}>{location.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedDepartmentId && (
          <div className="search-box">
            <label>Tìm bác sĩ:</label>
            <input
              type="text"
              placeholder="Tìm kiếm bác sĩ..."
              value={searchTerm}
              onChange={onSearchTermChange}
            />
            <span className="search-icon">🔍</span>
          </div>
          
        )}

        <div className="date-range-picker">
            <input 
              type="date" 
              value={formatDateString(fromDate)} 
              onChange={(e) => onFromDateChange(new Date(e.target.value))} 
            />
            <span>đến</span>
            <input 
              type="date" 
              value={formatDateString(toDate)} 
              onChange={(e) => onToDateChange(new Date(e.target.value))} 
              min={formatDateString(fromDate)}
            />
          </div>

        <div className="days-grid">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="day-card">
              <h4>{day}</h4>
              {shifts.length > 0 ? (
                <div className="shifts-selection">
                  {shifts.map(shift => (
                    <label key={shift._id} className="shift-option">
                      <input
                        type="checkbox"
                        checked={isShiftSelected(index, shift._id)}
                        onChange={(e) => onShiftSelection(index, shift, e.target.checked)}
                      />
                      <span className="shift-info">
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="no-shifts">Không có ca nào tại địa điểm này</p>
              )}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isActive}
              onChange={onActiveChange}
            />
            <span>Kích hoạt lịch làm việc</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={onReset}
          >
            Hủy
          </button>
        </div>
      </form>
    </>
  );
};

export default ScheduleForm;