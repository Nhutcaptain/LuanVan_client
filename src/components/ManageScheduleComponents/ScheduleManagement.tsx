// components/schedules/ScheduleManagementTab.tsx
'use client'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { Location } from '@/interface/LocationInterface';
import ScheduleForm from './ScheduleForm';
import ScheduleList from './Schedule';
import { set } from 'date-fns';

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

interface WeeklySchedule {
  _id: string;
  fromDate?: Date;
  toDate?: Date;
  doctorId: string;
  schedule: ScheduleDay[];
  isActive: boolean;
}

interface ScheduleManagementTabProps {
  departments: Department[];
  doctors: Doctor[];
  locations: Location[];
  shifts: Shift[];
  schedules: WeeklySchedule[];
  daysOfWeek: string[];
  setDoctors: (doctors: Doctor[]) => void;
  setShifts: (shifts: Shift[]) => void;
  setSchedules: (schedules: WeeklySchedule[]) => void;
}

const ScheduleManagementTab = ({
  departments,
  doctors,
  locations,
  shifts,
  schedules,
  daysOfWeek,
  setDoctors,
  setShifts,
  setSchedules,
}: ScheduleManagementTabProps) => {
  // State management
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedShifts, setSelectedShifts] = useState<ScheduleDay[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [multiSelectMode, setMultiSelectMode] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showSpecialDates, setShowSpecialDates] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [specialSchedules, setSpecialSchedules] = useState<SpecialSchedule[]>([])

  // Helper functions
  const getDoctorName = (id: string) => doctors.find(d => d._id === id)?.fullName || '';
  const getDepartmentName = (id: string) => departments.find(d => d._id === id)?.name || '';
  const getLocationName = (id: string) => locations.find(l => l._id === id)?.name || '';
  const getShiftName = (id: string) => shifts.find(s => s._id === id)?.name || '';
  const formatDateString = (date: Date) => date.toISOString().split('T')[0];

  // Filter schedules based on search term
  const filteredSchedules = schedules.filter(schedule => {
    const doctorName = getDoctorName(schedule.doctorId).toLowerCase();
    return doctorName.includes(searchTerm.toLowerCase());
  });

  // Fetch doctors when department changes
  useEffect(() => {
    if (!selectedDepartmentId) return;
    
    const fetchDoctors = async () => {
      try {
        const res = await api.get(`/department/getAll/${selectedDepartmentId}`);
        if (res.status === 200) {
          setDoctors(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDoctors();
  }, [selectedDepartmentId, setDoctors]);

  useEffect(() => {
    if(!showSpecialDates) return;
    const fetchSpecialSchedules = async() => {
      try{
        const res = await api.get(`/schedule/getSpecialSchedule/${showSpecialDates}`);
        if(res.status === 200) {
          setSpecialSchedules(res.data);
        }else {
          throw new Error('Không tìm thấy lịch đặc biệt cho bác sĩ này');
        }
      }catch(error) {
        alert(error);
      }
    }
    fetchSpecialSchedules();
  },[showSpecialDates])

  // Fetch shifts when location changes
  useEffect(() => {
    if (!selectedLocationId) return;
    
    const fetchShifts = async () => {
      try {
        const res = await api.get(`/schedule/getShiftByLocation/${selectedLocationId}`);
        if (res.status === 200) {
          setShifts(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchShifts();
  }, [selectedLocationId, setShifts]);

  // Fetch schedules when doctor changes
  useEffect(() => {
    if (!doctors || doctors.length === 0) return;
    
    const fetchWeeklySchedule = async () => {
      try {
        const doctorIds = doctors.map(d => d._id);
        const res = await api.post(`/schedule/getWeeklySchedules`, { doctorIds });
        if (res.status === 200) {
          setSchedules(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchWeeklySchedule();
  }, [doctors, setSchedules]);

  // Doctor selection handlers
  const handleDoctorSelection = (doctorId: string) => {
    if (multiSelectMode) {
      setSelectedDoctors(prev => 
        prev.includes(doctorId) 
          ? prev.filter(id => id !== doctorId) 
          : [...prev, doctorId]
      );
    } else {
      handleDoctorChange(doctorId);
      setSelectedDoctors(prev => 
        prev.includes(doctorId) ? [] : [doctorId]
      );
    }
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (!multiSelectMode) {
      setSelectedDoctors([]);
    }
  };

  // Schedule form handlers
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);
    setSelectedDoctorId('');
    setSelectedLocationId('');
    setSelectedShifts([]);
  };

  const handleDoctorChange = async (doctorId: string) => {
   if(selectedDoctorId === doctorId) {
      setSelectedDoctorId('');
      setSelectedLocationId('');
      setSelectedShifts([]);
      return;
    }
   setSelectedDoctorId(doctorId);
    setSelectedLocationId('');
    setSelectedShifts([]);

    if (doctorId && !multiSelectMode) {
      try {
        const res = await api.get(`/schedule/getScheduleByDoctorId/${doctorId}`);
        if (res.status === 404) return;
        const doctorSchedule: WeeklySchedule = res.data;
        const existingSchedule = doctorSchedule.schedule;
        if (existingSchedule && existingSchedule.length > 0) {
          setSelectedShifts(existingSchedule);
        }
        const firstLocation = existingSchedule[0]?.shiftIds[0].locationId;
        if (firstLocation) {
          setSelectedLocationId(firstLocation);
        }
      } catch (error: any) {
        if (error?.response?.status === 404) return;
        console.error('Lỗi khi lấy lịch bác sĩ:', error);
      }
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = e.target.value;
    setSelectedLocationId(locationId);
    setSelectedShifts(selectedShifts.filter(day => 
      !day.shiftIds.some(shift => shift.locationId === locationId)
    ));
  };

  const handleShiftSelection = (dayIndex: number, shift: Shift, isChecked: boolean) => {
    setSelectedShifts(prev => {
      const existingDayIndex = prev.findIndex(day => day.dayOfWeek === dayIndex);

      if (existingDayIndex >= 0) {
        const updated = [...prev];
        if (isChecked) {
          const isAlreadySelected = updated[existingDayIndex].shiftIds.some(s => s._id === shift._id);
          if (!isAlreadySelected) {
            updated[existingDayIndex].shiftIds.push(shift);
          }
        } else {
          updated[existingDayIndex].shiftIds = updated[existingDayIndex].shiftIds.filter(
            s => s._id !== shift._id
          );
          if (updated[existingDayIndex].shiftIds.length === 0) {
            updated.splice(existingDayIndex, 1);
          }
        }
        return updated;
      } else if (isChecked) {
        return [...prev, { dayOfWeek: dayIndex, shiftIds: [shift] }];
      }
      return prev;
    });
  };

  const isShiftSelected = (dayIndex: number, shiftId: string) => {
    return selectedShifts.some(
      day => day.dayOfWeek === dayIndex && day.shiftIds.some(s => s._id === shiftId)
    );
  };

  // Schedule submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDoctors.length === 0) {
      Swal.fire('Lỗi', 'Vui lòng chọn ít nhất một bác sĩ', 'error');
      return;
    }

    if (selectedShifts.length === 0) {
      Swal.fire('Lỗi', 'Vui lòng chọn ít nhất một ca làm việc', 'error');
      return;
    }

    try {
      Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const results = await Promise.all(
        selectedDoctors.map(doctorId => 
          api.post('/schedule/createSchedule', {
            doctorId,
            schedule: selectedShifts,
            isActive,
            fromDate: multiSelectMode ? fromDate : undefined,
            toDate: multiSelectMode ? toDate : undefined
          })
        )
      );

      const newSchedules = results.map(res => res.data);
      const updatedSchedules: WeeklySchedule[] = (() => {
        const updated = [...schedules];
        newSchedules.forEach(newSchedule => {
          const index = updated.findIndex(s => s.doctorId === newSchedule.doctorId);
          if (index >= 0) {
            updated[index] = newSchedule;
          } else {
            updated.push(newSchedule);
          }
        });
        return updated;
      })();
      setSchedules(updatedSchedules);

      Swal.fire(
        'Thành công', 
        `Đã ${isEditing ? 'cập nhật' : 'thêm'} lịch cho ${selectedDoctors.length} bác sĩ`, 
        'success'
      );
      
      resetAfterSubmit();
    } catch (error) {
      Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xử lý', 'error');
    }
  };

  const resetAfterSubmit = () => {
    setSelectedDoctors([]);
    setSelectedDoctorId('');
    setIsActive(true);
    setIsEditing(false);
    setEditingScheduleId(null);
    setSelectedShifts([]);
    setMultiSelectMode(false);
  };

  const resetForm = () => {
    setSelectedDepartmentId('');
    setSelectedDoctorId('');
    setSelectedLocationId('');
    setSelectedShifts([]);
    setIsActive(true);
    setIsEditing(false);
    setEditingScheduleId(null);
  };

  // Special schedule handlers
  const handleAddSpecialSchedule = async (doctorId: string) => {
    const { value: formValues } = await Swal.fire({
      title: 'Thêm ngày đặc biệt',
      html: `
        <select id="swal-type" class="swal2-select">
          <option value="Nghỉ phép">Nghỉ phép</option>
          <option value="Công tác">Công tác</option>
          <option value="Họp">Họp</option>
          <option value="Khác">Khác</option>
        </select>
        <input id="swal-date" type="date" class="swal2-input" placeholder="Ngày">
        <input id="swal-note" class="swal2-input" placeholder="Ghi chú">
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          type: (document.getElementById('swal-type') as HTMLSelectElement).value,
          date: (document.getElementById('swal-date') as HTMLInputElement).value,
          note: (document.getElementById('swal-note') as HTMLInputElement).value
        };
      }
    });

    if (formValues) {
      try {
        const newSchedule = await api.post('/schedule/createSpecialSchedule', {
          doctorId,
          date: new Date(formValues.date),
          type: formValues.type,
          note: formValues.note,
          isActive: true
        });
        setSpecialSchedules([...specialSchedules, newSchedule.data]);
        Swal.fire('Thành công', 'Đã thêm ngày đặc biệt', 'success');
      } catch (error) {
        Swal.fire('Lỗi', 'Thêm ngày đặc biệt thất bại', 'error');
      }
    }
  };

  const handleDeleteSpecialSchedule = async (id: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa ngày đặc biệt này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/schedule/special/${id}`);
        setSpecialSchedules(specialSchedules.filter(s => s._id !== id));
        Swal.fire('Thành công', 'Đã xóa ngày đặc biệt', 'success');
      } catch (error) {
        Swal.fire('Lỗi', 'Xóa ngày đặc biệt thất bại', 'error');
      }
    }
  };

  // Schedule management handlers
  const handleEdit = (schedule: WeeklySchedule) => {
    const doctor = doctors.find(d => d._id === schedule.doctorId);
    if (!doctor) return;

    setSelectedDepartmentId(doctor.departmentId);
    setSelectedDoctors([schedule.doctorId]);
    setSelectedDoctorId(schedule.doctorId);
    setSelectedLocationId(schedule.schedule[0]?.shiftIds[0]?.locationId || '');
    setSelectedShifts(schedule.schedule);
    setIsActive(schedule.isActive);
    setIsEditing(true);
    setEditingScheduleId(schedule._id);
    setMultiSelectMode(false);
  };

  const handleDelete = async (doctorId: string) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa lịch làm việc này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await api.delete(`/schedule/deleteSchedule/${doctorId}`);
        if (res.status === 200) {
          setSchedules(schedules.filter(s => s.doctorId !== doctorId));
          Swal.fire('Thành công', 'Đã xóa lịch làm việc', 'success');
        }
      } catch (error) {
        Swal.fire('Lỗi', 'Xóa lịch làm việc thất bại', 'error');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const schedule = schedules.find(s => s._id === id);
      if (!schedule) return;

      const res = await api.put(`/schedule/toggleScheduleStatus/${id}`, {
        isActive: !schedule.isActive
      });

      if (res.status === 200) {
        setSchedules(schedules.map(s => 
          s._id === id ? { ...s, isActive: !s.isActive } : s
        ));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectDoctor = (id: string, schedule: ScheduleDay[]) => {
    const doctorId = id;
    setSelectedDoctorId(doctorId);
    setSelectedLocationId(schedule[0].shiftIds[0].locationId);
    setSelectedShifts(schedule);
  };

  return (
    <div className="schedule-management-container">
      {/* Schedule Form */}
      <div className="form-section">
        <ScheduleForm
          departments={departments}
          doctors={doctors}
          locations={locations}
          shifts={shifts}
          selectedDepartmentId={selectedDepartmentId}
          selectedDoctorId={selectedDoctorId}
          selectedLocationId={selectedLocationId}
          selectedShifts={selectedShifts}
          isActive={isActive}
          isEditing={isEditing}
          searchTerm={searchTerm}
          daysOfWeek={daysOfWeek}
          onDepartmentChange={handleDepartmentChange}
          onLocationChange={handleLocationChange}
          onShiftSelection={handleShiftSelection}
          onActiveChange={(e) => setIsActive(e.target.checked)}
          onSearchTermChange={(e) => setSearchTerm(e.target.value)}
          onSubmit={handleSubmit}
          onReset={resetForm}
          isShiftSelected={isShiftSelected}
          // New props for the moved functionality
          selectedDoctors={selectedDoctors}
          multiSelectMode={multiSelectMode}
          fromDate={fromDate}
          toDate={toDate}
          showSpecialDates={showSpecialDates}
          specialSchedules={specialSchedules}
          onToggleMultiSelectMode={toggleMultiSelectMode}
          onDoctorSelection={handleDoctorSelection}
          onSetShowSpecialDates={setShowSpecialDates}
          onAddSpecialSchedule={handleAddSpecialSchedule}
          onDeleteSpecialSchedule={handleDeleteSpecialSchedule}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          getDoctorName={getDoctorName}
          getDepartmentName={getDepartmentName}
        />
      </div>

      {/* Schedule List */}
      <div className="list-section">
        <ScheduleList
          schedules={filteredSchedules}
          doctors={doctors}
          departments={departments}
          locations={locations}
          daysOfWeek={daysOfWeek}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onSelectDoctor={handleSelectDoctor}
          getDoctorName={getDoctorName}
          getDepartmentName={getDepartmentName}
          getLocationName={getLocationName}
          getShiftName={getShiftName}
        />
      </div>
    </div>
  );
};

export default ScheduleManagementTab;