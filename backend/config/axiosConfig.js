import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://phil-location.onrender.com/api',
  withCredentials: false,
});

export default axiosInstance;