import React, { useState } from 'react';
import { supabase } from '../../supabaseClient'; 
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      // 1. CEK USERNAME DULU: Pastikan username belum ada di tabel profiles
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle(); // Cari 1 data, kalau tidak ada kembalikan null

      if (existingUser) {
        throw new Error('Username ini sudah dipakai oleh orang lain. Silakan cari username lain!');
      }

      // 2. DAFTAR KE SUPABASE
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username, 
            role: 'user', 
          },
        },
      });

      // 3. CEK EMAIL DUPLIKAT: Cek error dari Supabase
      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already in use')) {
          throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain atau coba login.');
        }
        throw error;
      }

      // 4. CEK EMAIL DUPLIKAT Lanjutan (Trik Supabase Identities)
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain atau coba login.');
      }

      // Jika lolos semua pengecekan di atas = SUKSES
      setIsSuccess(true);
      setMessage('Pendaftaran berhasil! Silakan cek kotak masuk Gmail kamu (atau folder spam) untuk link konfirmasi sebelum login.');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Daftar Akun</h1>
      
      {isSuccess ? (
        <div style={{ textAlign: 'center', marginTop: '20px', padding: '20px', border: '1px solid #aa3bff', borderRadius: '8px', backgroundColor: 'rgba(170, 59, 255, 0.1)' }}>
          <h3 style={{ color: '#aa3bff' }}>Cek Email Kamu! ✉️</h3>
          <p>{message}</p>
          <button onClick={() => navigate('/login')} style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer' }}>
            Ke Halaman Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Username (tanpa spasi):</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Email (Gmail aktif):</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#aa3bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      )}

      {message && !isSuccess && <p style={{ marginTop: '15px', textAlign: 'center', color: 'red', fontWeight: 'bold' }}>{message}</p>}
      
      {!isSuccess && (
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Sudah punya akun? <Link to="/login" style={{ color: '#aa3bff', fontWeight: 'bold' }}>Login di sini</Link>
        </p>
      )}
    </main>
  );
}

export default RegisterPage;