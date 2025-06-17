'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';

const ProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await api.get('/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user || res.data);
      } catch (error) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải thông tin...</div>;
  if (!profile) return <div className="p-8 text-center text-red-600">Không tìm thấy thông tin cá nhân.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Thông tin cá nhân</h2>
      <div className="space-y-3">
        <div><b>Họ và tên:</b> {profile.fullName}</div>
        <div><b>Email:</b> {profile.email}</div>
        <div><b>Số điện thoại:</b> {profile.phone}</div>
        <div><b>Ngày sinh:</b> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : ''}</div>
        <div><b>Giới tính:</b> {profile.gender}</div>
        <div><b>Địa chỉ:</b> {profile.address ? `${profile.address.houseNumber || ''} ${profile.address.ward || ''} ${profile.address.district || ''} ${profile.address.province || ''}` : ''}</div>
        <div><b>Vai trò:</b> {profile.role}</div>
      </div>
    </div>
  );
};

export default ProfilePage;