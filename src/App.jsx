// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/user/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Import Route Guard
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik (Semua orang bisa akses, termasuk yang belum login) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* === PERUBAHAN DI SINI === */}
        {/* Landing Page sekarang jadi Rute Publik agar tombol Login/Register bisa terlihat */}
        <Route path="/" element={<LandingPage />} />

        {/* Nanti kalau kamu buat halaman fitur khusus yang butuh login, baru pakai ProtectedRoute: */}
        {/* <Route 
          path="/dashboard-user" 
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <DashboardUser />
            </ProtectedRoute>
          } 
        /> */}

        {/* Rute Khusus Admin (Hanya yang sudah login dan role-nya 'admin') */}
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