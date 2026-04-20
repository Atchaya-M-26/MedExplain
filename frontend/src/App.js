import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ReportDetail from './pages/ReportDetail';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Timeline from './pages/Timeline';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientView from './pages/DoctorPatientView';
import QRShare from './pages/QRShare';
import Landing from './pages/Landing';
import DiseasePrediction from './pages/DiseasePrediction';
import MedicalImageAnalysis from './pages/MedicalImageAnalysis';
import History from './pages/History';
import ScanAnalysisDetail from './pages/ScanAnalysisDetail';
import Profile from './pages/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function AppLayout() {
  const location = useLocation();
  const isResetPasswordPage = location.pathname.startsWith('/reset-password');
  const showHeader = !['/login', '/register', '/'].includes(location.pathname) && !isResetPasswordPage;

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <PrivateRoute>
              <ReportDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/timeline"
          element={
            <PrivateRoute>
              <Timeline />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/patient/:patientId"
          element={
            <PrivateRoute>
              <DoctorPatientView />
            </PrivateRoute>
          }
        />
        <Route
          path="/share"
          element={
            <PrivateRoute>
              <QRShare />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/predict"
          element={
            <PrivateRoute>
              <DiseasePrediction />
            </PrivateRoute>
          }
        />
        <Route
          path="/image-analysis"
          element={
            <PrivateRoute>
              <MedicalImageAnalysis />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route
          path="/scan/:id"
          element={
            <PrivateRoute>
              <ScanAnalysisDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="747577344089-dhi77n3to30a8p8s15kl8l7f0it6c7mn.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
