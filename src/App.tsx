import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './hooks/AuthProvider';
import './index.css';
import Footer from './components/Footer';

import Navbar from './components/Navbar';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Gestione = lazy(() => import('./pages/Gestione'));

function App() {
  // Initialize theme on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const root = window.document.documentElement;
    
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(savedTheme);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Suspense fallback={<div className="min-h-screen bg-page" />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes Wrapper */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gestione" element={<Gestione />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </Suspense>
        </div>
      </Router>
      <Footer />
    </AuthProvider>
  );
}

// Layout component to keep Navbar mounted
import { Outlet } from 'react-router-dom';
function Layout() {
  return (
    <ProtectedRoute>
      <>
        <Navbar />
        <Outlet />
      </>
    </ProtectedRoute>
  );
}

export default App;