// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Search, TrendingUp, Activity, Database, ShieldAlert, Zap, BarChart3, Coins, Menu } from 'lucide-react';

// Komponen UI Shadcn
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Import Komponen Pecahan
import AdminSidebar from '../../components/admin/AdminSidebar';
import UserTable from '../../components/admin/UserTable';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // 🔥 STATE UNTUK NAVIGASI TAB (Dashboard vs Users)
  const [activeView, setActiveView] = useState("dashboard");

  const [topUpAmounts, setTopUpAmounts] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // --- Fungsi Top Up & Manage (Sama seperti sebelumnya) ---
  const handleAmountChange = (userId, value) => {
    setTopUpAmounts(prev => ({ ...prev, [userId]: value }));
  };

  const handleTopUp = async (userId, currentCrystals) => {
    const amount = parseInt(topUpAmounts[userId]);
    if (!amount || isNaN(amount) || amount <= 0) return alert("Jumlah tidak valid!");
    
    setProcessingId(userId);
    try {
      const newBalance = parseInt(currentCrystals || 0) + amount;
      const { error } = await supabase.from('profiles').update({ crystals: newBalance }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, crystals: newBalance } : u));
      setTopUpAmounts(prev => ({ ...prev, [userId]: '' })); 
    } catch (error) {
      alert("Gagal menambahkan crystals.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Jadikan ${newRole.toUpperCase()}?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Gagal mengubah role.");
    }
  };

  const handleSuspendUser = async (userId, banStatus) => {
    if (!window.confirm(banStatus ? "Banned user ini?" : "Unban user ini?")) return;
    try {
      const { error } = await supabase.from('profiles').update({ is_banned: banStatus }).eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: banStatus } : u));
    } catch (error) {
      alert("Gagal update status.");
    }
  };

  const handleEditUser = async (userId, newData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newData.username })
        .eq('id', userId);

      if (error) throw error;

      // Update state lokal agar tabel langsung berubah
      setUsers(users.map(u => u.id === userId ? { ...u, username: newData.username } : u));
      
      // Opsi: Tambahkan toast/alert sukses jika mau
      // alert("Data berhasil diperbarui!");
      
    } catch (error) {
      console.error("Gagal edit user:", error);
      alert("Gagal memperbarui data pengguna.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Hapus permanen akun ini?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      alert("Gagal menghapus user.");
    }
  };

  // ==========================================
  // KALKULASI METRIK UNTUK DASHBOARD KPI
  // ==========================================
  const totalUsers = users.length;
  const totalCrystals = users.reduce((sum, u) => sum + (u.crystals || 0), 0);
  const activeUsers = users.filter(u => !u.is_banned).length;
  const bannedUsers = users.filter(u => u.is_banned).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex overflow-hidden">
      {/* SIDEBAR */}
     <AdminSidebar 
  onLogout={handleLogout} 
  activeView={activeView} 
  setActiveView={setActiveView} 
  isMobileOpen={isMobileOpen}       
  setIsMobileOpen={setIsMobileOpen} 
/>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
        {/* Background Ambient */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* HEADER ATAS */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
  <div className="flex items-center gap-4">
    {/* 🔥 TOMBOL HAMBURGER MOBILE 🔥 */}
    <button 
      className="md:hidden p-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white"
      onClick={() => setIsMobileOpen(true)}
    >
      <Menu size={24} />
    </button>

    <div>
      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
        {activeView === 'dashboard' ? <Activity className="text-violet-500" /> : <Users className="text-violet-500" />}
        {activeView === 'dashboard' ? "Command Center" : "User Management"}
      </h1>
      <p className="text-slate-400 text-xs md:text-sm mt-1">
        {activeView === 'dashboard' 
          ? "Monitoring real-time KPI, status finansial, dan analitik." 
          : "Kelola data, role, saldo, dan pembekuan akun."}
      </p>
    </div>
  </div>
          
          {/* Tanggal & Status Server */}
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
            <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg flex items-center gap-2 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Server OK</span>
            </div>
            <div className="text-xs font-medium text-slate-400 pr-2 hidden sm:block">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* RENDER KONTEN BERDASARKAN ACTIVE VIEW */}
        <div className="relative z-10">
          {activeView === 'dashboard' ? (
            
            // ========================================================
            // VIEW 1: DASHBOARD KPI / METRICS (VISUAL MURNI)
            // ========================================================
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* ROW 1: TOP KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><Users size={80} /></div>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Total Pengguna</CardDescription>
                    <CardTitle className="text-4xl font-black">{totalUsers}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1"><TrendingUp size={14} /> +12% bulan ini</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><Coins size={80} /></div>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Sirkulasi Crystal</CardDescription>
                    <CardTitle className="text-4xl font-black font-mono">{totalCrystals.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-amber-400 font-bold flex items-center gap-1"><Zap size={14} /> Ekonomi stabil</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all"><ShieldAlert size={80} /></div>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-red-400">Akun Terblokir</CardDescription>
                    <CardTitle className="text-4xl font-black">{bannedUsers}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-red-400/70 font-medium">Dari {totalUsers} total pendaftar</p>
                  </CardContent>
                </Card>

                {/* Card dengan gradien khusus */}
                <Card className="bg-gradient-to-br from-violet-600 to-purple-900 border-none shadow-[0_0_30px_rgba(139,92,246,0.3)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Database size={80} /></div>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-white/70">Hak Akses Admin</CardDescription>
                    <CardTitle className="text-4xl font-black text-white">{adminCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-white/80 font-medium flex items-center gap-1">Personel aktif saat ini</p>
                  </CardContent>
                </Card>
              </div>

              {/* ROW 2: CHART & ANALYTICS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mock Chart Area */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-violet-400" /> Trafik Registrasi User</CardTitle>
                    <CardDescription>Grafik pendaftaran pengguna selama 7 hari terakhir (Mock Data)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full flex items-end justify-between gap-2 pt-10">
                      {/* CSS Bar Chart Simulation */}
                      {[30, 45, 20, 80, 55, 90, 60].map((height, i) => (
                        <div key={i} className="relative flex-1 bg-white/5 rounded-t-md group flex items-end">
                          <div 
                            style={{ height: `${height}%` }} 
                            className="w-full bg-gradient-to-t from-violet-600 to-purple-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                          ></div>
                          {/* Tooltip on hover */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black px-2 py-1 rounded text-[10px] font-bold transition-opacity">
                            {height * 12} User
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase font-bold">
                      <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Metrics */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Bar 1 */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-400">Rasio User Aktif</span>
                        <span className="text-emerald-400 font-bold">{Math.round((activeUsers / totalUsers) * 100 || 0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${(activeUsers / totalUsers) * 100}%` }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                    
                    {/* Progress Bar 2 */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-400">Rasio Akun Banned</span>
                        <span className="text-red-400 font-bold">{Math.round((bannedUsers / totalUsers) * 100 || 0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div style={{ width: `${(bannedUsers / totalUsers) * 100}%` }} className="h-full bg-red-500 rounded-full" />
                      </div>
                    </div>

                    {/* Server Info */}
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-500 mb-2">Technical Info</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Database Load</span>
                        <span className="font-mono text-white">12%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-400">Avg. Latency</span>
                        <span className="font-mono text-emerald-400">42ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
            
          ) : (

            // ========================================================
            // VIEW 2: MANAGE USERS (TABEL)
            // ========================================================
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <UserTable 
                users={users}
                loading={loading}
                topUpAmounts={topUpAmounts}
                processingId={processingId}
                onAmountChange={handleAmountChange}
                onTopUp={handleTopUp}
                onUpdateRole={handleUpdateRole}   
                onSuspendUser={handleSuspendUser}   
                onDeleteUser={handleDeleteUser}    
                onEditUser={handleEditUser}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;