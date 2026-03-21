// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Crown, Menu, X, Coins, LogOut, Shield, Gem, ChevronDown, Wallet, User, Settings, BarChart2, Dices, Trophy, Headphones } from 'lucide-react';

// ── NAV LINKS ────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Slot', href: '/slot', icon: <Dices className="w-3.5 h-3.5" /> },
  { label: 'Live Casino', href: '/casino', icon: <Trophy className="w-3.5 h-3.5" /> },
  { label: 'Sportsbook', href: '/sports', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { label: 'Promosi', href: '/promo', icon: <Gem className="w-3.5 h-3.5" /> },
];

// ── USER DROPDOWN ────────────────────────────────────────────────────
const UserDropdown = ({ user, balance, role, onLogout }) => {
  const [open, setOpen] = useState(false);
  const initial = user?.user_metadata?.username?.[0]?.toUpperCase() || 'U';
  const username = user?.user_metadata?.username || 'User';

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full pl-1 pr-3 py-1 transition-all duration-200 group"
      >
        {/* avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-[0_0_12px_rgba(234,179,8,0.3)]">
            {initial}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080c14]" />
        </div>
        <span className="text-sm font-bold text-white max-w-[80px] truncate">{username}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0d1117]/95 backdrop-blur-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50"
          >
            {/* user info */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-lg shadow-lg">
                  {initial}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{username}</p>
                  <p className="text-xs text-white/30 truncate max-w-[140px]">{user.email}</p>
                </div>
              </div>

              {/* balance */}
              <div className="mt-3 flex items-center justify-between bg-yellow-500/8 border border-yellow-500/15 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-white/50 font-semibold">Saldo Crystal</span>
                </div>
                <span className="font-black text-yellow-400 font-mono text-sm">{balance.toLocaleString()}</span>
              </div>
            </div>

            {/* menu items */}
            <div className="p-2">
              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Admin Panel</p>
                    <p className="text-[10px] text-red-400/50">Kelola platform</p>
                  </div>
                  <div className="ml-auto text-[10px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">ADMIN</div>
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold">Profil Saya</p>
              </Link>

              <Link
                to="/deposit"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold">Deposit / WD</p>
              </Link>

              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Settings className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold">Pengaturan</p>
              </Link>
            </div>

            {/* logout */}
            <div className="p-2 border-t border-white/5">
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold">Keluar</p>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── MAIN HEADER ──────────────────────────────────────────────────────
export default function Header() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setBalance(0); setRole(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#080c14]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── LOGO ──────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-700 flex items-center justify-center shadow-[0_0_16px_rgba(234,179,8,0.35)] group-hover:shadow-[0_0_24px_rgba(234,179,8,0.5)] transition-shadow">
              <Gem className="w-4 h-4 text-black" />
              {/* shine */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <span className="font-['Bebas_Neue'] text-[22px] tracking-widest leading-none">
              NANTA<span className="text-yellow-500">GACOR88</span>
            </span>
          </Link>

          {/* ── CENTER NAV ────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href, icon }) => {
              const active = location.pathname === href;
              return (
                <Link
                  key={label}
                  to={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={active ? 'text-yellow-500' : 'text-white/30'}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT SIDE ────────────────────────── */}
          <div className="flex items-center gap-3">

            {/* Live support pill */}
            <a
              href="#"
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <Headphones className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400 hidden xl:block">Live CS</span>
            </a>

            {user ? (
              <>
                {/* balance chip — md+ */}
                <div className="hidden md:flex items-center gap-2 bg-yellow-500/8 border border-yellow-500/15 rounded-full px-3 py-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-sm font-black font-mono text-yellow-400">{balance.toLocaleString()}</span>
                </div>

                {/* admin badge — md+ */}
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-black text-red-400 uppercase tracking-widest">Admin</span>
                  </Link>
                )}

                {/* user dropdown */}
                <UserDropdown user={user} balance={balance} role={role} onLogout={handleLogout} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 rounded-full text-sm font-bold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                    Masuk
                  </button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(234,179,8,0.35)' }}
                    whileTap={{ scale: 0.96 }}
                    className="relative overflow-hidden px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_18px_rgba(234,179,8,0.2)]"
                  >
                    {/* shimmer */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1 }}
                    />
                    <span className="relative z-10">Daftar Gratis</span>
                  </motion.button>
                </Link>
              </div>
            )}

            {/* mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-[#0d1117] border-l border-white/10 shadow-2xl flex flex-col lg:hidden overflow-y-auto"
            >
              {/* drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                    <Gem className="w-3.5 h-3.5 text-black" />
                  </div>
                  <span className="font-['Bebas_Neue'] text-lg tracking-widest">NANTAGACOR88</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* user section */}
              {user ? (
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg">
                      {user?.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user?.user_metadata?.username}</p>
                      <p className="text-xs text-white/30 truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-yellow-500/8 border border-yellow-500/15 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-white/50 font-semibold">Saldo Crystal</span>
                    </div>
                    <span className="font-black font-mono text-yellow-400">{balance.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3 border-b border-white/5">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-black uppercase tracking-widest text-sm">
                      Daftar Gratis
                    </button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-sm">
                      Masuk
                    </button>
                  </Link>
                </div>
              )}

              {/* nav links */}
              <div className="p-4 flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-3 mb-2">Menu</p>
                {NAV_LINKS.map(({ label, href, icon }) => {
                  const active = location.pathname === href;
                  return (
                    <Link
                      key={label}
                      to={href}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all ${
                        active
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className={active ? 'text-yellow-500' : 'text-white/30'}>{icon}</span>
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* user actions */}
              {user && (
                <div className="p-4 flex flex-col gap-1 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-3 mb-2">Akun</p>

                  {role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all"
                    >
                      <Shield className="w-4 h-4" /> Dashboard Admin
                    </Link>
                  )}

                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
                  >
                    <User className="w-4 h-4" /> Profil Saya
                  </Link>

                  <Link to="/deposit" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
                  >
                    <Wallet className="w-4 h-4" /> Deposit / WD
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all mt-2"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              )}

              {/* live cs */}
              <div className="mt-auto p-4 border-t border-white/5">
                <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-400">Live Support</p>
                    <p className="text-xs text-green-400/50">Online 24/7 — respon cepat</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}