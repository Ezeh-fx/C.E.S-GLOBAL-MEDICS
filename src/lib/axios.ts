import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV
    ? "/api" // Local dev uses Vite proxy
    : "https://med-kit-lab-ces-be.onrender.com/api", // Production
});

export default axiosInstance;
