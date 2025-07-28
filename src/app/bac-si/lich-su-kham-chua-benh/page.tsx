'use client'
import { useState, useEffect } from 'react';
import "./styles.css";
import api from '@/lib/axios';
import { ExaminationFormData } from '@/interface/ExaminationInterface';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExaminationList = () => {
  const [examinations, setExaminations] = useState<ExaminationFormData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [stats, setStats] = useState<{total: number, examining: number, waiting_result: number, completed: number} | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [dailyData, setDailyData] = useState<{date: string, count: number}[]>([]);

  const router = useRouter();

  useEffect(() => {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (viewMode === 'day') {
          const res = await api.get(`/examination/getExaminationByDate/${doctorId}`, {
            params: { date: selectedDate }
          });
          setExaminations(res.data);
        } else {
          const res = await api.get(`/examination/getExaminationByMonth/${doctorId}`, {
            params: { month: selectedMonth }
          });
          setExaminations(res.data.examinations);
          setStats(res.data.stats);
          
          // Chuẩn bị dữ liệu biểu đồ theo ngày
          const dailyCounts: Record<string, number> = {};
          res.data.examinations.forEach((exam: ExaminationFormData) => {
            const date = new Date(exam.date).toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          });
          
          const formattedData = Object.keys(dailyCounts).map(date => ({
            date: new Date(date).toLocaleDateString('vi-VN'),
            count: dailyCounts[date]
          }));
          
          setDailyData(formattedData);
        }
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu khám bệnh');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedMonth, viewMode, router]);

  const filteredExaminations = examinations.filter(exam => 
    (exam.patientId as any).fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.provisional?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'day' ? 'month' : 'day');
    setShowChart(false); // Ẩn biểu đồ khi chuyển chế độ xem
  };

  const toggleChart = () => {
    setShowChart(prev => !prev);
  };

  return (
    <div className="examination-container">
      <h1>Danh Sách Khám Bệnh</h1>
      
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân hoặc chẩn đoán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={toggleViewMode} className="toggle-button">
          Chuyển sang {viewMode === 'day' ? 'Xem Theo Tháng' : 'Xem Theo Ngày'}
        </button>

        {viewMode === 'day' ? (
          <div className="date-picker">
            <label htmlFor="date">Chọn Ngày:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        ) : (
          <div className="month-picker">
            <label htmlFor="month">Chọn Tháng:</label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
            <button onClick={toggleChart} className="chart-button">
              {showChart ? 'Ẩn Biểu Đồ' : 'Xem Biểu Đồ'}
            </button>
          </div>
        )}
      </div>

      {loading && <div className="loading">Đang tải...</div>}
      {error && <div className="error">{error}</div>}

      {viewMode === 'month' && stats && (
        <div className="stats-container">
          <h2>Thống Kê Tháng</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Tổng Số Ca</h3>
              <p>{stats.total}</p>
            </div>
            <div className="stat-card">
              <h3>Đang Khám</h3>
              <p>{stats.examining}</p>
            </div>
            <div className="stat-card">
              <h3>Chờ Kết Quả</h3>
              <p>{stats.waiting_result}</p>
            </div>
            <div className="stat-card">
              <h3>Đã Hoàn Thành</h3>
              <p>{stats.completed}</p>
            </div>
          </div>
          
          {showChart && dailyData.length > 0 && (
            <div className="chart-container">
              <h3>Số lượng bệnh nhân theo ngày</h3>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={dailyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Số bệnh nhân" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="examination-list">
        <h2>{viewMode === 'day' ? `Danh sách khám ngày ${selectedDate}` : `Danh sách khám tháng ${selectedMonth}`}</h2>
        
        {filteredExaminations.length === 0 && !loading && (
          <div className="no-results">Không tìm thấy dữ liệu khám bệnh</div>
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
                <h3>{(exam.patientId as any).fullName || 'Bệnh nhân không tên'}</h3>
                <p>Mã bệnh nhân: {exam.patientCode || 'N/A'}</p>
              </div>
              <div className="diagnosis">
                <h4>Chẩn đoán tạm thời:</h4>
                <p>{exam.provisional || 'Chưa có chẩn đoán'}</p>
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
};

export default ExaminationList;