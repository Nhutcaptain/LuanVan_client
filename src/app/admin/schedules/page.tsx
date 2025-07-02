'use client'
import { useEffect, useState } from 'react';
import './styles.css';
import {Location} from '@/interface/LocationInterface'
import api from '@/lib/axios';
import Swal from 'sweetalert2';

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

const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const SchedulesManagement = () => {
  // Data state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);

  // Form state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedShifts, setSelectedShifts] = useState<ScheduleDay[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'shift'>('schedule');
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    locationId: '',
    isEditing: false,
    editId: null as string | null,
  });

  // Fetch departments and locations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, locRes] = await Promise.all([
          api.get('/department/getAllDepartment'),
          api.get('/location/getAll')
        ]);

        if (deptRes.status === 200) {
          setDepartments(deptRes.data);
        }
        if (locRes.status === 201) {
          setLocations(locRes.data);
          if (locRes.data.length > 0) {
            setShiftForm(prev => ({ ...prev, locationId: locRes.data[0]._id }));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

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
  }, [selectedDepartmentId]);

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
  }, [selectedLocationId]);

  // Fetch schedules when doctor changes
  useEffect(() => {
    if (!doctors || doctors.length === 0) return;
    
    const fetchWeeklySchedule = async () => {
      try {
        const doctorIds = doctors.map(d => d._id);
        const res = await api.post(`/schedule/getWeeklySchedules`,{
          doctorIds
        });
        if (res.status === 200) {
          setSchedules(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchWeeklySchedule();
  }, [doctors]);

  // Handlers
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = e.target.value;
    setSelectedDepartmentId(departmentId);
    setSelectedDoctorId('');
    setSelectedLocationId('');
    setSelectedShifts([]);
  };

  const handleDoctorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    setSelectedLocationId('');
    setSelectedShifts([])

    if(doctorId) {
      try{
        const res = await api.get(`/schedule/getScheduleByDoctorId/${doctorId}`);
        const doctorSchedule: WeeklySchedule = res.data;
        const existingSchedule = doctorSchedule.schedule;
        if(existingSchedule && existingSchedule.length > 0) {
          setSelectedShifts(existingSchedule);
        }
        const firstLocation = existingSchedule[0].shiftIds[0].locationId;
        if(firstLocation) {
          setSelectedLocationId(firstLocation);
        }
      }catch(error) {
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

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
    title: 'Đang xử lý...',
    text: shiftForm.isEditing ? 'Đang cập nhật ca làm việc' : 'Đang thêm ca làm việc',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
    
    try{
      if (shiftForm.isEditing && shiftForm.editId) {
      // Update existing shift
      setShifts(shifts.map(shift => 
        shift._id === shiftForm.editId ? {
          ...shift,
          name: shiftForm.name,
          startTime: shiftForm.startTime,
          endTime: shiftForm.endTime,
          locationId: shiftForm.locationId
        } : shift
      ));
    } else {
      const newShift: Shift = {
        _id: '',
        name: shiftForm.name,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        locationId: shiftForm.locationId
      };
      
      const res = await api.post('/schedule/createShift',newShift);
      if(res.status === 201) {
        setShifts([...shifts, newShift]);
      }
    }

    // Reset form
      setShiftForm({
        name: '',
        startTime: '08:00',
        endTime: '17:00',
        locationId: locations[0]._id,
        isEditing: false,
        editId: null,
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: shiftForm.isEditing ? 'Cập nhật ca làm việc thành công' : 'Thêm ca làm việc thành công',
        showConfirmButton: true
      });
    }catch(error) {
       Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: 'Đã xảy ra lỗi khi xử lý',
    });
    }
  };

  const handleShiftInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShiftForm({ ...shiftForm, [name]: value });
  };

  const handleEditShift = (shift: Shift) => {
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      locationId: shift.locationId,
      isEditing: true,
      editId: shift._id,
    });
    setActiveTab('shift');
  };

  const handleDeleteShift = async (id: string) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc chắn muốn xóa ca làm việc này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await api.delete(`/schedule/deleteShift/${id}`);
        if (res.status === 200) {
          setShifts(shifts.filter(s => s._id !== id));
          // Also remove from any selected shifts
          setSelectedShifts(selectedShifts.map(day => ({
            ...day,
            shiftIds: day.shiftIds.filter(shift => shift._id !== id)
          })).filter(day => day.shiftIds.length > 0));
          Swal.fire('Thành công', 'Đã xóa ca làm việc', 'success');
        }
      } catch (error) {
        Swal.fire('Lỗi', 'Xóa ca làm việc thất bại', 'error');
      }
    }
  };

  const handleShiftSelection = (dayIndex: number, shift: Shift, isChecked: boolean) => {
    setSelectedShifts(prev => {
      const existingDayIndex = prev.findIndex(
        day => day.dayOfWeek === dayIndex
      );

      if (existingDayIndex >= 0) {
        const updated = [...prev];
        if (isChecked) {
          const isAlreadySelected = updated[existingDayIndex].shiftIds.some(
          s => s._id === shift._id
        );

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
        return [
          ...prev,
          {
            dayOfWeek: dayIndex,
            shiftIds: [shift]
          }
        ];
      }
      return prev;
    });
  };

  const isShiftSelected = (dayIndex: number, shiftId: string) => {
    return selectedShifts.some(
      day => day.dayOfWeek === dayIndex && 
             day.shiftIds.some(s => s._id === shiftId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDepartmentId || !selectedDoctorId || selectedShifts.length === 0) {
      Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    try {
      Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const scheduleData = {
        doctorId: selectedDoctorId,
        schedule: selectedShifts,
        isActive
      };

      console.log(scheduleData);

      
        const res = await api.post('/schedule/createSchedule', scheduleData);
      

      if (res.status === 200 || res.status === 201) {
        Swal.fire('Thành công', isEditing ? 'Cập nhật lịch thành công' : 'Thêm lịch thành công', 'success');
        setSchedules(prev =>
          [...prev.filter(s => s.doctorId !== res.data.doctorId), res.data]
        );
        resetForm();
      }
    } catch (error) {
      Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xử lý', 'error');
    }
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

  const handleEdit = (schedule: WeeklySchedule) => {
    const doctor = doctors.find(d => d._id === schedule.doctorId);
    if (!doctor) return;

    setSelectedDepartmentId(doctor.departmentId);
    setSelectedDoctorId(schedule.doctorId);
    setSelectedLocationId(schedule.schedule[0]?.shiftIds[0]?.locationId || '');
    setSelectedShifts(schedule.schedule);
    setIsActive(schedule.isActive);
    setIsEditing(true);
    setEditingScheduleId(schedule._id);
  };

  const handleDelete = async (id: string) => {
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
        const res = await api.delete(`/schedule/deleteSchedule/${id}`);
        if (res.status === 200) {
          setSchedules(schedules.filter(s => s._id !== id));
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

  // Utility functions
  const getDoctorName = (id: string) => doctors.find(d => d._id === id)?.fullName || '';
  const getDepartmentName = (id: string) => departments.find(d => d._id === id)?.name || '';
  const getLocationName = (id: string) => locations.find(l => l._id === id)?.name || '';
  const getShiftName = (id: string) => shifts.find(s => s._id === id)?.name || '';

  return (
    <div className="schedules-container">
      <h1>Quản lý Lịch Làm Việc Bệnh Viện</h1>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Quản lý Lịch
        </button>
        <button 
          className={`tab ${activeTab === 'shift' ? 'active' : ''}`}
          onClick={() => setActiveTab('shift')}
        >
          Quản lý Ca làm việc
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <>
          <div className="form-section">
            <h2>{isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Lịch Làm Việc</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Khoa:</label>
                <select
                  value={selectedDepartmentId}
                  onChange={handleDepartmentChange}
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
                  <label>Bác sĩ:</label>
                  <select
                    value={selectedDoctorId}
                    onChange={handleDoctorChange}
                    required
                    disabled={!selectedDepartmentId}
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>{doctor.fullName}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedDoctorId && (
                <div className="form-group">
                  <label>Địa điểm làm việc:</label>
                  <select
                    value={selectedLocationId}
                    onChange={handleLocationChange}
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

              {selectedLocationId && (
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
                                onChange={(e) => handleShiftSelection(index, shift, e.target.checked)}
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
              )}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
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
                  onClick={resetForm}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>

          <div className="list-section">
            <h2>Danh sách Lịch Làm Việc</h2>
            {schedules.length === 0 ? (
              <p className="no-data">Chưa có lịch làm việc nào được tạo</p>
            ) : (
              <div className="schedules-grid">
                {schedules.map(schedule => {
                  const doctor = doctors.find(d => d._id === schedule.doctorId);
                  const department = departments.find(d => d._id === doctor?.departmentId);
                  
                  return (
                    <div key={schedule._id} className={`schedule-card ${!schedule.isActive ? 'inactive' : ''}`}>
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
                          schedule.schedule?.map((day, i) => (
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
                                {day.shiftIds.map(shift => (
                                  <li key={shift._id}>
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
                        <button onClick={() => handleEdit(schedule)} className="edit-btn">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(schedule._id)} className="delete-btn">
                          Xóa
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(schedule._id)}
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
          </div>
        </>
      ) : (
        <div className="shift-management">
          <h2>{shiftForm.isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Ca làm việc</h2>
          <form onSubmit={handleShiftSubmit} className="shift-form">
            <div className="form-group">
              <label>Tên ca:</label>
              <input
                type="text"
                name="name"
                value={shiftForm.name}
                onChange={handleShiftInputChange}
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
                  onChange={handleShiftInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Giờ kết thúc:</label>
                <input
                  type="time"
                  name="endTime"
                  value={shiftForm.endTime}
                  onChange={handleShiftInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa điểm:</label>
              <select
                name="locationId"
                value={shiftForm.locationId}
                onChange={handleShiftInputChange}
                required
              >
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
                  onClick={() => setShiftForm({
                    name: '',
                    startTime: '08:00',
                    endTime: '17:00',
                    locationId: locations[0]?._id || '',
                    isEditing: false,
                    editId: null,
                  })}
                >
                  Hủy
                </button>
              )}
            </div>
          </form>

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
                        onClick={() => handleEditShift(shift)}
                        className="edit-btn"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteShift(shift._id)}
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
        </div>
      )}
    </div>
  );
};

export default SchedulesManagement;