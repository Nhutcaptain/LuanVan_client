'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const LoginGoogleSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Lấy token từ URL (?token=...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      try {
        const res = api.get('/auth/me')
        .then((response) => {
          const fullName = response.data.fullName;
          const role = response.data.role;
          if(fullName) {
            localStorage.setItem('fullName', fullName);
            localStorage.setItem('role',role);
            window.dispatchEvent(new Event('userChange')); // Cập nhật user trên toàn ứng dụng
          }
        })
      }catch(error) {
        console.error('Lỗi khi lưu token:', error);
      }

      // Có thể gọi API lấy profile và lưu fullName nếu muốn
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      // Nếu không có token, chuyển về trang đăng nhập
      router.push('/tai-khoan/dang-nhap');
    }
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