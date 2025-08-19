'use client'
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Calendar, Search, Activity, List, RefreshCw, ChevronDown } from 'lucide-react';
import './styles.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ExaminationList() {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [statsData, setStatsData] = useState<any[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<any[]>([]);
  const [showDiseaseChart, setShowDiseaseChart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [examinations, setExaminations] = useState<ExaminationFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) return router.push('/login');

      const params: any = { type: viewMode };
      if (viewMode === 'day' || viewMode === 'week') params.date = selectedDate;
      if (viewMode === 'month') params.month = selectedMonth;

      const resStats = await api.get(`/examination/stats/${doctorId}`, { params });
      setStatsData(resStats.data);

      if (showDiseaseChart) {
        const resDisease = await api.get(`/examination/stats/${doctorId}`, {
          params: { ...params, byDisease: true }
        });
        setDiseaseStats(resDisease.data);
      }

      const resList = await api.get(`/examination/list/${doctorId}`, { params });
      setExaminations(resList.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, selectedDate, selectedMonth, showDiseaseChart]);

  const filteredExaminations = examinations.filter(exam =>
    (exam.patientId as any)?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.provisional?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  return (
    <div className="examination-container">
      <div className="header">
        <h1 className="page-title">Thống Kê & Danh Sách Khám Bệnh</h1>
        <button 
          onClick={fetchData}
          className="refresh-button"
          disabled={loading}
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Làm mới
        </button>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="viewMode" className="filter-label">
              <Activity size={18} />
              <span>Chế độ xem</span>
            </label>
            <div className="select-wrapper">
              <select 
                id="viewMode" 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as any)}
                className="filter-select"
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>

          <div className="filter-item">
            <label htmlFor="dateInput" className="filter-label">
              <Calendar size={18} />
              <span>Thời gian</span>
            </label>
            {viewMode === 'day' || viewMode === 'week' ? (
              <input 
                id="dateInput"
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="filter-input"
              />
            ) : (
              <input 
                id="dateInput"
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="filter-input"
              />
            )}
          </div>
        </div>

        <div className="search-group">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân hoặc chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button 
            onClick={() => setShowDiseaseChart(!showDiseaseChart)}
            className={`toggle-button ${showDiseaseChart ? 'active' : ''}`}
          >
            {showDiseaseChart ? 'Ẩn thống kê bệnh' : 'Hiển thị thống kê bệnh'}
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {loading && (
          <div className="loading-overlay">
            <RefreshCw className="animate-spin" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Patient Statistics Chart */}
        {!loading && statsData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h2>Số lượng bệnh nhân theo {viewMode === 'day' ? 'ngày' : viewMode === 'week' ? 'tuần' : 'tháng'}</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="_id" 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#9ca3af' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#6366f1" 
                    name="Số bệnh nhân"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Disease Statistics Chart */}
        {showDiseaseChart && diseaseStats.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h2>Phân bố bệnh phổ biến</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={diseaseStats}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    innerRadius={70}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {diseaseStats.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} ca`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    height={40}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!loading && statsData.length === 0 && (
          <div className="empty-state">
            <List size={48} className="text-gray-400" />
            <h3>Không có dữ liệu thống kê</h3>
            <p>Không tìm thấy dữ liệu khám bệnh trong khoảng thời gian đã chọn</p>
          </div>
        )}
      </div>

      {/* Examination List Section */}
      <div className="list-section">
        <div className="section-header">
          <h2>Danh sách bệnh án</h2>
          <span className="badge">{filteredExaminations.length} bệnh án</span>
        </div>

        {filteredExaminations.length === 0 && !loading && (
          <div className="empty-state">
            <List size={48} className="text-gray-400" />
            <h3>Không tìm thấy bệnh án</h3>
            <p>Hãy thử thay đổi tiêu chí tìm kiếm hoặc khoảng thời gian</p>
          </div>
        )}

        <div className="examination-grid">
          {filteredExaminations.map((exam, index) => (
            <div key={exam._id} className="examination-card">
              <div className="card-header">
                <span className="patient-number">#{index + 1}</span>
                <span className={`status-badge ${exam.status}`}>
                  {exam.status === 'completed' ? 'Hoàn thành' :
                    exam.status === 'examining' ? 'Đang khám' :
                      exam.status === 'waiting_result' ? 'Chờ kết quả' : exam.status}
                </span>
              </div>
              
              <div className="card-body">
                <div className="patient-info">
                  <h3>{(exam.patientId as any)?.fullName || 'Bệnh nhân không tên'}</h3>
                  <p className="patient-code">Mã BN: {exam.patientCode || 'N/A'}</p>
                </div>
                
                <div className="diagnosis-info">
                  <h4>Chẩn đoán:</h4>
                  <p className="diagnosis-text">
                    {exam.assessment || 'Chưa có chẩn đoán'}
                  </p>
                </div>
                
                <div className="time-info">
                  <div className="time-item">
                    <span className="time-label">Ngày khám:</span>
                    <span className="time-value">{formatDate(exam.date)}</span>
                  </div>
                  {exam.followUp && (
                    <div className="time-item">
                      <span className="time-label">Tái khám:</span>
                      <span className="time-value">
                        {new Date(exam.followUp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer">
                <button
                  onClick={() => router.push(`lich-su-kham-chua-benh/chi-tiet?id=${exam._id}`)}
                  className="detail-button"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}