import axios from 'axios';
import { message } from 'antd';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      '请求失败';
    const text = Array.isArray(msg) ? msg.join('; ') : String(msg);
    if (err?.response?.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      if (!location.pathname.includes('/login')) {
        location.href = '/login';
      }
    } else {
      message.error(text);
    }
    return Promise.reject(err);
  },
);
