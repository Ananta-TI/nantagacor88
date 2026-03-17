// src/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  // ===== TAMPILAN LOADING SCREEN =====
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',          // Memenuhi seluruh tinggi layar
        backgroundColor: '#fff',  // Latar belakang putih bersih
      }}>
        {/* Lingkaran Spinner */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(170, 59, 255, 0.2)', // Warna ungu transparan
          borderTop: '5px solid #aa3bff',              // Warna ungu solid di bagian atas
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        {/* Teks Memuat */}
        <h3 style={{ 
          marginTop: '20px', 
          color: '#aa3bff', 
          fontFamily: 'sans-serif',
          fontWeight: '500'
        }}>
          Memuat...
        </h3>

        {/* CSS Inject untuk animasi putaran */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Jika tidak ada user yang login, lempar ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika user sudah login, cek apakah role-nya sesuai dengan yang diizinkan
  const userRole = user.user_metadata?.role || 'user';
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Jika user biasa mencoba masuk ke /admin, lempar ke halaman utama
    return <Navigate to="/" replace />;
  }

  // Jika aman, render halamannya
  return children;
};

export default ProtectedRoute;