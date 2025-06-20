'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputComponent from '@/components/InputComponent/InputComponent';
import api from '@/lib/axios';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

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
        localStorage.setItem('fullName', res.data.fullName || '');
        localStorage.setItem('role',res.data.role || '');
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
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputComponent
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <InputComponent
            label="Mật khẩu"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;