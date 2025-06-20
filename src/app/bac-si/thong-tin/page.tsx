// pages/doctors/[id].tsx
'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles.css';
import { DoctorInterface } from '@/interface/DoctorInterface';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const DoctorDetailPage = () => {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    avatar: {
      publicId: '',
      url: '',
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if(!token) return;
        const res = await api.get(`/doctors/get`, {
          headers: {Authorization: `Bearer ${token}`}
        });
        setDoctor(res.data);
        setFormData({
          fullName: res.data.userId.fullName,
          phone: res.data.userId.phone,
          dateOfBirth: res.data.userId.dateOfBirth ? new Date(res.data.userId.dateOfBirth).toISOString().split('T')[0] : '',
          address: `${res.data.userId.address?.houseNumber || ''}, ${res.data.userId.address?.ward?.name || ''}, ${res.data.userId.address?.district?.name || ''}, ${res.data.userId.address?.province?.name || ''}`,
          avatar: res.data.userId.avatar || ''
        });
      } catch (err) {
        setError('Failed to fetch doctor data');
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (doctor) {
      setFormData({
        fullName: doctor.userId.fullName,
        phone: doctor.userId.phone,
        dateOfBirth: doctor.userId.dateOfBirth ? new Date(doctor.userId.dateOfBirth).toISOString().split('T')[0] : '',
        address: `${doctor.userId.address?.houseNumber || ''}, ${doctor.userId.address?.ward?.name || ''}, ${doctor.userId.address?.district?.name || ''}, ${doctor.userId.address?.province?.name || ''}`,
        avatar: doctor.userId.avatar || ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      // reader.onloadend = () => {
      //   setFormData(prev => ({
      //     ...prev,
      //     avatar: reader.result as string
      //   }));
      // };
      // reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !doctor) return;

      const updatedData = {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        avatar: formData.avatar
      };

      const res = await api.put(`/doctors/update`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDoctor(res.data);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Error updating doctor:', err);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  if (loading) {
    return <div className="loading" style={{ fontSize: '1.5rem' }}>Loading...</div>;
  }

  if (error) {
    return <div className="error" style={{ fontSize: '1.5rem' }}>{error}</div>;
  }

  if (!doctor || !doctor.userId) {
    return <div style={{ fontSize: '1.5rem' }}>
      Không tìm thấy bác sĩ<br />
      <pre>{JSON.stringify(doctor, null, 2)}</pre>
    </div>;
  }

  return (
    <div className="doctor-detail-container" style={{ fontSize: '1.2rem' }}>
      <div className="doctor-header">
        <div className="avatar-container">
          {isEditing ? (
            <>
              <img 
                src={formData.avatar.url || '/default-avatar.png'} 
                alt={formData.fullName || 'Doctor'} 
                className="doctor-avatar"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer', width: '200px', height: '200px' }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="change-avatar-btn"
                style={{ fontSize: '1.2rem' }}
              >
                Đổi ảnh đại diện
              </button>
            </>
          ) : (
            <img 
              src={doctor.userId?.avatar.url || '/default-avatar.png'} 
              alt={doctor.userId?.fullName || 'Doctor'} 
              className="doctor-avatar"
              style={{ width: '200px', height: '200px' }}
            />
          )}
        </div>
        <div className="doctor-info">
          {isEditing ? (
            <>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="edit-input"
                style={{ fontSize: '1.5rem', padding: '0.8rem' }}
              />
              <p className="specialization" style={{ fontSize: '1.4rem' }}>{doctor.specialization}</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '2.2rem' }}>{doctor.userId.fullName}</h1>
              <p className="specialization" style={{ fontSize: '1.4rem' }}>{doctor.specialization}</p>
            </>
          )}
          
          <div className="contact-info" style={{ fontSize: '1.3rem' }}>
            {isEditing ? (
              <>
                <p>
                  <strong>Email:</strong> {doctor.userId.email} (không thể thay đổi)
                </p>
                <p>
                  <strong>Điện thoại:</strong>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                    style={{ fontSize: '1.3rem', padding: '0.7rem' }}
                  />
                </p>
              </>
            ) : (
              <>
                <p><strong>Email:</strong> {doctor.userId.email}</p>
                <p><strong>Điện thoại:</strong> {doctor.userId.phone}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="action-buttons" style={{ margin: '1.5rem 0' }}>
        {isEditing ? (
          <>
            <button onClick={handleSaveClick} className="save-btn" style={{ fontSize: '1.3rem', padding: '0.8rem 1.8rem' }}>
              Lưu thay đổi
            </button>
            <button onClick={handleCancelClick} className="cancel-btn" style={{ fontSize: '1.3rem', padding: '0.8rem 1.8rem' }}>
              Hủy
            </button>
          </>
        ) : (
          <button onClick={handleEditClick} className="edit-btn" style={{ fontSize: '1.3rem', padding: '0.8rem 1.8rem' }}>
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      <div className="doctor-details">
        <section className="personal-info" style={{ padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Thông tin cá nhân</h2>
          <div className="info-grid">
            <div style={{ fontSize: '1.3rem' }}>
              {isEditing ? (
                <>
                  <p>
                    <strong>Ngày sinh:</strong>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="edit-input"
                      style={{ fontSize: '1.3rem', padding: '0.7rem', marginTop: '0.5rem' }}
                    />
                  </p>
                  <p style={{ marginTop: '1rem' }}>
                    <strong>Giới tính:</strong> {doctor.userId.gender} (không thể thay đổi)
                  </p>
                </>
              ) : (
                <>
                  <p><strong>Ngày sinh:</strong> {formatDate(doctor.userId.dateOfBirth)}</p>
                  <p style={{ marginTop: '1rem' }}><strong>Giới tính:</strong> {doctor.userId.gender}</p>
                </>
              )}
            </div>
            <div style={{ fontSize: '1.3rem' }}>
              <p><strong>Địa chỉ:</strong></p>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="edit-textarea"
                  rows={4}
                  style={{ fontSize: '1.3rem', padding: '0.8rem', marginTop: '0.5rem' }}
                />
              ) : (
                <p style={{ marginTop: '0.5rem' }}>
                  {doctor.userId.address?.houseNumber && `${doctor.userId.address.houseNumber}, `}
                  {doctor.userId.address?.ward?.name && `${doctor.userId.address.ward}, `}
                  {doctor.userId.address?.district?.name && `${doctor.userId.address.district.name}, `}
                  {doctor.userId.address?.province?.name && doctor.userId.address.province.name}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="professional-info" style={{ padding: '1.8rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Thông tin chuyên môn</h2>
          <div className="experience-section" style={{ fontSize: '1.3rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Kinh nghiệm</h3>
            <ul style={{ marginTop: '1rem' }}>
              {doctor.experience.map((exp, index) => (
                <li key={index} style={{ marginBottom: '1rem' }}>{exp}</li>
              ))}
            </ul>
          </div>

          <div className="certificates-section" style={{ fontSize: '1.3rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>Chứng chỉ</h3>
            <ul style={{ marginTop: '1rem' }}>
              {doctor.certificate.map((cert, index) => (
                <li key={index} style={{ marginBottom: '1rem' }}>{cert}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="schedule-section" style={{ padding: '1.8rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Lịch làm việc</h2>
          {doctor.schedule && (
            <div style={{ fontSize: '1.3rem' }}>
              <p><strong>Ngày:</strong> {formatDate(doctor.schedule.date)}</p>
              <p style={{ marginTop: '1rem' }}><strong>Giờ:</strong> {doctor.schedule.time}</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Ca làm việc:</strong>
                <ul className="shifts-list" style={{ marginTop: '0.8rem' }}>
                  {doctor.schedule.shifts.map((shift, index) => (
                    <li key={index} style={{ fontSize: '1.3rem', padding: '0.8rem 1.2rem' }}>{shift}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DoctorDetailPage;