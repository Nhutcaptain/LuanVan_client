// pages/doctors/[id].tsx
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';
import { DoctorInterface } from '@/interface/DoctorInterface';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import UploadImageComponent from '@/components/UploadImage/UploadImageComponent';
import Swal from 'sweetalert2';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '@/services/uploadAvatarService';
import AddressSelector from '@/components/AddressSelectorComponent/AddressSelector';
import { AddressForm } from '@/interface/AddressForm';

const DoctorDetailPage = () => {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: {
      houseNumber: '',
      ward: {
        name: '',
        id: 0
      },
      district: {
        name: '',
        id: 0
      },
      province: {
        name: '',
        id: 0
      }
    },
    avatar: {
      publicId: '',
      url: '',
    }
  });

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
          address: res.data.userId.address,
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
        address: doctor.userId.address,
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

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !doctor) return;

      const updatedData = {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        avatar: formData.avatar,
      };

      Swal.fire({
        title: 'Đang cập nhật bác sĩ',
        text: 'Vui lòng chờ trong giây lát',
        icon: 'info',
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if(avatarFile) {
        if(doctor.userId.avatar.url) {
          await deleteImageFromCloudinary(updatedData.avatar.publicId);
        }
        const {publicId, url} = await uploadImageToCloudinary(avatarFile);
        updatedData.avatar.publicId = publicId;
        updatedData.avatar.url = url;
      }

      const res = await api.put('/users/update', updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if(res.status === 200) {
        Swal.close();
        Swal.fire({
          title: "Đã cập nhật thông tin bác sĩ thành công",
          icon: "success",
          timer: 1000
        });
      }

      setDoctor(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating doctor:', err);
      Swal.fire({
        title: "Có lỗi xảy ra",
        text: "Không thể cập nhật thông tin bác sĩ",
        icon: "error"
      });
    }
  };

  const setAddressWrapper: React.Dispatch<React.SetStateAction<AddressForm>> = (value) => {
    setFormData((prev) => ({
      ...prev,
      address: typeof value === 'function' ? value(prev.address) : value,
    }));
  };

  if (loading) {
    return <div className="loading-container">Đang tải thông tin bác sĩ...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!doctor || !doctor.userId) {
    return <div className="loading-container">Không tìm thấy thông tin bác sĩ</div>;
  }

  return (
    <div className="doctor-profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="avatar-section">
          {isEditing ? (
            <UploadImageComponent 
              onFileSelect={(file) => setAvatarFile(file)}
              initialAvatar={formData.avatar.url}
              size={180}
            />
          ) : (
            <img 
              src={doctor.userId?.avatar.url || '/default-avatar.png'} 
              alt={doctor.userId?.fullName} 
              className="doctor-avatar"
            />
          )}
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="edit-input name-input"
              placeholder="Họ và tên"
            />
          ) : (
            <h1 className="doctor-name">{doctor.userId.fullName}</h1>
          )}
          
          <p className="specialization">{doctor.specialization}</p>
          
          <div className="contact-info">
            <p className="contact-item">
              <span className="label">Email:</span> 
              <span className="value">{doctor.userId.email}</span>
            </p>
            
            {isEditing ? (
              <div className="contact-item">
                <span className="label">Điện thoại:</span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="edit-input"
                  placeholder="Số điện thoại"
                />
              </div>
            ) : (
              <p className="contact-item">
                <span className="label">Điện thoại:</span> 
                <span className="value">{doctor.userId.phone}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {isEditing ? (
          <>
            <button onClick={handleSaveClick} className="btn save-btn">
              <i className="fas fa-save"></i> Lưu thay đổi
            </button>
            <button onClick={handleCancelClick} className="btn cancel-btn">
              <i className="fas fa-times"></i> Hủy
            </button>
          </>
        ) : (
          <button onClick={handleEditClick} className="btn edit-btn">
            <i className="fas fa-edit"></i> Chỉnh sửa thông tin
          </button>
        )}
      </div>

      {/* Personal Information */}
      <div className="info-section">
        <h2 className="section-title">Thông tin cá nhân</h2>
        <div className="info-grid">
          <div className="info-column">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <p className="info-item">
                  <span className="label">Giới tính:</span> 
                  <span className="value">{doctor.userId.gender === 'male' ? 'Nam' : 'Nữ'} (không thể thay đổi)</span>
                </p>
              </>
            ) : (
              <>
                <p className="info-item">
                  <span className="label">Ngày sinh:</span> 
                  <span className="value">{formatDate(doctor.userId.dateOfBirth)}</span>
                </p>
                <p className="info-item">
                  <span className="label">Giới tính:</span> 
                  <span className="value">{doctor.userId.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                </p>
              </>
            )}
          </div>
          
          <div className="info-column">
            <p className="info-item">
              <span className="label">Địa chỉ:</span>
            </p>
            {isEditing ? (
              <AddressSelector form={formData.address} setForm={setAddressWrapper} />
            ) : (
              <p className="address-value">
                {doctor.userId.address?.houseNumber && `${doctor.userId.address.houseNumber}, `}
                {doctor.userId.address?.ward?.name && `${doctor.userId.address.ward.name}, `}
                {doctor.userId.address?.district?.name && `${doctor.userId.address.district.name}, `}
                {doctor.userId.address?.province?.name && doctor.userId.address.province.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="info-section">
        <h2 className="section-title">Thông tin chuyên môn</h2>
        
        <div className="professional-section">
          <h3 className="subsection-title">Kinh nghiệm</h3>
          <ul className="professional-list">
            {doctor.experience.map((exp, index) => (
              <li key={index} className="professional-item">
                <i className="fas fa-check-circle"></i> {exp}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="professional-section">
          <h3 className="subsection-title">Chứng chỉ</h3>
          <ul className="professional-list">
            {doctor.certificate.map((cert, index) => (
              <li key={index} className="professional-item">
                <i className="fas fa-certificate"></i> {cert}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;