import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UrlDetails from './pages/UrlDetails.jsx';
import Analytics from './pages/Analytics.jsx';
import NotFound from './pages/NotFound.jsx';
import { useToast } from './components/Toast.jsx';
import { registerNotifier } from './services/http.js';

export default function App() {
  const navigate = useNavigate();
  const showToast = useToast();

  // Phase 4: let http.js surface a toast for centrally-handled 401/403s
  // without importing React/Toast itself (see services/http.js).
  useEffect(() => { registerNotifier(showToast); }, [showToast]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onDone={() => navigate('/dashboard')} />} />
          <Route path="/register" element={<Register onDone={() => navigate('/dashboard')} />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/urls/:id" element={<ProtectedRoute><UrlDetails /></ProtectedRoute>} />
          <Route path="/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
