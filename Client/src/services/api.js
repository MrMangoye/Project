import axios from 'axios';

// Base URL points to your backend server
const API = axios.create({ baseURL: 'http://localhost:5000' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');   // clear user object if unauthorized
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default API;