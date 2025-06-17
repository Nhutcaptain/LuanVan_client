'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const VerifyEmailPage = () => {
  const [message, setMessage] = useState('Đang xác minh...');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setMessage('Thiếu mã xác minh!');
      return;
    }
    api.get(`/auth/verify?token=${token}`)
      .then(async res => {
        setMessage(res.data.message || 'Xác minh thành công! Đang đăng nhập...');
        // Nếu backend trả về email và password tạm hoặc token đăng nhập:
        // Ví dụ: res.data.email, res.data.tempPassword
        // Hoặc bạn yêu cầu người dùng nhập lại mật khẩu ở bước đăng ký và lưu vào localStorage/sessionStorage
        // Ví dụ tự động đăng nhập:
        // await api.post('/auth/login', { email: res.data.email, password: res.data.tempPassword });
        // Hoặc nếu backend trả về token:
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          setTimeout(() => router.push('/'), 1500);
        } else {
          // Nếu không có token, chuyển hướng về trang đăng nhập
          setTimeout(() => router.push('/tai-khoan/dang-nhap'), 2000);
        }
      })
      .catch(err => {
        setMessage(err.response?.data?.message || 'Xác minh thất bại!');
      });
  }, [router]);

  return (
    <div className="w-full flex justify-center items-center min-h-[300px]">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Xác minh email</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;