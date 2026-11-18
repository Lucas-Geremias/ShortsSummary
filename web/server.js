import axios from "axios"

export const server = axios.create({
  timeout: 15 * 60 * 1000,
  baseURL:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:3333"
      : ""),
})
