'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InputComponent from '@/components/InputComponent/InputComponent';
import api from '@/lib/axios';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId?: string;
}

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl');
    if (callbackUrl) {
      localStorage.setItem('callbackUrl', callbackUrl);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', form);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        const decodedToken = jwtDecode<DecodedToken>(res.data.token);
        if (decodedToken.userId) {
          localStorage.setItem('userId', decodedToken.userId);
        }
       Cookies.set('token', res.data.token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            expires: 30,
        });
        localStorage.setItem('fullName', res.data.fullName || '');
        localStorage.setItem('role', res.data.role || '');
        if (res.data.role === 'doctor') {
          localStorage.setItem('doctorId', res.data.doctorId);
        }
        window.location.href = '/'; // Redirect to home page
      } else {
        setErrorMsg('Đăng nhập thất bại!');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng trở lại</h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục sử dụng dịch vụ</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputComponent
            label="Email/Số điện thoại"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email hoặc số điện thoại"
            required
          />
          <InputComponent
            label="Mật khẩu"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            required
            isShowPasswordToggle
          />

          <div className="flex justify-end">
            <Link 
              href="/quen-mat-khau" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </span>
            ) : 'Đăng nhập'}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">hoặc</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 px-4 flex items-center justify-center gap-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            onClick={() => {
              window.location.href = 'http://localhost:5000/api/auth/google';
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>Đăng nhập với Google</span>
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link 
                href="/tai-khoan/dang-ky" 
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;