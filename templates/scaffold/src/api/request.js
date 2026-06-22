import axios from "axios";

/**
 * axios 基础封装
 * baseURL 对应 vite.config.js 中的 proxy 前缀 /api
 */
const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
);

export default request;
