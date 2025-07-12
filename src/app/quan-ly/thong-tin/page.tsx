'use client';
import { SetStateAction, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import AddressSelector from '@/components/AddressSelectorComponent/AddressSelector';
import { AddressForm } from '@/interface/AddressForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import UploadImageComponent from '@/components/UploadImage/UploadImageComponent';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '@/services/uploadAvatarService';
import './styles.css';

interface OptionType {
  value: string;
  label: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    address: {
      houseNumber: '',
      ward: {
        name: '',
        code: 0
      },
      district: {
        name: '',
        code: 0
      },
      province: {
        name: '',
        code: 0
      }
    },
    avatar: {
      publicId: '',
      url: '',
    },
    ethnicity: '',
    idType: '',
    idNumber: '',
    healthInsuranceNumber: ''
  });
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = res.data.user || res.data;
        setProfile(userData);
        setFormData({
          occupation: '',
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
          gender: userData.gender || '',
          address: {
            houseNumber: userData.address?.houseNumber || '',
            ward: userData.address?.ward || '',
            district: userData.address?.district || '',
            province: userData.address?.province || ''
          },
          avatar: {
            publicId: userData.avatar.publicId,
            url: userData.avatar.url,
          },
          ethnicity: userData.ethnicity ||'',
          idType: userData.idType || '',
          idNumber: userData.idNumber || '',
          healthInsuranceNumber: userData.healthInsuranceNumber || '',
        });
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const idTypeOptions: OptionType[] = [
    { value: '', label: 'Chọn loại giấy tờ' },
    { value: 'Căn cước công dân', label: 'Căn cước công dân' },
    { value: 'Chứng minh nhân dân', label: 'Chứng minh nhân dân' },
    { value: 'Hộ chiếu', label: 'Hộ chiếu' },
    { value: 'Giấy phép lái xe', label: 'Giấy phép lái xe' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.put('/users/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.status == 200) {
          MySwal.fire({
            title: <strong className="text-2xl">Thông tin cá nhân</strong>,
            html: <i className="text-xl">Đã tải thông tin cá nhân thành công</i>,
            icon: 'success',
            showConfirmButton: true
          });
        }
      setProfile(res.data.user || res.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.files && e.target.files[0]) {
      const uploadData = {...formData}
      MySwal.fire({
        title: <strong className="text-2xl">Đang xử lý...</strong>,
        html: <i className="text-xl">Vui lòng chờ trong giây lát</i>,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });
      
      try {
        if(uploadData.avatar.publicId) {
          await deleteImageFromCloudinary(uploadData.avatar.publicId)
        }
        const {publicId, url} = await uploadImageToCloudinary(e.target.files[0]);
        uploadData.avatar.publicId = publicId;
        uploadData.avatar.url = url;
       const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.put('/users/update', uploadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
       MySwal.close();
      if(res.status == 200) {
          MySwal.fire({
            title: <strong className="text-2xl">Cập nhật hình ảnh</strong>,
            html: <i className="text-xl">Đã cập nhật ảnh đại diện thành công</i>,
            icon: 'success',
            showConfirmButton: true
          });
        }
      setProfile(res.data.user || res.data);
      setIsEditing(false);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const setAddressWrapper: React.Dispatch<React.SetStateAction<AddressForm>> = (value) => {
      setFormData((prev) => ({
        ...prev,
        address: typeof value === 'function' ? value(prev.address) : value,
      }));
    };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );

  if (!profile) return (
    <div className="error-container">
      <div className="error-card">
        <h2 className="error-title">Không tìm thấy thông tin cá nhân</h2>
        <p className="error-message">Vui lòng đăng nhập để xem thông tin cá nhân</p>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-header-content">
              <h1 className="profile-title">Thông tin cá nhân</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-button"
                >
                  <PencilIcon className="h-6 w-6" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="button-group">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cancel-button"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="save-button"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-body">
            <div className="profile-layout">
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-container">
                  <img
                    src={profile.avatar.url || '/default-avatar.png'}
                    alt="Avatar"
                    className="avatar-image"
                  />
                  <label className="avatar-upload">
                    <CameraIcon className="h-6 w-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="avatar-upload-input"
                    />
                  </label>
                </div>
                <div className="user-info">
                  <h3 className="user-name">{profile.fullName}</h3>
                  <p className="user-role">{profile.role}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="details-section">
                {isEditing ? (
                  <form className="edit-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Ngày sinh</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Giới tính</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>
                     <div className="additional-info-grid">
                      <div className="form-group">
                        <label className="form-label">Nghề nghiệp</label>
                        <input
                          type="text"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Nhập nghề nghiệp"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dân tộc</label>
                        <input
                          type="text"
                          name="ethnicity"
                          value={formData.ethnicity}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Nhập dân tộc"
                        />
                      </div>
                    </div>

                    <div className="id-section">
                      <h4 className="section-title">Thông tin giấy tờ</h4>
                      <div className="id-type-container">
                        <div className="form-group">
                          <label className="form-label">Loại giấy tờ</label>
                          <select
                            name="idType"
                            value={formData.idType}
                            onChange={handleInputChange}
                            className="form-select"
                          >
                            {idTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Số giấy tờ</label>
                          <input
                            type="text"
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Nhập số giấy tờ"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="health-section">
                      <h4 className="section-title">Bảo hiểm y tế</h4>
                      <div className="form-group">
                        <label className="form-label">Mã số BHYT</label>
                        <input
                          type="text"
                          name="healthInsuranceNumber"
                          value={formData.healthInsuranceNumber}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Nhập mã số BHYT"
                        />
                      </div>
                    </div>

                    <div className="address-section">
                      <h4 className="address-title">Địa chỉ</h4>
                      <AddressSelector form={formData.address} setForm={setAddressWrapper}></AddressSelector>
                    </div>
                  </form>
                ) : (
                  <div className="details-grid">
                    <div className="detail-item">
                      <h4 className="detail-label">Họ và tên</h4>
                      <p className="detail-value">{profile.fullName}</p>
                    </div>
                    <div className="detail-item">
                      <h4 className="detail-label">Email</h4>
                      <p className="detail-value">{profile.email}</p>
                    </div>
                    <div className="detail-item">
                      <h4 className="detail-label">Số điện thoại</h4>
                      <p className="detail-value">{profile.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div className="detail-item">
                      <h4 className="detail-label">Ngày sinh</h4>
                      <p className="detail-value">
                        {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <h4 className="detail-label">Giới tính</h4>
                      <p className="detail-value">{profile.gender || 'Chưa cập nhật'}</p>
                    </div>

                    <div className="address-section">
                      <h4 className="address-title">Địa chỉ</h4>
                      <p className="detail-value">
                        {profile.address
                          ? `${profile.address.houseNumber ? profile.address.houseNumber + ', ' : ''}
                             ${profile.address.ward ? profile.address.ward.name + ', ' : ''}
                             ${profile.address.district ? profile.address.district.name + ', ' : ''}
                             ${profile.address.province.name || ''}`
                          : 'Chưa cập nhật địa chỉ'}
                      </p>
                    </div>
                    <div className="detail-section">
                      <h4 className="section-title">Thông tin bổ sung</h4>
                      <div className="additional-info-grid">
                        <div className="detail-item">
                          <h4 className="detail-label">Nghề nghiệp</h4>
                          <p className="detail-value">{profile.occupation || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="detail-item">
                          <h4 className="detail-label">Dân tộc</h4>
                          <p className="detail-value">{profile.ethnicity || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4 className="section-title">Thông tin giấy tờ</h4>
                      <div className="detail-row">
                        <div className="detail-item">
                          <h4 className="detail-label">Loại giấy tờ</h4>
                          <p className="detail-value">{profile.idType || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="detail-item">
                          <h4 className="detail-label">Số giấy tờ</h4>
                          <p className="detail-value">{profile.idNumber || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4 className="section-title">Bảo hiểm y tế</h4>
                      <div className="detail-item">
                        <h4 className="detail-label">Mã số BHYT</h4>
                        <p className="detail-value">
                          {profile.healthInsuranceNumber || 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;