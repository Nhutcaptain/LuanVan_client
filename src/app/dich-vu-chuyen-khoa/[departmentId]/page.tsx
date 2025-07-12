'use client';
import { DoctorInterface } from '@/interface/DoctorInterface';
import './styles.css';
import { IUser } from '@/interface/usermodel';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Doctors {
  fullName: string;
  avatar: {
    publicId: string;
    url: string;
  };
  department: string;
  specialization: string;
  nameSlug: string;
}

const DoctorList = () => {
  const params = useParams();
  const departmentId = params.departmentId;

  const [doctorsInfo, setDoctorsInfo] = useState<Doctors[]>([]);

  useEffect(() => {
    const fetchDoctorInfo = async() => {
      try {
        const res = await api.get(`/department/getAll/${departmentId}`);
        if(res.status === 200) {
          setDoctorsInfo(res.data)
          console.log(res.data)
        }
      } catch(error) {
        console.error(error);
      }
    }

    fetchDoctorInfo();
  }, [])

  return (
    <div className="doctor-list-container">
      <div className="header-section">
        <h1 className="page-title">DANH SÁCH BÁC SĨ</h1>
        <p className="page-subtitle">Khoa {doctorsInfo[0]?.department || ''}</p>
      </div>
      
      <div className="doctors-list">
        {doctorsInfo.map((doctor, index) => (
          <Link 
            className="doctor-item" 
            key={index} 
            href={`/tim-bac-si/${doctor.nameSlug}`}
          >
            <div className="doctor-avatar-container">
              <img
                src={doctor.avatar.url || '/default-doctor.jpg'}
                alt={`${doctor.fullName}'s avatar`}
                className="doctor-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-doctor.jpg';
                }}
              />
            </div>
            
            <div className="doctor-info">
              <h3 className="doctor-name">{doctor.fullName}</h3>
              <div className="doctor-meta">
                <div className="meta-item">
                  <span className="meta-label">KHOA:</span>
                  <span className="meta-value">{doctor.department || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">CHUYÊN KHOA:</span>
                  <span className="meta-value">{doctor.specialization}</span>
                </div>
              </div>
            </div>
            
            <div className="view-profile">
              <span>XEM HỒ SƠ →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;