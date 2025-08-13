'use client';
import React, { useState, useEffect, useRef } from 'react';
import InputComponent from '@/components/InputComponent/InputComponent';
import SelectComponent from '@/components/SelectComponent/SelectComponent';
import AddressSelector from '@/components/AddressSelectorComponent/AddressSelector';
import { AddressForm } from '@/interface/AddressForm';
import './styles.css';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import Modal from '@/components/ModalComponent/ModalComponent';
import Cookies from 'js-cookie';

const genders = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'patient',
    phone: '',
    address: {
      province: { name: '', id: 0 },
      district: { name: '', id: 0 },
      ward: { name: '', id: 0 },
      houseNumber: '',
    },
    dateOfBirth: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useEmail, setUseEmail] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [registrationData, setRegistrationData] = useState<any>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!useEmail && !form.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!useEmail && !/^\d{10,11}$/.test(form.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (useEmail && !form.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (useEmail && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    if (!form.fullName) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
    }
    
    if (!form.gender) {
      newErrors.gender = 'Vui lòng chọn giới tính';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { confirmPassword, ...submitData } = form;
      const res = await api.post('/auth/register', submitData);
      
      // Show OTP modal and save registration data
      setRegistrationData(submitData);
      setShowOtpModal(true);
      setOtpSent(true);
      setTimeLeft(300);
      
      Swal.fire({
        title: 'OTP đã được gửi',
        text: useEmail 
          ? `Mã OTP đã được gửi đến email ${form.email}` 
          : `Mã OTP đã được gửi đến số điện thoại ${form.phone}`,
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Đăng ký thất bại',
        text: error.response?.data?.message || 'Vui lòng thử lại sau!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại sau!';
      setErrors(prev => ({ ...prev, form: errorMsg }));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    
    // Auto focus to next input if current input is filled
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Auto focus to previous input if backspace is pressed and current input is empty
    if (!value && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    try {
      const res = await api.post('/auth/verify-otp', {
        otp: otpString,
        email: useEmail ? form.email : undefined,
        phone: !useEmail ? form.phone : undefined,
      });

      // If OTP is correct, complete registration
      // await api.post('/auth/complete-registration', registrationData);

      Swal.fire({
        title: 'Đăng ký thành công',
        text: 'Tài khoản của bạn đã được tạo thành công!',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        // Reset form and close modal
        setForm({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          role: 'patient',
          phone: '',
          address: {
            province: { name: '', id: 0 },
            district: { name: '', id: 0 },
            ward: { name: '', id: 0 },
            houseNumber: '',
          },
          dateOfBirth: '',
          gender: '',
        });
        setShowOtpModal(false);
        setOtp(Array(6).fill(''));
        setOtpError('');
        setOtpSent(false);
      });
      if(res.data.token) {
        localStorage.setItem('token', res.data.token);
        Cookies.set('token', res.data.token, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          expires: 30,
        });
        localStorage.setItem('fullName', res.data.user.fullName || '');
        localStorage.setItem('role', res.data.user.role || '');
        
        window.location.href = '/'; // Redirect to home page
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post('/auth/resend-otp', {
        email: useEmail ? form.email : undefined,
        phone: !useEmail ? form.phone : undefined,
      });
      setTimeLeft(300);
      setOtpError('');
      Swal.fire({
        title: 'OTP đã được gửi lại',
        text: 'Mã OTP mới đã được gửi đến bạn',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error: any) {
      setOtpError(error.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  };

  const setAddressWrapper: React.Dispatch<React.SetStateAction<AddressForm>> = (value) => {
    setForm(prev => ({
      ...prev,
      address: typeof value === 'function' ? value(prev.address) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl transition-all duration-300 hover:shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</h1>
            <p className="text-gray-600">Điền thông tin để bắt đầu trải nghiệm</p>
          </div>

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <button
                type="button"
                className={`flex-1 py-3 px-4 font-medium transition-colors ${useEmail 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setUseEmail(true)}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-3 px-4 font-medium transition-colors ${!useEmail 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setUseEmail(false)}
              >
                Số điện thoại
              </button>
            </div>

            {useEmail ? (
              <InputComponent
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="example@email.com"
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                }
              />
            ) : (
              <InputComponent
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="0987 654 321"
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                }
              />
            )}

            <InputComponent
              label="Họ và tên"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="Nguyễn Văn A"
              icon={
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputComponent
                label="Mật khẩu"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                }
              />
              <InputComponent
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                }
              />
            </div>

            <AddressSelector
              form={form.address}
              setForm={setAddressWrapper}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputComponent
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                }
              />
              <SelectComponent
                label="Giới tính"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                options={genders}
                error={errors.gender}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Đăng ký ngay
                </span>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">Hoặc đăng ký bằng</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                className="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Đã có tài khoản?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Đăng nhập ngay
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal isOpen={showOtpModal} onClose={() => setShowOtpModal(false)} title="Xác thực OTP">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực OTP</h2>
            <p className="text-gray-600">
              Mã OTP đã được gửi đến {useEmail ? form.email : form.phone}. 
              Vui lòng nhập mã 6 chữ số để hoàn tất đăng ký.
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {otpError && <p className="text-center text-sm text-red-600">{otpError}</p>}
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Mã OTP sẽ hết hạn trong: <span className="font-medium">{formatTime(timeLeft)}</span>
            </p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timeLeft > 240} // Can resend after 1 minute
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Gửi lại OTP
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false);
                setOtp(Array(6).fill(''));
                setOtpError('');
                setOtpSent(false);
              }}
              className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.join('').length !== 6}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;