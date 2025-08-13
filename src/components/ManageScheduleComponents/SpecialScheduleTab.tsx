// components/ManageScheduleComponents/SpecialScheduleTab.tsx
'use client'
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import { Location } from '@/interface/LocationInterface'

interface Department {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  departmentId: string;
  userId: {
    fullName: string;
  }
}

interface SpecialSchedule {
  _id: string;
  doctorId: string;
  date: Date;
  startDate: Date;
  endDate: Date;
  type: string;
  note: string;
  doctor?: Doctor;
}

interface SpecialScheduleTabProps {
  departments: Department[];
  locations: Location[];
  specialSchedules: SpecialSchedule[];
  setSpecialSchedules: (schedules: SpecialSchedule[]) => void;
}

const SpecialScheduleTab = ({
  departments,
  locations,
  specialSchedules,
  setSpecialSchedules
}: SpecialScheduleTabProps) => {
  const [filterType, setFilterType] = useState<'month' | 'week' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const today = new Date();
    return getWeekNumber(today);
  });
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newSchedule, setNewSchedule] = useState<Partial<SpecialSchedule>>({
    doctorId: '',
    startDate: new Date(),
    endDate: new Date(),
    type: 'Nghỉ phép',
    note: ''
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [customType, setCustomType] = useState(''); // Thêm state cho custom type
  const [showCustomType, setShowCustomType] = useState(false); // State để hiển thị ô nhập custom type

  const scheduleTypes = ['Nghỉ phép', 'Họp', 'Công tác', 'Khác'];

  function getWeekNumber(d: Date): string {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  useEffect(() => {
    const fetchDoctors = async () => {
      if (selectedDepartment) {
        try {
          const res = await api.get(`/department/getAll/${selectedDepartment}`);
          if (res.status === 200) {
            setDoctors(res.data);
            setSelectedDoctor('');
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
        }
      } else {
        setDoctors(allDoctors);
      }
    };

    fetchDoctors();
  }, [selectedDepartment, allDoctors]);

  useEffect(() => {
    const fetchSpecialSchedules = async () => {
      setIsLoading(true);
      try {
        let params: any = {
          departmentId: selectedDepartment || undefined,
          doctorId: selectedDoctor || undefined,
          search: searchQuery || undefined
        };

        if (filterType === 'month') {
          const [year, month] = selectedMonth.split('-');
          params.year = year;
          params.month = month;
        } else if (filterType === 'week') {
          const [year, week] = selectedWeek.split('-W');
          params.year = year;
          params.week = week;
        } else {
          params.startDate = dateRange.start;
          params.endDate = dateRange.end;
        }

        const response = await api.get('/schedule/special-schedule', { params });
        if (response.status === 200) {
          const enhancedSchedules = response.data.map((schedule: SpecialSchedule) => ({
            ...schedule,
            doctor: allDoctors.find(d => d._id === schedule.doctorId)
          }));
          setSpecialSchedules(enhancedSchedules);
        }
      } catch (error) {
        console.error('Error fetching special schedules:', error);
        Swal.fire('Lỗi', 'Không thể tải lịch đặc biệt', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecialSchedules();
  }, [
    filterType,
    selectedMonth,
    selectedWeek,
    dateRange,
    selectedDepartment,
    selectedDoctor,
    searchQuery,
    setSpecialSchedules,
    allDoctors
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      setShowCustomType(value === 'Khác');
      setNewSchedule(prev => ({ ...prev, [name]: value === 'Khác' ? customType : value }));
    } else {
      setNewSchedule(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomType(value);
    setNewSchedule(prev => ({ ...prev, type: value }));
  };
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (new Date(newSchedule.endDate || '') < new Date(newSchedule.startDate || '')) {
        Swal.fire('Lỗi', 'Ngày kết thúc không thể trước ngày bắt đầu', 'error');
        return;
      }

      // Validate type is not empty when "Khác" is selected
     if (newSchedule.type === 'Khác' && !customType.trim()) {
        Swal.fire('Lỗi', 'Vui lòng nhập loại lịch đặc biệt', 'error');
        return;
      }

      const response = await api.post('/schedule/createSpecialSchedule', {
        ...newSchedule,
        startDate: new Date(newSchedule.startDate || ''),
        endDate: new Date(newSchedule.endDate || '')
      });
      
      if (response.status === 201) {
        Swal.fire('Thành công', 'Đã thêm lịch đặc biệt', 'success');
        setSpecialSchedules([
          ...specialSchedules, 
          { ...response.data.specialSchedule }
        ]);
        setNewSchedule({
          doctorId: '',
          startDate: new Date(),
          endDate: new Date(),
          type: 'Nghỉ phép',
          note: ''
        });
        setShowCustomType(false);
      }
    } catch (error) {
      console.error('Error adding special schedule:', error);
      Swal.fire('Lỗi', 'Không thể thêm lịch đặc biệt', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn xóa lịch đặc biệt này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/schedule/deleteSpecial`,{
          data: {specialScheduleId: id}
        });
        if (response.status === 200) {
          Swal.fire('Thành công', 'Đã xóa lịch đặc biệt', 'success');
          setSpecialSchedules(specialSchedules.filter(s => s._id !== id));
        }
      } catch (error) {
        console.error('Error deleting special schedule:', error);
        Swal.fire('Lỗi', 'Không thể xóa lịch đặc biệt', 'error');
      }
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSchedules = specialSchedules.reduce((acc, schedule) => {
    const doctorData = { 
      _id: (schedule.doctorId as any)._id || 'unknown',
      fullName: (schedule.doctorId as any).userId.fullName || 'Bác sĩ không xác định',
      departmentId: (schedule.doctorId as any)?.departmentId || 'unknown',
      userId: {
        fullName: '',
      }
    };
    
    const doctorName = doctorData.fullName;
    if (!acc[doctorName]) {
      acc[doctorName] = {
        doctor: doctorData,
        schedules: []
      };
    }
    acc[doctorName].schedules.push(schedule);
    return acc;
  }, {} as Record<string, { doctor: Doctor; schedules: SpecialSchedule[] }>);

  const getTypeColor = (type: string) => {
  switch (type) {
    case 'Nghỉ phép':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Họp':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Công tác':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

  return (
    <div className="special-schedule-container p-4">
      <div className="filters mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1">Loại lọc</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'month' | 'week' | 'range')}
              className="w-full p-2 border rounded"
            >
              <option value="month">Theo tháng</option>
              <option value="week">Theo tuần</option>
              <option value="range">Theo khoảng ngày</option>
            </select>
          </div>

          {filterType === 'month' && (
            <div>
              <label className="block mb-1">Tháng</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {filterType === 'week' && (
            <div>
              <label className="block mb-1">Tuần</label>
              <input
                type="week"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {filterType === 'range' && (
            <>
              <div>
                <label className="block mb-1">Từ ngày</label>
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Đến ngày</label>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Khoa</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả khoa</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Bác sĩ</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!selectedDepartment && doctors.length === 0}
            >
              <option value="">Tất cả bác sĩ</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>{doctor.fullName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Tìm kiếm bác sĩ</label>
            <input
              type="text"
              placeholder="Nhập tên bác sĩ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Danh sách lịch đặc biệt</h2>
          {isLoading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : specialSchedules.length === 0 ? (
            <div className="text-center py-4">Không có lịch đặc biệt</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSchedules).map(([doctorName, { doctor, schedules }]) => (
                <div key={doctor._id} className="border rounded-lg p-4">
                  <div className="font-semibold text-lg mb-2">
                    {doctor.fullName} - {departments.find(d => d._id === doctor.departmentId)?.name || 'Không xác định'}
                  </div>
                  <div className="space-y-2">
                    {schedules.map(schedule => (
                      <div key={schedule._id} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2">
                            <span className="font-medium">
                              {new Date(schedule.startDate).toLocaleDateString('vi-VN')}
                            </span>
                            {new Date(schedule.startDate).toLocaleDateString('vi-VN') !== new Date(schedule.endDate).toLocaleDateString('vi-VN') && (
                              <>
                                <span>đến</span>
                                <span className="font-medium">
                                  {new Date(schedule.endDate).toLocaleDateString('vi-VN')}
                                </span>
                              </>
                            )}
                          </div>
                          <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(schedule.type)}`}>
                            {schedule.type}
                          </div>
                          {schedule.note && (
                            <div className="text-sm text-gray-600 mt-1">
                              Ghi chú: {schedule.note}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(schedule._id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thêm lịch đặc biệt</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Bác sĩ <span className="text-red-500">*</span></label>
              <select
                name="doctorId"
                value={newSchedule.doctorId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Chọn bác sĩ</option>
                {filteredDoctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.fullName} - {departments.find(d => d._id === doctor.departmentId)?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="startDate"
                  value={newSchedule.startDate ? new Date(newSchedule.startDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Ngày kết thúc <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="endDate"
                  value={newSchedule.endDate ? new Date(newSchedule.endDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                  min={newSchedule.startDate ? new Date(newSchedule.startDate).toISOString().split('T')[0] : undefined}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Loại <span className="text-red-500">*</span></label>
               <div className="flex items-center gap-2">
                <select
                  name="type"
                  value={showCustomType ? 'Khác' : newSchedule.type}
                  onChange={handleInputChange}
                  className="flex-1 p-2 border rounded"
                  required
                >
                  {scheduleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {showCustomType && (
                  <input
                    type="text"
                    value={customType}
                    onChange={handleCustomTypeChange}
                    className="flex-1 p-2 border rounded"
                    placeholder="Nhập loại lịch"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1">Ghi chú (tùy chọn)</label>
              <textarea
                name="note"
                value={newSchedule.note || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Thêm lịch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpecialScheduleTab;