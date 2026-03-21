// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { ShieldCheck, LayoutDashboard, Users, LogOut, Home, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export default function AdminSidebar({ onLogout, activeView, setActiveView, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* 🔥 BACKDROP / OVERLAY GELAP UNTUK MOBILE 🔥 */}
      {/* Muncul saat menu HP terbuka. Kalau di-klik, menu akan menutup */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR UTAMA 🔥 */}
      {/* Di HP: Posisi fixed, z-50, bisa geser kiri/kanan (-translate-x-full = sembunyi).
        Di PC (md+): Posisi nempel permanen (relative), translate-x-0 (selalu tampil).
      */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0d14] md:bg-slate-900/50 border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-800 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl uppercase italic bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              AdminPanel
            </span>
          </div>

          {/* Tombol Close (X) - Hanya muncul di HP */}
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md bg-white/5"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">Menu Utama</p>
          
          <Button 
            variant={activeView === 'dashboard' ? 'secondary' : 'ghost'} 
            onClick={() => { setActiveView('dashboard'); setIsMobileOpen(false); }}
            className={`w-full justify-start gap-3 transition-all ${
              activeView === 'dashboard' 
                ? 'bg-violet-600/15 text-violet-400 hover:bg-violet-600/25 border border-violet-500/20' 
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard KPI
          </Button>
          
          <Button 
            variant={activeView === 'users' ? 'secondary' : 'ghost'} 
            onClick={() => { setActiveView('users'); setIsMobileOpen(false); }}
            className={`w-full justify-start gap-3 transition-all ${
              activeView === 'users' 
                ? 'bg-violet-600/15 text-violet-400 hover:bg-violet-600/25 border border-violet-500/20' 
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <Users size={18} /> Manage Users
          </Button>

          <div className="pt-4 mt-4 border-t border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-2">Sistem</p>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white" asChild>
              <Link to="/">
                <Home size={18} /> Landing Page
              </Link>
            </Button>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <Button onClick={onLogout} variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>
    </>
  );
}