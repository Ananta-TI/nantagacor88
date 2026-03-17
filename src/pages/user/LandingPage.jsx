import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

function LandingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah ada sesi user yang sedang aktif
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* ===== NAVBAR / HEADER ===== */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2>LogoWebsite</h2>
        
        <div>
          {user ? (
            // Tampilan Navbar jika SUDAH LOGIN
            <>
              <span style={{ marginRight: '15px' }}>Halo, {user.user_metadata?.username || 'Player'}!</span>
              {user.user_metadata?.role === 'admin' && (
                <Link to="/admin"><button style={{ marginRight: '10px' }}>Panel Admin</button></Link>
              )}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            // Tampilan Navbar jika BELUM LOGIN
            <>
              <Link to="/login"><button style={{ marginRight: '10px' }}>Masuk</button></Link>
              <Link to="/register"><button>Daftar</button></Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== KONTEN UTAMA ===== */}
      <main style={{ marginTop: '40px', textAlign: 'center' }}>
        <h1>Selamat Datang di Website Kami</h1>
        <p>Platform terbaik dengan fitur terlengkap.</p>

        {/* Contoh konten yang hanya bisa diakses kalau sudah login */}
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Fitur Eksklusif</h3>
          {user ? (
            <button style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#aa3bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Masuk ke Lobby Utama
            </button>
          ) : (
            <div>
              <p>Silakan login terlebih dahulu untuk mengakses fitur ini.</p>
              <Link to="/login">
                <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Login Sekarang</button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default LandingPage;