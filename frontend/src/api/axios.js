import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const instance = axios.create({ baseURL });

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('oddly_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
