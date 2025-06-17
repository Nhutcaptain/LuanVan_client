'use client';
import { SetStateAction, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import AddressSelector from '@/components/AddressSelectorComponent/AddressSelector';
import { AddressForm } from '@/interface/AddressForm';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
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
    }
  });
  const MySwal = withReactContent(Swal)

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
          }
        });
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const formData = new FormData();
        formData.append('avatar', e.target.files[0]);
        
        const res = await api.put('/auth/avatar', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setProfile(res.data.user || res.data);
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md">
        <h2 className="text-3xl font-bold text-red-600 mb-6">Không tìm thấy thông tin cá nhân</h2>
        <p className="text-xl text-gray-600">Vui lòng đăng nhập để xem thông tin cá nhân</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 sm:px-8 lg:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition text-lg"
                >
                  <PencilIcon className="h-6 w-6" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white text-gray-600 px-6 py-3 rounded-md hover:bg-gray-100 transition text-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-white text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition text-lg"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Avatar Section */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={profile.avatar || '/default-avatar.png'}
                    alt="Avatar"
                    className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-3 rounded-full cursor-pointer hover:bg-blue-600 transition group-hover:opacity-100 opacity-0">
                    <CameraIcon className="h-6 w-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-semibold">{profile.fullName}</h3>
                  <p className="text-xl text-gray-500">{profile.role}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-grow">
                {isEditing ? (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Họ và tên</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Ngày sinh</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Giới tính</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t-2 pt-6">
                      <h4 className="text-2xl font-medium mb-4">Địa chỉ</h4>
                      <AddressSelector form={formData.address} setForm={setAddressWrapper}></AddressSelector>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-500">Họ và tên</h4>
                        <p className="mt-2 text-xl">{profile.fullName}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-500">Email</h4>
                        <p className="mt-2 text-xl">{profile.email}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-500">Số điện thoại</h4>
                        <p className="mt-2 text-xl">{profile.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-500">Ngày sinh</h4>
                        <p className="mt-2 text-xl">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-500">Giới tính</h4>
                        <p className="mt-2 text-xl">{profile.gender || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                    <div className="border-t-2 pt-6">
                      <h4 className="text-2xl font-medium mb-4">Địa chỉ</h4>
                      <p className="text-xl">
                        {profile.address
                          ? `${profile.address.houseNumber ? profile.address.houseNumber + ', ' : ''}
                             ${profile.address.ward ? profile.address.ward.name + ', ' : ''}
                             ${profile.address.district ? profile.address.district.name + ', ' : ''}
                             ${profile.address.province.name || ''}`
                          : 'Chưa cập nhật địa chỉ'}
                      </p>
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