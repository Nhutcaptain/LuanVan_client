import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // base URL cho backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // nếu backend có dùng cookie/session
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor response (tuỳ chọn): xử lý lỗi token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Có thể kiểm tra nếu lỗi 401 thì redirect, v.v.
    if (error.response?.status === 401) {
      console.warn('Token hết hạn hoặc không hợp lệ');
      // Xoá token, chuyển hướng đến đăng nhập nếu cần:
      localStorage.removeItem('token');
      // window.location.href = '/tai-khoan/dang-nhap';
    }
    return Promise.reject(error);
  }
);


export default api;