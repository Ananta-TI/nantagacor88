// src/components/admin/UserTable.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical, Loader2, Coins, Plus,
  ShieldAlert, Ban, Trash2, Edit, Users, Shield,
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  CheckCircle2, UserX, UserCheck, SlidersHorizontal,
  Database, TrendingUp, Crown, X, Save // Tambahan icon X dan Save
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

// ... (KODE SORT BUTTON, ROLE BADGE, STATUS BADGE, AVATAR, EMPTY STATE, LOADING STATE SAMA SEPERTI SEBELUMNYA) ...

const SortButton = ({ label, sortKey, sortConfig, onSort }) => {
  const active = sortConfig.key === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
        active ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 transition-transform ${active ? 'text-violet-400' : ''}`} />
    </button>
  );
};

const RoleBadge = ({ role }) =>
  role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-violet-500/15 text-violet-400 border border-violet-500/25 whitespace-nowrap">
      <Crown className="w-2.5 h-2.5" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10 whitespace-nowrap">
      <Users className="w-2.5 h-2.5" /> Member
    </span>
  );

const StatusBadge = ({ banned }) =>
  banned ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">
      <Ban className="w-2.5 h-2.5" /> Banned
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
      <CheckCircle2 className="w-2.5 h-2.5" /> Active
    </span>
  );

const UserAvatar = ({ username, banned }) => {
  const colors = [
    'from-violet-500 to-purple-700',
    'from-blue-500 to-cyan-700',
    'from-emerald-500 to-teal-700',
    'from-rose-500 to-pink-700',
    'from-amber-500 to-orange-700',
  ];
  const colorIndex = (username?.charCodeAt(0) || 0) % colors.length;
  return (
    <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-black text-sm shadow-lg flex-shrink-0 ${banned ? 'opacity-50 grayscale' : ''}`}>
      {username?.[0]?.toUpperCase() || '?'}
      {!banned && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0d14]" />}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
    <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
      <Search className="w-6 h-6 opacity-40" />
    </div>
    <p className="text-sm font-semibold">Tidak ada data yang cocok</p>
    <p className="text-xs opacity-60">Coba ubah filter atau kata kunci pencarian</p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
      <div className="absolute inset-0 m-2 rounded-full border-4 border-blue-500/10 border-b-blue-500 animate-[spin_1.5s_linear_infinite_reverse]" />
    </div>
    <p className="text-xs font-black tracking-[0.3em] uppercase text-slate-500 animate-pulse text-center">
      Menghubungkan ke Database…
    </p>
  </div>
);

// ─── USER ROW ─────────────────────────────────────────────────────────
// 🔥 TAMBAHKAN onOpenEdit SEBAGAI PROP
const UserRow = ({ u, index, topUpAmounts, processingId, onAmountChange, onTopUp, onUpdateRole, onSuspendUser, onDeleteUser, onOpenEdit }) => (
  <motion.tr
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    className={`group border-b transition-colors ${
      u.is_banned ? 'border-red-500/5 bg-red-950/5 hover:bg-red-950/10' : 'border-white/[0.04] hover:bg-white/[0.025]'
    }`}
  >
    <td className="px-4 py-3 min-w-[200px]">
      <div className="flex items-center gap-3">
        <UserAvatar username={u.username} banned={u.is_banned} />
        <div className="min-w-0">
          <p className={`font-bold text-sm truncate transition-colors ${u.is_banned ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
            {u.username}
          </p>
          <p className="text-[10px] text-slate-600 font-mono truncate max-w-[150px]">{u.email}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
    <td className="px-4 py-3"><StatusBadge banned={u.is_banned} /></td>
    <td className="px-4 py-3 min-w-[120px]">
      <div className="flex items-center gap-1.5 text-amber-400 font-black font-mono text-sm">
        <Coins className="w-3.5 h-3.5 text-amber-500" />
        {u.crystals?.toLocaleString() || '0'}
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="flex items-center gap-1.5 w-max">
        <div className="relative flex items-center">
          <input
            type="number"
            placeholder="Jumlah"
            className="w-24 h-8 bg-black/40 border border-white/8 text-xs text-right pr-8 pl-3 rounded-lg focus:outline-none focus:border-violet-500/40 text-slate-300 placeholder-slate-700 transition-colors disabled:opacity-40"
            value={topUpAmounts[u.id] || ''}
            onChange={(e) => onAmountChange(u.id, e.target.value)}
            disabled={u.is_banned}
          />
          <button
            className={`absolute right-0 h-8 w-7 rounded-r-lg flex items-center justify-center transition-all ${
              topUpAmounts[u.id] && !u.is_banned ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/5 text-slate-700 cursor-not-allowed'
            }`}
            disabled={!topUpAmounts[u.id] || processingId === u.id || u.is_banned}
            onClick={() => onTopUp(u.id, u.crystals)}
          >
            {processingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </td>
    <td className="px-4 py-3 text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-8 h-8 rounded-lg bg-white/3 hover:bg-white/8 border border-white/8 hover:border-white/15 inline-flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-[#0d1117] border border-white/10 text-slate-300 shadow-[0_24px_60px_rgba(0,0,0,0.7)] rounded-xl overflow-hidden p-1">
          <DropdownMenuLabel className="text-[10px] text-slate-600 uppercase tracking-[0.2em] px-2 py-1.5 flex items-center justify-between">
            Kelola User <span className="font-mono text-slate-700">{u.id.substring(0, 8)}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/5 my-1" />

          {/* 🔥 PANGGIL onOpenEdit SAAT DIKLIK 🔥 */}
          <DropdownMenuItem onClick={() => onOpenEdit(u)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer text-sm transition-colors">
            <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit Data Diri
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onUpdateRole(u.id, u.role === 'admin' ? 'member' : 'admin')} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-violet-500/10 hover:text-violet-300 cursor-pointer text-sm transition-colors">
            <ShieldAlert className="w-3.5 h-3.5 text-violet-500" />
            Jadikan {u.role === 'admin' ? 'Member Biasa' : 'Administrator'}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/5 my-1" />

          <DropdownMenuItem onClick={() => onSuspendUser(u.id, !u.is_banned)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${u.is_banned ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300' : 'text-orange-400 hover:bg-orange-500/10 hover:text-orange-300'}`}>
            {u.is_banned ? <><UserCheck className="w-3.5 h-3.5" /> Buka Blokir (Unban)</> : <><UserX className="w-3.5 h-3.5" /> Tangguhkan Akun</>}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onDeleteUser(u.id)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer text-sm transition-colors mt-0.5">
            <Trash2 className="w-3.5 h-3.5" /> Hapus Permanen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </motion.tr>
);

// ─── TABLE SECTION ────────────────────────────────────────────────────
// 🔥 TAMBAHKAN onOpenEdit
const TableSection = ({ data, topUpAmounts, processingId, onAmountChange, onTopUp, onUpdateRole, onSuspendUser, onDeleteUser, sortConfig, onSort, onOpenEdit }) => {
  const [page, setPage] = useState(1);
  const perPage = 8;
  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const slice = data.slice(start, start + perPage);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 text-left w-[250px]"><SortButton label="User" sortKey="username" sortConfig={sortConfig} onSort={onSort} /></th>
                <th className="px-4 py-3 text-left"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Role</span></th>
                <th className="px-4 py-3 text-left"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Status</span></th>
                <th className="px-4 py-3 text-left"><SortButton label="Crystals" sortKey="crystals" sortConfig={sortConfig} onSort={onSort} /></th>
                <th className="px-4 py-3 text-left"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Top-Up</span></th>
                <th className="px-4 py-3 text-right"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (<tr><td colSpan={6}><EmptyState /></td></tr>) : (
                slice.map((u, i) => (
                  <UserRow
                    key={u.id} u={u} index={i}
                    topUpAmounts={topUpAmounts} processingId={processingId}
                    onAmountChange={onAmountChange} onTopUp={onTopUp}
                    onUpdateRole={onUpdateRole} onSuspendUser={onSuspendUser} onDeleteUser={onDeleteUser}
                    onOpenEdit={onOpenEdit} // 🔥 PASS PROP
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 mt-4">
          <p className="text-xs text-slate-600 text-center sm:text-left"><span className="text-slate-400 font-semibold">{start + 1}–{Math.min(start + perPage, total)}</span> dari <span className="text-slate-400 font-semibold">{total}</span> data</p>
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="w-7 h-7 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${p === page ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'border border-white/8 bg-white/3 hover:bg-white/8 text-slate-500 hover:text-slate-300'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="w-7 h-7 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 flex items-center justify-center text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────
export default function UserTable({
  users,
  loading,
  topUpAmounts,
  processingId,
  onAmountChange,
  onTopUp,
  onUpdateRole,
  onSuspendUser,
  onDeleteUser,
  onEditUser // 🔥 PROP BARU DARI ADMIN DASHBOARD
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'crystals', direction: 'desc' });
  const [activeTab, setActiveTab] = useState('members');

  // 🔥 STATE UNTUK POPUP EDIT DATA
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fungsi Buka Popup
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({ username: user.username || '' });
  };

  // Fungsi Simpan
  const handleSaveEdit = async () => {
    if (!editForm.username.trim()) return alert("Username tidak boleh kosong!");
    setIsSavingEdit(true);
    await onEditUser(editingUser.id, editForm);
    setIsSavingEdit(false);
    setEditingUser(null); // Tutup popup
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const processed = useMemo(() => {
    let d = [...users];
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(u => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      d = d.filter(u => statusFilter === 'banned' ? u.is_banned : !u.is_banned);
    }
    d.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      return a[sortConfig.key] < b[sortConfig.key] ? -dir : a[sortConfig.key] > b[sortConfig.key] ? dir : 0;
    });
    return d;
  }, [users, search, statusFilter, sortConfig]);

  const members = processed.filter(u => u.role !== 'admin');
  const admins = processed.filter(u => u.role === 'admin');

  // 🔥 Tambahkan onOpenEdit ke tableProps
  const tableProps = { topUpAmounts, processingId, onAmountChange, onTopUp, onUpdateRole, onSuspendUser, onDeleteUser, sortConfig, onSort: handleSort, onOpenEdit: handleOpenEdit };

  const totalBanned = users.filter(u => u.is_banned).length;
  const totalCrystals = users.reduce((s, u) => s + (u.crystals || 0), 0);

  return (
    <>
      {/* 🔥 MODAL POPUP EDIT DATA DIRI 🔥 */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-violet-400" /> Edit Data User
                </h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email (Read-Only)</label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.email}
                    className="w-full h-10 px-3 bg-white/5 border border-white/5 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-600 mt-1">Email dikelola oleh sistem Autentikasi.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full h-10 px-3 bg-black/40 border border-white/10 focus:border-violet-500/50 rounded-lg text-sm text-white outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-white/5 bg-white/[0.02] flex items-center gap-3 justify-end">
                <button 
                  onClick={() => setEditingUser(null)} 
                  className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CARD TABEL UTAMA ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0d14]/80 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* ... (KODE HEADER, STATS, TABS SAMA SEPERTI SEBELUMNYA) ... */}
        {/* Supaya tidak terlalu panjang di chat, bagian Header & Tabs tidak saya ubah, biarkan persis seperti kode terakhir yang kamu punya */}
        <div className="p-4 md:px-6 md:pt-6 md:pb-5 border-b border-white/[0.06]">
          {/* Title disesuaikan untuk mobile */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="font-black text-lg md:text-xl text-white tracking-tight">User Database</h2>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">Pusat kontrol data, saldo, dan perizinan sistem</p>
              </div>
            </div>

            {/* Search & Filter Responsif */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                <input
                  placeholder="Cari username/email…"
                  className="pl-8 pr-4 h-9 w-full bg-black/40 border border-white/8 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/40 transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    statusFilter !== 'all'
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                      : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15'
                  }`}>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{statusFilter === 'all' ? 'Filter' : statusFilter === 'active' ? 'Active' : 'Banned'}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-[#0d1117] border border-white/10 text-slate-300 rounded-xl p-1 shadow-xl">
                  <DropdownMenuLabel className="text-[10px] text-slate-600 uppercase tracking-widest px-2 py-1">Filter Status</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {[['all', 'Semua Akun'], ['active', 'Active Only'], ['banned', 'Banned Only']].map(([v, label]) => (
                    <DropdownMenuCheckboxItem key={v} checked={statusFilter === v} onCheckedChange={() => setStatusFilter(v)} className="text-sm rounded-lg cursor-pointer">
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Total User', value: users.length, icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
              { label: 'Admin', value: admins.length, icon: <Crown className="w-4 h-4" />, color: 'text-violet-400' },
              { label: 'Diblokir', value: totalBanned, icon: <Ban className="w-4 h-4" />, color: 'text-red-400' },
              { label: 'Total Crystal', value: totalCrystals.toLocaleString(), icon: <Coins className="w-4 h-4" />, color: 'text-amber-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="flex items-center gap-2.5 md:gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 md:px-4 md:py-3">
                <span className={`${color} hidden sm:block`}>{icon}</span>
                <div>
                  <p className={`font-black text-sm md:text-base leading-none ${color}`}>{value}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 md:p-5">
          {loading ? (<LoadingState />) : (
            <>
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'members', label: 'Members', count: members.length, icon: <Users className="w-3.5 h-3.5" />, activeClass: 'bg-blue-600/20 border-blue-500/30 text-blue-300' },
                  { id: 'admins', label: 'Admins', count: admins.length, icon: <Shield className="w-3.5 h-3.5" />, activeClass: 'bg-violet-600/20 border-violet-500/30 text-violet-300' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-shrink-0 items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl border text-xs md:text-sm font-bold transition-all ${activeTab === tab.id ? tab.activeClass : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15'}`}>
                    {tab.icon} {tab.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-white/10' : 'bg-white/5 text-slate-600'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  <TableSection data={activeTab === 'members' ? members : admins} {...tableProps} />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </>
  );
}