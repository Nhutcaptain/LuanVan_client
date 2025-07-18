'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

const LoginGoogleSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Lấy token từ URL (?token=...)
    const handleToken = async() => {
      const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const callbackUrl = localStorage.getItem('callbackUrl');
    localStorage.removeItem('callbackUrl');
    if (token) {
      localStorage.setItem('token', token);
      Cookies.set('token', token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            expires: 30,
        });
      
      try {
        const response = await api.get('/auth/me')
        if(response.status === 200) {
          console.log(response.data);
          const fullName = response.data.fullName;
          const role = response.data.role;
          const userId = response.data._id;
          if(fullName) {
            localStorage.setItem('fullName', fullName);
            localStorage.setItem('role',role);
            localStorage.setItem('userId',userId);
            window.dispatchEvent(new Event('userChange')); // Cập nhật user trên toàn ứng dụng
          }
        }
        router.replace(callbackUrl ?? '/');
      }catch(error) {
        console.error('Lỗi khi lưu token:', error);
      }

    } else {
      // Nếu không có token, chuyển về trang đăng nhập
      router.push('/tai-khoan/dang-nhap');
    }
    }

    handleToken();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Đăng nhập Google thành công!</h2>
        <p>Bạn sẽ được chuyển về trang chủ...</p>
      </div>
    </div>
  );
};

export default LoginGoogleSuccessPage;