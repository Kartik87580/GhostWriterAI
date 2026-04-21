import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import BlogHistory from './pages/BlogHistory';
import BlogView from './pages/BlogView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import { authService } from './services/authService';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

// Redirect to home if already logged in
const PublicRoute = ({ children }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <main>{children}</main>;
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><BlogHistory /></ProtectedRoute>} />
          <Route path="/blog/:id" element={<ProtectedRoute><BlogView /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
