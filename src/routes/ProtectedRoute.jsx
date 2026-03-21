import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        setUser(authUser);
        
        // AMBIL ROLE
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          console.error("Error ambil profil:", error.message);
        }

        console.log("ROLE DITEMUKAN:", profile?.role); // LIHAT DI INSPECT CONSOLE
        setRole(profile?.role || 'user');
      }
      setLoading(false);
    };
    checkUserAndRole();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-purple-500 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-bold tracking-widest text-xs uppercase">Memuat...</p>
      </div>
    );
  }

  // Jika tidak login
  if (!user) return <Navigate to="/login" replace />;

  // Jika role tidak diizinkan
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log("Access Denied for role:", role); // Untuk debug di console
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;