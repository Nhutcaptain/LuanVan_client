'use client';

import { useState, useEffect } from 'react';
import './styles.css';
import { IPatient } from '@/interface/patientInterface';
import api from '@/lib/axios';

interface Props {
  onPatientSelect: (patient: IPatient | null) => void;
  onPatientUpdate?: (updatedPatient: IPatient) => void;
  onSubmit?: () => void;
  patientId: string;
}

const PatientInfoLookup = ({ onPatientSelect, onPatientUpdate, onSubmit, patientId }: Props) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<IPatient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    allergies: '',
    medicalHistory: ''
  });

  useEffect(() => {
    if (selectedPatient) {
      setEditForm({
        allergies: selectedPatient.allergies || '',
        medicalHistory: selectedPatient.medicalHistory || ''
      });
    }
  }, [selectedPatient]);

  useEffect(() => {
    if(!patientId) return;
    const fetchPatient = async() => {
      const res = await api.get(`patient/getPatientWithId/${patientId}`)
      if(res.status === 200) {
        handleSelectPatient(res.data);
      }
    }
    fetchPatient();
  },[patientId])

  const handleSearch = async () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setSearchAttempted(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/patient/getPatientWithName', {
        fullName,
        phone: phoneNumber,
      });
      
      setPatients([res.data]);
      setSearchAttempted(true);
      handleSelectPatient(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPatient = (patient: IPatient) => {
    setSelectedPatient(patient);
    setFullName(patient.userId.fullName);
    setPhoneNumber(patient.userId.phone);
    setPatients([]);
    onPatientSelect(patient);
    setIsEditing(false); // Reset trạng thái chỉnh sửa khi chọn bệnh nhân mới
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUpdate = async () => {
    if (!selectedPatient) return;

    try {
      setIsLoading(true);
      const updatedData = {
        allergies: editForm.allergies,
        medicalHistory: editForm.medicalHistory
      };

      // Gọi API cập nhật
      const res = await api.patch(`/patient/${selectedPatient._id}`, updatedData);
      
      // Cập nhật state và thông báo cho component cha
      const updatedPatient = { ...selectedPatient, ...updatedData };
      setSelectedPatient(updatedPatient);
      if (onPatientUpdate) {
        onPatientUpdate(updatedPatient);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setFullName('');
    setPhoneNumber('');
    setPatients([]);
    setSelectedPatient(null);
    setSearchAttempted(false);
    onPatientSelect(null); // Reset callback
  };

  // Thêm hiệu ứng focus khi nhập
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="patient-lookup-container">
      {/* <div className="search-section">
        <h2>Tìm Kiếm Bệnh Nhân</h2>
        <div className="search-fields">
          <div className="form-group">
            <label htmlFor="fullName">Họ và Tên</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập họ tên đầy đủ"
              disabled={selectedPatient !== null}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Số Điện Thoại</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập số điện thoại"
              disabled={selectedPatient !== null}
              required
            />
          </div>

          <div className="search-actions">
            {!selectedPatient ? (
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading || (!fullName.trim() || !phoneNumber.trim())}
                className="search-button"
              >
                {isLoading ? 'Đang tìm kiếm...' : 'Tìm Kiếm'}
              </button>
            ) : (
              <button
                type="button"
                onClick={resetSearch}
                className="change-patient-button"
              >
                Chọn Bệnh Nhân Khác
              </button>
            )}
          </div>
        </div>

        {searchAttempted && (!fullName.trim() || !phoneNumber.trim()) && (
          <div className="error-message">Vui lòng nhập cả họ tên và số điện thoại</div>
        )}
      </div>

      {isLoading && <div className="loading-indicator">Đang tải dữ liệu...</div>}
      {!isLoading && patients.length > 1 && !selectedPatient && (
        <div className="patient-results">
          <h3>Kết Quả Tìm Kiếm ({patients.length})</h3>
          <ul>
            {patients.map((patient) => (
              <li key={patient.userId._id} onClick={() => handleSelectPatient(patient)}>
                <div className="patient-info">
                  <div className="patient-name">{patient.userId.fullName}</div>
                  <div className="patient-details">
                    <span>{patient.userId.phone}</span>
                    <span>|</span>
                    <span>{new Date(patient.userId.dateOfBirth).toLocaleDateString()}</span>
                    <span>|</span>
                    <span>{patient.userId.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )} */}

      {!isLoading && searchAttempted && patients.length === 0 && !selectedPatient && (
        <div className="no-results">
          Không tìm thấy bệnh nhân phù hợp. Vui lòng kiểm tra lại thông tin.
        </div>
      )}


      {/* Hiển thị thông tin bệnh nhân khi:
          1. Đã chọn thủ công
          2. Hoặc tìm thấy chính xác 1 bệnh nhân */}
      {(selectedPatient || patients.length === 1) && (
        <div className="patient-detail-section">
          <h3>Thông Tin Bệnh Nhân</h3>
          {!isEditing ? (
              <button 
                onClick={handleEditToggle}
                className="edit-button"
              >
                Cập Nhật Tình Trạng
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  onClick={handleSaveUpdate}
                  disabled={isLoading}
                  className="save-button"
                >
                  {isLoading ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                </button>
                <button 
                  onClick={handleEditToggle}
                  className="cancel-button"
                >
                  Hủy
                </button>
              </div>
            )}
          <div className="patient-info-card">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Họ tên:</span>
                <span className="info-value">
                  {(selectedPatient || patients[0]).userId.fullName}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Mã bệnh nhân: </span>
                <span className="info-value">
                  {(selectedPatient || patients[0]).patientCode}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày sinh:</span>
                <span className="info-value">
                  {new Date((selectedPatient || patients[0]).userId.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Giới tính:</span>
                <span className="info-value">
                  {(selectedPatient || patients[0]).userId.gender === 'male' ? 'Nam' : 'Nữ'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Số điện thoại:</span>
                <span className="info-value">
                  {(selectedPatient || patients[0]).userId.phone}
                </span>
              </div>
            </div>

            {((selectedPatient || patients[0]).allergies) && (
              <div className="warning-section">
                <h4>Thông Tin Dị Ứng</h4>
                {isEditing ? (
                <textarea
                  name="allergies"
                  value={editForm.allergies}
                  onChange={handleEditChange}
                  className="edit-textarea"
                  placeholder="Nhập thông tin dị ứng..."
                />
              ) : (
                <div className={`display-content ${selectedPatient?.allergies ? 'has-content' : 'no-content'}`}>
                  {selectedPatient?.allergies || 'Không có thông tin dị ứng'}
                </div>
              )}
                
              </div>
            )}

            {((selectedPatient || patients[0]).medicalHistory) && (
              <div className="medical-history-section">
                <h4>Tiền Sử Bệnh Lý</h4>
                {isEditing ? (
                <textarea
                  name="medicalHistory"
                  value={editForm.medicalHistory}
                  onChange={handleEditChange}
                  className="edit-textarea"
                  placeholder="Nhập tiền sử bệnh lý..."
                />
              ) : (
                <div className={`display-content ${selectedPatient?.medicalHistory ? 'has-content' : 'no-content'}`}>
                  {selectedPatient?.medicalHistory || 'Không có tiền sử bệnh lý'}
                </div>
              )}
                
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientInfoLookup;