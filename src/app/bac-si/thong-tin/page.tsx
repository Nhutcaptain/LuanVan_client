// pages/doctors/[id].tsx
'use client'
import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if(!token) return;
        const res = await api.get(`/doctors/get`,{
            headers: {Authorization: `Bearer ${token}`}
        });
        setDoctor(res.data);
        console.log(res.data);
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

 if (!doctor || !doctor.userId) {
  return <div>
    Không tìm thấy bác sĩ<br />
    <pre>{JSON.stringify(doctor, null, 2)}</pre>
  </div>;
}

  return (
    <div className="doctor-detail-container">
      <div className="doctor-header">
        <div className="avatar-container">
          <img 
            src={doctor.userId?.avatar || '/default-avatar.png'} 
            alt={doctor.userId?.fullName || 'Doctor'} 
            className="doctor-avatar"
          />
        </div>
        <div className="doctor-info">
          <h1>{doctor.userId.fullName}</h1>
          <p className="specialization">{doctor.specialization}</p>
          <div className="contact-info">
            <p><strong>Email:</strong> {doctor.userId.email}</p>
            <p><strong>Điện thoại:</strong> {doctor.userId.phone}</p>
          </div>
        </div>
      </div>

      <div className="doctor-details">
        <section className="personal-info">
          <h2>Thông tin cá nhân</h2>
          <div className="info-grid">
            <div>
              <p><strong>Ngày sinh:</strong> {formatDate(doctor.userId.dateOfBirth)}</p>
              <p><strong>Giới tính:</strong> {doctor.userId.gender}</p>
            </div>
            <div>
              <p><strong>Địa chỉ:</strong></p>
              <p>
                {doctor.userId.address?.houseNumber && `${doctor.userId.address.houseNumber}, `}
                {doctor.userId.address?.ward?.name && `${doctor.userId.address.ward}, `}
                {doctor.userId.address?.district?.name && `${doctor.userId.address.district.name}, `}
                {doctor.userId.address?.province?.name && doctor.userId.address.province.name}
              </p>
            </div>
          </div>
        </section>

        <section className="professional-info">
          <h2>Thông tin chuyên môn</h2>
          <div className="experience-section">
            <h3>Kinh nghiệm</h3>
            <ul>
              {doctor.experience.map((exp, index) => (
                <li key={index}>{exp}</li>
              ))}
            </ul>
          </div>

          <div className="certificates-section">
            <h3>Chứng chỉ</h3>
            <ul>
              {doctor.certificate.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="schedule-section">
          <h2>Lịch làm việc</h2>
          {doctor.schedule && (
            <div>
              <p><strong>Ngày:</strong> {formatDate(doctor.schedule.date)}</p>
              <p><strong>Giờ:</strong> {doctor.schedule.time}</p>
              <div>
                <strong>Ca làm việc:</strong>
                <ul className="shifts-list">
                  {doctor.schedule.shifts.map((shift, index) => (
                    <li key={index}>{shift}</li>
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