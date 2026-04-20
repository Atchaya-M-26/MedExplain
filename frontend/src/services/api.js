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
    api.post('/auth/register', { name, email, password, role }, { timeout: 10000 }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }, { timeout: 10000 }),
  googleAuth: (googleId, email, name, picture, role = 'patient') =>
    api.post('/auth/google', { googleId, email, name, picture, role }, { timeout: 10000 }),
  getMe: () => api.get('/auth/me'),
  updateLanguage: (language) =>
    api.put('/auth/language', { language }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post(`/auth/reset-password/${token}`, { newPassword }),
  deleteAccount: (password) =>
    api.delete('/auth/account', { data: { password } })
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

// Image Analysis Service
export const imageAnalysisService = {
  uploadAnalysis: (file, imageType) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/image-analysis/analyze/${imageType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000
    });
  },
  getHistory: () => api.get('/image-analysis/history', { timeout: 120000 }),
  getAnalysis: (id) => api.get(`/image-analysis/${id}`, { timeout: 120000 }),
  deleteAnalysis: (id) => api.delete(`/image-analysis/${id}`)
};

// QR Service
export const qrService = {
  getQR: (patientId) => api.get(`/qr/${patientId}`)
};

export default api;
