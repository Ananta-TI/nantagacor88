import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. CARI EMAIL BERDASARKAN USERNAME
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', formData.username)
        .maybeSingle();

      // Jika username tidak ditemukan di tabel profiles
      if (profileError || !profileData) {
        throw new Error('Username tidak ditemukan!');
      }

      // 2. LOGIN MENGGUNAKAN EMAIL YANG DITEMUKAN
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password: formData.password,
      });

      if (authError) {
        // Terjemahkan pesan error bawaan agar lebih ramah
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Password yang kamu masukkan salah!');
        } else if (authError.message.includes('Email not confirmed')) {
          throw new Error('Email belum dikonfirmasi. Silakan cek inbox email kamu!');
        }
        throw authError;
      }

      setMessage('Login berhasil! Mengalihkan...');
      
      // 3. ARAHKAN SESUAI ROLE
      const userRole = authData.user.user_metadata?.role || 'user';
      
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1000);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
         <div style={{ marginBottom: '15px' }}>
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#aa3bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
      
      {/* Pesan error berwarna merah */}
      {message && <p style={{ marginTop: '15px', textAlign: 'center', color: message.includes('berhasil') ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>}
      
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Belum punya akun? <Link to="/register" style={{ color: '#aa3bff', fontWeight: 'bold' }}>Daftar di sini</Link>
      </p>
    </main>
  );
}

export default LoginPage;