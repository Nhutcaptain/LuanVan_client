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
            }catch(error) {
              console.error(error);
            }
        }

        fetchDoctorInfo();
    },[])
  return (
    <div className="doctor-list-container">
      <h1>Danh sách Bác sĩ theo Chuyên khoa</h1>
      
      {doctorsInfo.map((doctor, index) => (
        <Link  className="specialty-section" key={index} href={`/tim-bac-si/${doctor.nameSlug}`}>
          <h2 className="specialty-title">{doctor.specialization}</h2>
          
          <div className="doctors-grid">
            <div className="doctor-card">
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
                <p className="doctor-department">Khoa: {doctor.department || 'N/A'}</p>
                <p className="doctor-specialty">Chuyên khoa: {doctor.specialization}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DoctorList;