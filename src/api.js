import axios from "axios";

// Dynamically determine the backend URL based on VITE_API_URL environment variable,
// or fallback to localhost:3000 during local development.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export default api;
