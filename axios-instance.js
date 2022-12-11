import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'https://studika.ru/api',
  timeout: 3000,
})

export default axiosInstance;