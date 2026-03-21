// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Menu, X, Coins, LogOut, Shield, Gem, 
  ChevronDown, Wallet, User, Settings, BarChart2, 
  Dices, Trophy, Headphones, ArrowLeft 
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Slot', href: '/slot', icon: <Dices className="w-4 h-4" /> },
  { label: 'Live Casino', href: '/casino', icon: <Trophy className="w-4 h-4" /> },
  { label: 'Sportsbook', href: '/sports', icon: <BarChart2 className="w-4 h-4" /> },
  { label: 'Promosi', href: '/promo', icon: <Gem className="w-4 h-4" /> },
];

// ── USER DROPDOWN (PREMIUM FEEL) ─────────────────────────────────────
const UserDropdown = ({ user, balance, role, onLogout }) => {
  const [open, setOpen] = useState(false);
  const initial = user?.user_metadata?.username?.[0]?.toUpperCase() || 'U';
  const username = user?.user_metadata?.username || 'User';

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 p-1 pr-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-full transition-all duration-300 group"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-yellow-500/20">
            {initial}
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#080c14]" />
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[11px] text-white/40 font-medium uppercase tracking-tighter">Player</span>
          <span className="text-xs font-bold text-white tracking-wide">{username}</span>
        </div>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-3 w-64 origin-top-right rounded-2xl bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-b from-white/[0.05] to-transparent">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-white truncate">{username}</p>
                    <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                  </div>
               </div>
               <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-[11px] text-white/50 font-medium uppercase">Balance</span>
                  </div>
                  <span className="text-sm font-black text-yellow-500 font-mono tracking-tighter">
                    {balance.toLocaleString()}
                  </span>
               </div>
            </div>

            <div className="p-2 space-y-1">
              {role === 'admin' && (
                <Link to="/adminDashboard" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-all group">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-semibold">Admin Panel</span>
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
                <User className="w-4 h-4 text-white/40" />
                <span className="text-sm font-semibold">Profil Saya</span>
              </Link>
              <Link to="/deposit" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
                <Wallet className="w-4 h-4 text-white/40" />
                <span className="text-sm font-semibold">Deposit / WD</span>
              </Link>
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold">Keluar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Header() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('crystals, role').eq('id', user.id).single();
        if (data) { setBalance(data.crystals); setRole(data.role); }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
          scrolled || isAuthPage 
          ? 'py-2' 
          : 'py-4'
        }`}
      >
        <div className={`mx-auto px-4 transition-all duration-500 ${scrolled ? 'max-w-6xl' : 'max-w-7xl'}`}>
          <div className={`relative flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all duration-500 ${
            scrolled || isAuthPage
            ? 'bg-[#080c14]/80 backdrop-blur-xl border-white/10 shadow-2xl'
            : 'bg-transparent border-transparent'
          }`}>
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group relative z-10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                <Gem className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-lg sm:text-xl font-black italic tracking-tighter text-white leading-none">
                  NANTA<span className="text-yellow-500">GACOR88</span>
                </h1>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl font-black italic tracking-tighter text-white leading-none">
                  NANTA<span className="text-yellow-500">GACOR88</span>
                </h1>
                <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase leading-none mt-1">Premium Gaming</p>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            {!isAuthPage && (
              <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                {NAV_LINKS.map(({ label, href, icon }) => {
                  const active = location.pathname === href;
                  return (
                    <Link
                      key={label}
                      to={href}
                      className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        active ? 'text-yellow-500' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {icon}
                      {label}
                      {active && (
                        <motion.div layoutId="activeNav" className="absolute inset-0 bg-yellow-500/10 border border-yellow-500/20 rounded-xl -z-10" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-2 sm:gap-4 relative z-10">
              {isAuthPage ? (
                <Link to="/" className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>
              ) : (
                <>
                  {user ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-sm font-mono font-black text-yellow-500">{balance.toLocaleString()}</span>
                      </div>
                      <UserDropdown user={user} balance={balance} role={role} onLogout={handleLogout} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link to="/login" className="hidden sm:block text-sm font-bold text-white/60 hover:text-white px-4 py-2 transition-all">
                        Masuk
                      </Link>
                      <Link to="/register">
                        <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all">
                          Daftar
                        </button>
                      </Link>
                    </div>
                  )}

                  {/* MOBILE MENU TOGGLE */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER (GLASSMORPHISM) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0d1117] border-l border-white/10 z-[80] lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                    <Gem className="w-4 h-4 text-black" />
                  </div>
                  <span className="font-black italic text-white">NANTAGACOR88</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/40"><X /></button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Balance Card Mobile */}
                {user && (
                  <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/5 border border-yellow-500/20 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest mb-1">Total Saldo Crystal</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white font-mono">{balance.toLocaleString()}</span>
                      <div className="p-2 bg-yellow-500 rounded-lg text-black"><Wallet className="w-5 h-5" /></div>
                    </div>
                  </div>
                )}

                {/* Main Links */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Main Navigation</p>
                  {NAV_LINKS.map(({ label, href, icon }) => (
                    <Link key={label} to={href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white/70 hover:text-white transition-all">
                      <div className="text-yellow-500">{icon}</div>
                      <span className="font-bold">{label}</span>
                    </Link>
                  ))}
                </div>

                {/* Support Card */}
                <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <Headphones className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white">Live Support</p>
                      <p className="text-xs text-green-500/60 font-medium">Online 24/7</p>
                   </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                {user ? (
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 text-red-400 font-bold">
                    <LogOut className="w-4 h-4" /> Keluar Akun
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" className="py-3 text-center rounded-xl bg-white/5 text-white font-bold text-sm">Masuk</Link>
                    <Link to="/register" className="py-3 text-center rounded-xl bg-yellow-500 text-black font-black text-sm">Daftar</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}