/// <reference types="vite/client" />

import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:19024/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // Có thể cấu hình thêm timeout nếu cần
  timeout: 10000, 
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi toàn cục (ví dụ: hiển thị thông báo lỗi)
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;