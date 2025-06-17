"use client"; // Vì chúng ta cần sử dụng state và event handlers

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

export default function AdminLogin() {
  const [form, setform] = useState({
    email:'',
    password:''
  })
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try{
        const res = await api.post('/auth/login',form);
        const token = res.data.token;
        const role = res.data.role;
        if(role !== 'admin') {
            setError('Tài khoản không có quyền truy cập admin.');
            return;
        }

        Cookies.set('token', token, {
            expires: 30,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        router.push('/admin');
    }catch(error) {
        alert(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập Admin</h1>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              value={form.email}
              onChange={(e) => setform({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => setform({...form, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đăng nhập
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}