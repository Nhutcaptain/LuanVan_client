'use client'
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './styles.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00c49f'];

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

      // Lấy thống kê tổng số ca
      const resStats = await api.get(`/examination/stats/${doctorId}`, { params });
      setStatsData(resStats.data);

      // Lấy thống kê theo bệnh nếu bật chế độ
      if (showDiseaseChart) {
        const resDisease = await api.get(`/examination/stats/${doctorId}`, {
          params: { ...params, byDisease: true }
        });
        setDiseaseStats(resDisease.data);
      }

      // Lấy danh sách bệnh án
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

  return (
    <div className="examination-container">
      <h1>Thống kê & Danh Sách Khám Bệnh</h1>

      {/* Bộ lọc */}
      <div className="controls">
        <select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)}>
          <option value="day">Theo ngày</option>
          <option value="week">Theo tuần</option>
          <option value="month">Theo tháng</option>
        </select>

        {viewMode === 'day' || viewMode === 'week' ? (
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        ) : (
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        )}

        <input
          type="text"
          placeholder="Tìm kiếm tên bệnh nhân hoặc chẩn đoán..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => setShowDiseaseChart(!showDiseaseChart)}>
          {showDiseaseChart ? 'Ẩn thống kê bệnh' : 'Xem thống kê theo bệnh'}
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Đang tải...</p>}

      {/* Biểu đồ theo thời gian */}
      {!loading && statsData.length > 0 && (
        <div className="chart-container">
          <h2>Số lượng bệnh nhân ({viewMode})</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" name="Số bệnh nhân" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Biểu đồ theo bệnh */}
      {showDiseaseChart && diseaseStats.length > 0 && (
        <div className="chart-container">
          <h2>Top bệnh phổ biến</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={diseaseStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {diseaseStats.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Danh sách bệnh án */}
      <div className="examination-list">
        <h2>Danh sách bệnh án</h2>
        {filteredExaminations.length === 0 && !loading && (
          <div className="no-results">Không tìm thấy dữ liệu</div>
        )}
        {filteredExaminations.map((exam, index) => (
          <div key={exam._id} className="examination-card">
            <div className="card-header">
              <span className="index">#{index + 1}</span>
              <span className="status" data-status={exam.status}>
                {exam.status === 'completed' ? 'Đã hoàn thành' :
                  exam.status === 'examining' ? 'Đang khám' :
                    exam.status === 'waiting_result' ? 'Chờ kết quả' : exam.status}
              </span>
            </div>
            <div className="card-body">
              <div className="patient-info">
                <h3>{(exam.patientId as any)?.fullName || 'Bệnh nhân không tên'}</h3>
                <p>Mã bệnh nhân: {exam.patientCode || 'N/A'}</p>
              </div>
              <div className="diagnosis">
                <h4>Chẩn đoán tạm thời:</h4>
                <p>{exam.assessment || 'Chưa có chẩn đoán'}</p>
              </div>
              <div className="time-info">
                <p>Ngày: {new Date(exam.date).toLocaleString('vi-VN')}</p>
                {exam.followUp && <p>Tái khám: {new Date(exam.followUp).toLocaleDateString('vi-VN')}</p>}
              </div>
            </div>
            <div className="card-footer">
              <button
                className="details-button"
                onClick={() => router.push(`lich-su-kham-chua-benh/chi-tiet?id=${exam._id}`)}
              >
                Xem Chi Tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
