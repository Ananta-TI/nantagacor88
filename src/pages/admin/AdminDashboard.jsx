import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  LayoutDashboard, 
  LogOut, 
  Search,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  // Filter user berdasarkan search box
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase()) || 
    user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* SIDEBAR MINI */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/50 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase italic">AdminPanel</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Button variant="secondary" className="w-full justify-start gap-3 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20">
            <LayoutDashboard size={18} /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-400 hover:text-white">
            <Users size={18} /> Manage Users
          </Button>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:bg-red-400/10 hover:text-red-400">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight">System Overview</h1>
            <p className="text-slate-400 text-sm">Monitor all registered agents and system status.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search user..." 
                className="pl-10 bg-slate-900 border-white/10 w-[250px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-slate-900/50 border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Total Users</CardDescription>
              <CardTitle className="text-4xl font-black">{users.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <UserPlus size={12} /> +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Active Sessions</CardDescription>
              <CardTitle className="text-4xl font-black">24</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={i} className="border-2 border-slate-900 w-8 h-8">
                    <AvatarFallback className="bg-purple-600 text-[10px]">{i}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">+20</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.3)] border-none">
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-white/70">Server Status</CardDescription>
              <CardTitle className="text-4xl font-black text-white">ONLINE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-white/80 font-medium">Uptime: 99.9% | Latency: 24ms</p>
            </CardContent>
          </Card>
        </div>

        {/* TABLE SECTION */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Daftar seluruh pengguna yang terdaftar di RoyalWin.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                <Loader2 className="animate-spin" />
                <p className="text-sm font-bold animate-pulse">Synchronizing Data...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="w-[80px]">Profile</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-slate-800 text-xs font-bold text-slate-400">
                            {u.username?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-bold">{u.username}</TableCell>
                      <TableCell className="text-slate-400 italic">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-purple-600 hover:bg-purple-600' : 'bg-slate-800'}>
                          {u.role?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                          <MoreVertical size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboard;