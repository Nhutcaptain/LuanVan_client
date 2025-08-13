'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DatePicker, Select } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import './styles.css'
import api from '@/lib/axios';

const { Option } = Select;

type TimeRange = 'day' | 'month' | 'custom';
type ViewMode = 'all' | 'doctor' | 'department';

interface DiagnosisStat {
  diagnosis: string;
  count: number;
}

interface DoctorStat {
  doctorId: string;
  doctorName: string;
  count: number;
}

interface DepartmentStat {
  departmentId: string;
  departmentName: string;
  count: number;
}

interface Department {
  _id: string;
  name: string;
}

export default function StatisticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [diagnosisStats, setDiagnosisStats] = useState<DiagnosisStat[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStat[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách chuyên khoa
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/department/getAllDepartment");
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    calculateDateRange();
  }, [timeRange, selectedDate, selectedMonth]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchStatistics();
    }
  }, [startDate, endDate, viewMode, selectedDoctor, selectedDepartment]);

  const calculateDateRange = () => {
    switch (timeRange) {
      case 'day':
        setStartDate(new Date(selectedDate.setHours(0, 0, 0, 0)));
        setEndDate(new Date(selectedDate.setHours(23, 59, 59, 999)));
        break;
      case 'month':
        const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        setStartDate(start);
        setEndDate(end);
        break;
      case 'custom':
        // Đã được xử lý bởi custom range picker
        break;
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      const response = await api.post('/stats/statistics', {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        viewMode,
        doctorId: selectedDoctor,
        departmentId: selectedDepartment
      });
      
      setDiagnosisStats(response.data.diagnosisStats);
      setDoctorStats(response.data.doctorStats);
      setDepartmentStats(response.data.departmentStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange: DatePickerProps['onChange'] = (date) => {
    setSelectedDate(date ? date.toDate() : new Date());
  };

  const handleMonthChange = (date: any) => {
    setSelectedMonth(date ? date.toDate() : new Date());
  };

  const handleRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0].toDate());
      setEndDate(dates[1].toDate());
    }
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return '';
    
    switch (timeRange) {
      case 'day':
        return `Ngày ${startDate.toLocaleDateString()}`;
      case 'month':
        return `Tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
      case 'custom':
        return `Từ ${startDate.toLocaleDateString()} đến ${endDate.toLocaleDateString()}`;
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Thống kê khám bệnh</h1>
      
      <div className="controls">
        <div className="time-range">
          <button 
            className={timeRange === 'day' ? 'active' : ''} 
            onClick={() => setTimeRange('day')}
          >
            Theo ngày
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            Theo tháng
          </button>
          <button 
            className={timeRange === 'custom' ? 'active' : ''} 
            onClick={() => setTimeRange('custom')}
          >
            Tùy chọn
          </button>
        </div>
        
        {timeRange === 'day' && (
          <DatePicker 
            value={dayjs(selectedDate)}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
          />
        )}
        
        {timeRange === 'month' && (
          <DatePicker 
            picker="month"
            value={dayjs(selectedMonth)}
            onChange={handleMonthChange}
            format="MM/YYYY"
          />
        )}
        
        {timeRange === 'custom' && (
          <DatePicker.RangePicker 
            onChange={handleRangeChange}
            format="DD/MM/YYYY"
          />
        )}
        
        <div className="view-mode">
          <button 
            className={viewMode === 'all' ? 'active' : ''} 
            onClick={() => {
              setViewMode('all');
              setSelectedDoctor(null);
              setSelectedDepartment(null);
            }}
          >
            Tất cả
          </button>
          <button 
            className={viewMode === 'doctor' ? 'active' : ''} 
            onClick={() => setViewMode('doctor')}
          >
            Theo bác sĩ
          </button>
          <button 
            className={viewMode === 'department' ? 'active' : ''} 
            onClick={() => setViewMode('department')}
          >
            Theo chuyên khoa
          </button>
        </div>
      </div>
      
      <div className="time-range-display">
        {formatDateRange()}
      </div>
      
      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <>
          {viewMode === 'doctor' && (
            <div className="doctor-selection">
              <h3>Chọn bác sĩ:</h3>
              <Select 
                value={selectedDoctor}
                onChange={(value) => setSelectedDoctor(value)}
                style={{ width: '100%' }}
                placeholder="Chọn bác sĩ"
              >
                <Option value="">Tất cả bác sĩ</Option>
                {doctorStats.map(doctor => (
                  <Option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.doctorName} ({doctor.count} ca)
                  </Option>
                ))}
              </Select>
            </div>
          )}
          
          {viewMode === 'department' && (
            <div className="department-selection">
              <h3>Chọn chuyên khoa:</h3>
              <Select 
                value={selectedDepartment}
                onChange={(value) => setSelectedDepartment(value)}
                style={{ width: '100%' }}
                placeholder="Chọn chuyên khoa"
              >
                <Option value="">Tất cả chuyên khoa</Option>
                {departments.map(dept => (
                  <Option key={dept._id} value={dept._id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}
          
          <div className="stats-grid">
            <div className="diagnosis-stats">
              <h2>Top 10 chẩn đoán phổ biến</h2>
              {diagnosisStats.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Chẩn đoán</th>
                      <th>Số ca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosisStats.slice(0, 10).map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.diagnosis || 'Không có chẩn đoán'}</td>
                        <td>{stat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có dữ liệu chẩn đoán</p>
              )}
            </div>
            
            <div className="doctor-stats">
              <h2>Top bác sĩ có nhiều ca khám</h2>
              {doctorStats.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Bác sĩ</th>
                      <th>Số ca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorStats.slice(0, 10).map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.doctorName}</td>
                        <td>{stat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có dữ liệu bác sĩ</p>
              )}
            </div>
            
            <div className="department-stats">
              <h2>Top chuyên khoa có nhiều ca khám</h2>
              {departmentStats.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Chuyên khoa</th>
                      <th>Số ca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.slice(0, 10).map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.departmentName}</td>
                        <td>{stat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có dữ liệu chuyên khoa</p>
              )}
            </div>
          
          </div>
        </>
      )}
    </div>
  );
}