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
  // Simplified props
  selectedDoctors: string[];
  multiSelectMode: boolean;
  onToggleMultiSelectMode: () => void;
  onDoctorSelection: (doctorId: string) => void;
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
  // Simplified props
  selectedDoctors,
  multiSelectMode,
  onToggleMultiSelectMode,
  onDoctorSelection,
  getDepartmentName,
}: ScheduleFormProps) => {
  const filteredDoctors: Doctor[] = doctors.filter(doctor => {
     return doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="schedule-form-container">
      <h2 className="form-title">{isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Lịch Làm Việc</h2>
      
      {/* Multi-select toggle */}
      <div className="multi-select-toggle mb-4">
        <button 
          onClick={onToggleMultiSelectMode}
          className={`btn ${multiSelectMode ? 'btn-primary' : 'btn-outline-primary'}`}
          type="button"
        >
          {multiSelectMode ? 'Đang chọn nhiều bác sĩ' : 'Xếp lịch cho nhiều bác sĩ'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block mb-2 font-medium">Khoa:</label>
            <select
              value={selectedDepartmentId}
              onChange={onDepartmentChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">-- Chọn khoa --</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {selectedDepartmentId && (
            <div className="form-group">
              <label className="block mb-2 font-medium">Địa điểm làm việc:</label>
              <select
                value={selectedLocationId}
                onChange={onLocationChange}
                required
                // disabled={!selectedDoctorId}
                className="w-full p-2 border rounded"
              >
                <option value="">-- Chọn địa điểm --</option>
                {locations.map(location => (
                  <option key={location._id} value={location._id}>{location.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedDepartmentId && (
          <div className="search-box relative">
            <label className="block mb-2 font-medium">Tìm bác sĩ:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ..."
                value={searchTerm}
                onChange={onSearchTermChange}
                className="w-full p-2 pl-10 border rounded"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>
        )}

        {selectedDepartmentId && (
          <div className="doctor-selection">
            <h3 className="text-lg font-semibold mb-3">{multiSelectMode ? 'Chọn nhiều bác sĩ' : 'Chọn bác sĩ'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDoctors.map(doctor => (
                <div 
                  key={doctor._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoctors.includes(doctor._id) 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onDoctorSelection(doctor._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doctor.fullName}</p>
                      <p className="text-sm text-gray-600">{getDepartmentName(doctor.departmentId)}</p>
                    </div>
                    {multiSelectMode && (
                      <input 
                        type="checkbox" 
                        checked={selectedDoctors.includes(doctor._id)} 
                        readOnly 
                        className="h-5 w-5 text-blue-600 rounded"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedLocationId && (
          <div className="days-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mt-4">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="day-card p-3 border rounded-lg">
                <h4 className="font-medium text-center mb-3">{day}</h4>
                {shifts.length > 0 ? (
                  <div className="space-y-2">
                    {shifts.map(shift => (
                      <label key={shift._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isShiftSelected(index, shift._id)}
                          onChange={(e) => onShiftSelection(index, shift, e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center">Không có ca nào tại địa điểm này</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="form-group flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={onActiveChange}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label>Kích hoạt lịch làm việc</label>
        </div>

        <div className="form-actions flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;