import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  googleAuth: (googleId, email, name, picture) =>
    api.post('/auth/google', { googleId, email, name, picture }),
  getMe: () => api.get('/auth/me'),
  updateLanguage: (language) =>
    api.put('/auth/language', { language })
};

// Report Service
export const reportService = {
  uploadReport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  deleteReport: (id) => api.delete(`/reports/${id}`)
};

// Chatbot Service
export const chatbotService = {
  sendMessage: (message, reportId, language = 'en') =>
    api.post('/chatbot/message', { message, reportId, language }),
  getChatHistory: (reportId) =>
    api.get(`/chatbot/history/${reportId}`)
};

// Extracted Data Service
export const extractedDataService = {
  getExtractedData: (reportId) => api.get('/extracteddata/' + reportId)
};

// History Service
export const historyService = {
  getHistory: () => api.get('/history')
};

// Timeline Service
export const timelineService = {
  getTimeline: () => api.get('/timeline')
};

// Doctor Service
export const doctorService = {
  getPatient: (patientId) => api.get(`/doctor/patient/${patientId}`)
};

// QR Service
export const qrService = {
  getQR: (patientId) => api.get(`/qr/${patientId}`)
};

export default api;
