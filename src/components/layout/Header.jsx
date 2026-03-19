// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Crown, Menu, X, Coins, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Header() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Animasi background navbar saat di-scroll
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 50], ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.8)"]);
  const navBorder = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", "rgba(255,255,255,0.05)"]);

  useEffect(() => {
    const fetchUserAndBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase.from('profiles').select('crystals').eq('id', user.id).single();
        if (data) setBalance(data.crystals);
      }
    };
    fetchUserAndBalance();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setBalance(0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <motion.nav 
      style={{ backgroundColor: navBg, borderColor: navBorder }}
      className="fixed top-0 w-full z-50 border-b backdrop-blur-xl transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-yellow-500 rounded-lg group-hover:rotate-12 transition-transform">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-black tracking-tighter italic text-white">nantagacor 88</span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Saldo / Balance */}
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-mono font-bold text-yellow-400">{balance.toLocaleString()}</span>
              </div>

              {/* Profile Shortcut */}
              <Link to="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 p-1 pr-4 rounded-full border border-white/10 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-black shadow-lg">
                  {user.user_metadata?.username?.[0].toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-bold text-white">{user.user_metadata?.username}</span>
              </Link>

              <div className="w-[1px] h-4 bg-white/20" />
              <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 font-bold transition-colors uppercase tracking-widest flex items-center gap-1">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-white hover:text-yellow-500 transition-colors uppercase tracking-widest">Login</Link>
              <Link to="/register">
                <Button className="bg-white text-black font-black hover:bg-yellow-500 transition-all rounded-full px-8">REGISTER</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* MOBILE MENU TOGGLE */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-yellow-500 p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-[#020617] border-b border-white/10 shadow-2xl flex flex-col p-6 gap-4"
          >
            {user ? (
              <>
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-black text-lg">
                      {user.user_metadata?.username?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.user_metadata?.username}</p>
                      <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-xs text-yellow-500 hover:underline">Lihat Profil</Link>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Saldo</p>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-3 h-3" />
                      <span className="font-mono font-bold">{balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={handleLogout} variant="destructive" className="w-full font-bold uppercase tracking-widest flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full bg-transparent border-white/20 text-white font-bold">LOGIN</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-yellow-500 text-black font-black hover:bg-yellow-400">REGISTER</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}