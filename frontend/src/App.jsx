import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import AnimatedBackground from './components/AnimatedBackground';
import Landing from './pages/Landing';
import Home from './pages/Home';
import BlogHistory from './pages/BlogHistory';
import BlogView from './pages/BlogView';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import { authService } from './services/authService';
import { Toaster } from 'react-hot-toast';

// ─── Route Guards ──────────────────────────────────────────────────────────────

/**
 * ProtectedRoute: only accessible when LOGGED IN.
 * Redirects to /landing if not authenticated.
 * Shows the authenticated Navbar.
 */
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/landing" replace />;
  }
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

/**
 * PublicOnlyRoute: accessible ONLY when LOGGED OUT.
 * Redirects to /app if already authenticated.
 * Used for login, signup, verify-otp.
 */
const PublicOnlyRoute = ({ children }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }
  return <main>{children}</main>;
};

/**
 * LandingRoute: accessible ONLY when LOGGED OUT.
 * Redirects logged-in users directly to /app.
 * Shows the public Navbar.
 */
const LandingRoute = ({ children }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }
  return (
    <>
      <PublicNavbar />
      {children}
    </>
  );
};

// ─── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Toaster position="top-right" />
        <Routes>

          {/* ── Root redirect ── */}
          {/* Sends unauthenticated users to landing; authenticated to app */}
          <Route
            path="/"
            element={
              authService.isAuthenticated()
                ? <Navigate to="/app" replace />
                : <Navigate to="/landing" replace />
            }
          />

          {/* ── Public (unauthenticated only) pages ── */}
          <Route
            path="/landing"
            element={<LandingRoute><Landing /></LandingRoute>}
          />
          <Route
            path="/login"
            element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}
          />
          <Route
            path="/signup"
            element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>}
          />
          <Route
            path="/verify-otp"
            element={<PublicOnlyRoute><VerifyOTP /></PublicOnlyRoute>}
          />

          {/* ── Protected (authenticated only) pages ── */}
          <Route
            path="/app"
            element={<ProtectedRoute><Home /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><BlogHistory /></ProtectedRoute>}
          />
          <Route
            path="/blog/:id"
            element={<ProtectedRoute><BlogView /></ProtectedRoute>}
          />

          {/* ── 404 fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
