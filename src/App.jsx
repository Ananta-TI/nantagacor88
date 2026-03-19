// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/user/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import GachaPage from './pages/user/GachaPage'; // <-- IMPORT HALAMAN BARU
import ProfilePage from './pages/user/ProfilePage'; // <-- IMPORT HALAMAN PROFILE

// Import Route Guard
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* Rute User Terproteksi */}
        <Route 
          path="/gacha" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <GachaPage /> {/* <-- TAMBAHKAN DI SINI */}
            </ProtectedRoute>
          } 
        />

        {/* === TAMBAHKAN RUTE PROFILE DI SINI === */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Rute Khusus Admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;