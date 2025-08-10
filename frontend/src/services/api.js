import axios from 'axios';

const API_BASE_URL = 'http://localhost:8086/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`API响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API响应错误:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      alert('无法连接到服务器，请确保后端服务已启动 (端口8086)');
    } else if (error.response?.status >= 500) {
      alert('服务器内部错误，请稍后重试');
    } else if (error.response?.status === 404) {
      alert('请求的资源不存在');
    }
    
    return Promise.reject(error);
  }
);

export const investmentAPI = {
  getAll: () => api.get('/investments'),
  create: (investment) => api.post('/investments', investment),
  update: (id, investment) => api.put(`/investments/${id}`, investment),
  delete: (id) => api.delete(`/investments/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
};

export default api;
