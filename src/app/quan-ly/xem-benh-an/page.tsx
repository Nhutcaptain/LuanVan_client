'use client'
import { useState } from 'react';
import './styles.css';
import { ExaminationDetail } from '@/interface/ExaminationInterface';
import api from '@/lib/axios';

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface ExaminationSummary {
  id: string;
  date: Date | string;
  doctorName: string;
  assessment: string;
}

// Hàm giả lập API
const fetchExaminationSummaries = async (): Promise<ExaminationSummary[]> => {
  // Giả lập API call
    const userId = localStorage.getItem('userId');
    const res = await api.get(`/examination/getSummary/${userId}`);
    console.log(res.data);
    return res.data;
};

const fetchExaminationDetail = async (id: string) => {
  // Giả lập API call
    const res = await api.get(`/examination/getDetail/${id}`);
    
    return res.data;
    
};

export default function XemBenhAnPage() {
  const [summaries, setSummaries] = useState<ExaminationSummary[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ExaminationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load danh sách summary khi component mount
  useState(() => {
    const loadSummaries = async () => {
      try {
        setLoading(true);
        const data = await fetchExaminationSummaries();
        setSummaries(data);
      } catch (err) {
        setError('Không thể tải danh sách bệnh án');
      } finally {
        setLoading(false);
      }
    };
    
    loadSummaries();
  });

  const handleSelectRecord = async (id: string) => {
    console.log(id);
    try {
      setLoading(true);
      const detail = await fetchExaminationDetail(id);
      setSelectedRecord(detail);
    } catch (err) {
      setError('Không thể tải chi tiết bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredSummaries = summaries.filter(summary =>
    summary.assessment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatDate(summary.date).includes(searchTerm)
  );

  return (
    <div className="examination-page">
      <h1 className="page-title">Hồ sơ bệnh án</h1>
      
      {loading && <div className="loading-indicator">Đang tải...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {selectedRecord ? (
        <div className="record-detail">
          <button 
            className="back-button"
            onClick={() => setSelectedRecord(null)}
            disabled={loading}
          >
            ← Quay lại danh sách
          </button>
          
          <div className="detail-header">
            <h2>Bệnh án ngày {formatDate(selectedRecord.date)}</h2>
            <p className="doctor-info">Bác sĩ: {selectedRecord.doctorName}</p>
          </div>
          
          <div className="detail-section">
            <h3>Triệu chứng chủ quan</h3>
            <p className="detail-content">{selectedRecord.subjective}</p>
          </div>
          
          <div className="detail-section">
            <h3>Triệu chứng khách quan</h3>
            <p className="detail-content">{selectedRecord.objective}</p>
          </div>
          
          <div className="detail-section">
            <h3>Chẩn đoán</h3>
            <p className="detail-content diagnosis">{selectedRecord.assessment}</p>
          </div>
          
          <div className="detail-section">
            <h3>Kế hoạch điều trị</h3>
            <p className="detail-content">{selectedRecord.plan}</p>
          </div>
          
          {selectedRecord.prescriptions.length > 0 && (
            <div className="detail-section">
              <h3>Đơn thuốc</h3>
              <div className="prescription-list">
                {selectedRecord.prescriptions.map((prescription, index) => (
                  <div key={index} className="prescription-item">
                    <p><strong>Thuốc:</strong> {prescription.medication}</p>
                    <p><strong>Liều lượng:</strong> {prescription.dosage}</p>
                    <p><strong>Cách dùng:</strong> {prescription.frequency}</p>
                    <p><strong>Thời gian:</strong> {prescription.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedRecord.notes && (
            <div className="detail-section">
              <h3>Ghi chú</h3>
              <p className="detail-content">{selectedRecord.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo chẩn đoán, bác sĩ hoặc ngày..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="record-list">
            {filteredSummaries.length > 0 ? (
              filteredSummaries.map((summary) => (
                <div 
                  key={summary.id} 
                  className="record-card"
                  onClick={() => handleSelectRecord(summary.id)}
                >
                  <div className="card-header">
                    <h3>{formatDate(summary.date)}</h3>
                    <span className="doctor-tag">{summary.doctorName}</span>
                  </div>
                  <p className="diagnosis-summary">
                    <strong>Chẩn đoán:</strong> {summary.assessment}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-results">
                {loading ? 'Đang tải...' : 'Không tìm thấy bệnh án phù hợp'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}