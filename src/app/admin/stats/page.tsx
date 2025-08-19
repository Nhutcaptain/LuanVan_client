'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#A4DE6C', '#D0ED57', '#FFA500'];

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.valueAsDate || new Date());
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.valueAsDate || new Date());
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.valueAsDate || undefined);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.valueAsDate || undefined);
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return '';
    
    switch (timeRange) {
      case 'day':
        return `Ngày ${startDate.toLocaleDateString('vi-VN')}`;
      case 'month':
        return `Tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
      case 'custom':
        return `Từ ${startDate.toLocaleDateString('vi-VN')} đến ${endDate.toLocaleDateString('vi-VN')}`;
      default:
        return '';
    }
  };

  // Prepare data for charts
  const topDiagnoses = diagnosisStats.slice(0, 10).map(item => ({
    name: item.diagnosis || 'Không có chẩn đoán',
    value: item.count
  }));

  const topDoctors = doctorStats.slice(0, 10).map(item => ({
    name: item.doctorName,
    value: item.count
  }));

  const topDepartments = departmentStats.slice(0, 10).map(item => ({
    name: item.departmentName,
    value: item.count
  }));

  const totalCases = diagnosisStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thống kê khám bệnh</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-md ${timeRange === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setTimeRange('day')}
              >
                Theo ngày
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setTimeRange('month')}
              >
                Theo tháng
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${timeRange === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setTimeRange('custom')}
              >
                Tùy chọn
              </button>
            </div>
            
            {timeRange === 'day' && (
              <input
                type="date"
                value={dayjs(selectedDate).format('YYYY-MM-DD')}
                onChange={handleDateChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {timeRange === 'month' && (
              <input
                type="month"
                value={dayjs(selectedMonth).format('YYYY-MM')}
                onChange={handleMonthChange}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            {timeRange === 'custom' && (
              <div className="flex space-x-2">
                <input
                  type="date"
                  onChange={handleStartDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex items-center">đến</span>
                <input
                  type="date"
                  onChange={handleEndDateChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 mb-6">
            <button 
              className={`px-4 py-2 rounded-md ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => {
                setViewMode('all');
                setSelectedDoctor(null);
                setSelectedDepartment(null);
              }}
            >
              Tất cả
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${viewMode === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setViewMode('doctor')}
            >
              Theo bác sĩ
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${viewMode === 'department' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setViewMode('department')}
            >
              Theo chuyên khoa
            </button>
          </div>
          
          <div className="text-lg font-semibold text-gray-700">
            {formatDateRange()}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {viewMode === 'doctor' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Chọn bác sĩ:</h3>
                <select
                  value={selectedDoctor || ''}
                  onChange={(e) => setSelectedDoctor(e.target.value || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả bác sĩ</option>
                  {doctorStats.map(doctor => (
                    <option key={doctor.doctorId} value={doctor.doctorId}>
                      {doctor.doctorName} ({doctor.count} ca)
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {viewMode === 'department' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Chọn chuyên khoa:</h3>
                <select
                  value={selectedDepartment || ''}
                  onChange={(e) => setSelectedDepartment(e.target.value || null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng số ca khám</h3>
                <p className="text-3xl font-bold text-blue-600">{totalCases}</p>
              </div>
              <div className="bg-green-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Số bác sĩ</h3>
                <p className="text-3xl font-bold text-green-600">{doctorStats.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Số chuyên khoa</h3>
                <p className="text-3xl font-bold text-purple-600">{departmentStats.length}</p>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Diagnosis Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Top 10 chẩn đoán phổ biến</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topDiagnoses}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Số ca" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Doctors Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Phân bổ ca khám theo bác sĩ</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topDoctors}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {topDoctors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Departments Line Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Phân bổ ca khám theo chuyên khoa</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={topDepartments}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Số ca" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Data Tables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Top 10 chẩn đoán phổ biến</h2>
                {diagnosisStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chẩn đoán</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số ca</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {diagnosisStats.slice(0, 10).map((stat, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.diagnosis || 'Không có chẩn đoán'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Không có dữ liệu chẩn đoán</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Top bác sĩ có nhiều ca khám</h2>
                {doctorStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số ca</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {doctorStats.slice(0, 10).map((stat, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.doctorName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Không có dữ liệu bác sĩ</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Top chuyên khoa có nhiều ca khám</h2>
                {departmentStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyên khoa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số ca</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {departmentStats.slice(0, 10).map((stat, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.departmentName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Không có dữ liệu chuyên khoa</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}