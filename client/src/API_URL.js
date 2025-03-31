const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://invoice-printer-eta.vercel.app";

export default API_BASE_URL;
