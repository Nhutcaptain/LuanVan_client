'use client';
import React, { useEffect, useState } from 'react';
import InputComponent from '@/components/InputComponent/InputComponent';
import SelectComponent from '@/components/SelectComponent/SelectComponent';
import AddressSelector from '@/components/AddressSelectorComponent/AddressSelector';
import { AddressForm } from '@/interface/AddressForm';
import './styles.css';
import axios from 'axios';
import api from '@/lib/axios';


const genders = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'patient',
    phone: '',
    address: {
      province: { name: '', code: 0 },
      district: { name: '', code: 0 },
      ward: { name: '', code: 0 },
      houseNumber: '',
    },
    dateOfBirth: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(''); // Thêm state cho thông báo

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/register', form);
      setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
    } catch (error) {
      console.error('Đăng ký thất bại:', error);
      alert('Đăng ký thất bại, vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  const setAddressWrapper: React.Dispatch<React.SetStateAction<AddressForm>> = (value) => {
    setForm((prev) => ({
      ...prev,
      address: typeof value === 'function' ? value(prev.address) : value,
    }));
  };

  return (
    <div className="register-container">
      <div className="w-full mx-auto mt-10 bg-white p-6 rounded shadow flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>
        {successMsg && (
          <div className="w-full mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
            {successMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center w-[50%]">
          <InputComponent
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <InputComponent
            label="Hoặc Số điện thoại"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />
          <InputComponent
            label="Mật khẩu"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <InputComponent
            label="Họ và tên"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          
          
          <AddressSelector
            form={form.address}
            setForm={setAddressWrapper}
          />
          
         <div className="birthday-gender w-full">
           <div className="birthday">
            <InputComponent
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
           </div>
            <div className="gender">
              <SelectComponent
                label="Giới tính"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={genders}
              />
            </div>
         </div>
          <button
            type="submit"
            className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          {/* Nút đăng nhập với Google */}
          <button
            type="button"
            className="w-full mt-2 py-2 px-4 flex items-center justify-center gap-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            onClick={() => {
              window.location.href = 'http://localhost:5000/api/auth/google';
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;