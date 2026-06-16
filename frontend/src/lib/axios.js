import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:3000/api/" : "/api"),
  //* this include cookies
  withCredentials: true,
})
