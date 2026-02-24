import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Shield, LogOut, Map as MapIcon, Briefcase, UserCircle, Search, FileText, Medal, Plus, UserPlus, Edit2, Trash2, Ticket } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import SatyalancanaView from './components/SatyalancanaView';
import JabatanFungsionalView from './components/JabatanFungsionalView';
import TicketingView from './components/TicketingView';
import { Position, Employee, Proposal, PetaJabatan, Satyalancana, JabatanFungsional, UnifiedProposal } from './types';

export default function App() {
  const [view, setView] = useState<'public' | 'admin' | 'satyalancana' | 'jabatan-fungsional' | 'ticketing'>('public');
  const [isAdmin, setIsAdmin] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [satyalancana, setSatyalancana] = useState<Satyalancana[]>([]);
  const [jabatanFungsional, setJabatanFungsional] = useState<JabatanFungsional[]>([]);
  const [unifiedProposals, setUnifiedProposals] = useState<UnifiedProposal[]>([]);
  const [petaJabatan, setPetaJabatan] = useState<PetaJabatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpd, setFilterOpd] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentUser, setCurrentUser] = useState<{ name: string; opd: string } | null>(null);

  const fetchData = async () => {
    try {
      const [posRes, empRes, propRes, petaRes, satyaRes, jfRes, unifiedRes] = await Promise.all([
        fetch('/api/positions'),
        fetch('/api/employees'),
        fetch('/api/proposals'),
        fetch('/api/peta-jabatan'),
        fetch('/api/satyalancana'),
        fetch('/api/jabatan-fungsional'),
        fetch('/api/all-proposals')
      ]);
      const [posData, empData, propData, petaData, satyaData, jfData, unifiedData] = await Promise.all([
        posRes.json(),
        empRes.json(),
        propRes.json(),
        petaRes.json(),
        satyaRes.json(),
        jfRes.json(),
        unifiedRes.json()
      ]);
      setPositions(posData);
      setEmployees(empData);
      setProposals(propData);
      setPetaJabatan(petaData);
      setSatyalancana(satyaData);
      setJabatanFungsional(jfData);
      setUnifiedProposals(unifiedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [userRole, setUserRole] = useState<'public' | 'admin' | 'opd'>('public');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password: password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserRole(data.role);
        setCurrentUser({ name: data.name, opd: data.opd });
        setView('admin');
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      } else {
        alert(data.message || "Email atau password salah");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan saat login");
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    setUserRole('public');
    setCurrentUser(null);
    setView('public');
  };

  const filteredPeta = petaJabatan.filter(item => {
    const matchesSearch = 
      item.namaJabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaPegawai.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.opd.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOpd = filterOpd === '' || item.opd === filterOpd;
    const matchesJabatan = filterJabatan === '' || item.namaJabatan === filterJabatan;
    const matchesStatus = filterStatus === '' || item.status === filterStatus;

    return matchesSearch && matchesOpd && matchesJabatan && matchesStatus;
  });

  const uniqueOpds = Array.from(new Set(petaJabatan.map(p => p.opd))).sort();
  const uniqueJabatans = Array.from(new Set(petaJabatan.map(p => p.namaJabatan))).sort();
  const uniqueStatuses = Array.from(new Set(petaJabatan.map(p => p.status))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-black/10 rounded-full"></div>
          <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">Memuat Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f5f5f5] text-[#141414] font-sans relative">
      {/* Sidebar / Navigation - Desktop */}
      <nav className="hidden md:flex sticky top-0 h-screen w-20 bg-white border-r border-black/5 flex-col items-center py-8 gap-8 z-[100] shrink-0 pointer-events-auto">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shrink-0 mt-2">
          <MapIcon size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <button 
            type="button"
            onClick={() => { console.log("Dashboard clicked"); setView('public'); }}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'public' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Dashboard"
          >
            <LayoutDashboard size={24} />
          </button>
          
          {userRole !== 'public' && (
            <button 
              type="button"
              onClick={() => { console.log("Admin clicked"); setView('admin'); }}
              className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'admin' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
              title="Admin Panel"
            >
              <Users size={24} />
            </button>
          )}

          <button 
            type="button"
            onClick={() => setView('satyalancana')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'satyalancana' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Pengusulan Satyalancana"
          >
            <Medal size={24} />
          </button>

          <button 
            type="button"
            onClick={() => setView('jabatan-fungsional')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'jabatan-fungsional' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Usulan Jabatan Fungsional"
          >
            <Briefcase size={24} />
          </button>

          <button 
            type="button"
            onClick={() => setView('ticketing')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'ticketing' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Ticketing / Cek Status"
          >
            <Ticket size={24} />
          </button>
        </div>

        <div className="mt-auto mb-8 flex flex-col gap-4">
          {userRole === 'public' ? (
            <button 
              type="button"
              onClick={handleLoginClick}
              className="p-4 text-gray-400 hover:bg-gray-100 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110]"
              title="Login"
            >
              <Shield size={24} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleLogout}
              className="p-4 text-red-400 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110]"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 flex justify-around items-center py-3 px-2 z-[150] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setView('public')}
          className={`p-3 rounded-xl transition-all ${view === 'public' ? 'bg-black text-white' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={20} />
        </button>
        
        {userRole !== 'public' && (
          <button 
            onClick={() => setView('admin')}
            className={`p-3 rounded-xl transition-all ${view === 'admin' ? 'bg-black text-white' : 'text-gray-400'}`}
          >
            <Users size={20} />
          </button>
        )}

        <button 
          onClick={() => setView('satyalancana')}
          className={`p-3 rounded-xl transition-all ${view === 'satyalancana' ? 'bg-black text-white' : 'text-gray-400'}`}
        >
          <Medal size={20} />
        </button>

        <button 
          onClick={() => setView('jabatan-fungsional')}
          className={`p-3 rounded-xl transition-all ${view === 'jabatan-fungsional' ? 'bg-black text-white' : 'text-gray-400'}`}
        >
          <Briefcase size={20} />
        </button>

        <button 
          onClick={() => setView('ticketing')}
          className={`p-3 rounded-xl transition-all ${view === 'ticketing' ? 'bg-black text-white' : 'text-gray-400'}`}
        >
          <Ticket size={20} />
        </button>

        {userRole === 'public' ? (
          <button onClick={handleLoginClick} className="p-3 text-gray-400">
            <Shield size={20} />
          </button>
        ) : (
          <button onClick={handleLogout} className="p-3 text-red-400">
            <LogOut size={20} />
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-h-screen min-w-0 relative z-10 pb-20 md:pb-0">
        <header className="p-4 md:p-8 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">
                {view === 'admin' ? (userRole === 'admin' ? 'DASHPEG - Admin' : 'DASHPEG - OPD') : 
                 view === 'satyalancana' ? 'DASHPEG - Satyalancana' :
                 view === 'jabatan-fungsional' ? 'DASHPEG - Jabatan Fungsional' :
                 'DASHPEG'}
              </h1>
              <p className="text-sm md:text-gray-500 font-medium">
                Sistem Informasi Kepegawaian & Jabatan (DASHPEG)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none w-full md:w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                value={filterOpd}
                onChange={(e) => setFilterOpd(e.target.value)}
                className="p-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none max-w-[150px]"
              >
                <option value="">Semua OPD</option>
                {uniqueOpds.map(opd => <option key={opd} value={opd}>{opd}</option>)}
              </select>
              <select 
                value={filterJabatan}
                onChange={(e) => setFilterJabatan(e.target.value)}
                className="p-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none max-w-[150px]"
              >
                <option value="">Semua Jabatan</option>
                {uniqueJabatans.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none"
              >
                <option value="">Semua Status</option>
                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'public' ? (
              <motion.div
                key="public"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-black text-white rounded-lg"><Briefcase size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Jabatan</div>
                    </div>
                    <div className="text-4xl font-light">{petaJabatan.length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCircle size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Terisi</div>
                    </div>
                    <div className="text-4xl font-light">{petaJabatan.filter(p => p.status === 'Terisi').length}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Kosong</div>
                    </div>
                    <div className="text-4xl font-light text-amber-600">
                      {petaJabatan.filter(p => p.status.toLowerCase().includes('kosong')).length}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Usulan</div>
                    </div>
                    <div className="text-4xl font-light">{proposals.length}</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-black/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Peta Jabatan & Pegawai</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Jabatan</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">OPD</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Nama Pegawai</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">NIP</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Pangkat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredPeta.map(item => {
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 font-medium">{item.namaJabatan}</td>
                              <td className="p-4 text-gray-600 text-sm">{item.opd}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  item.status === 'Terisi' ? 'bg-emerald-100 text-emerald-700' : 
                                  item.status === 'Kosong-Purnabakti' ? 'bg-amber-100 text-amber-700' :
                                  item.status === 'Kosong-Meninggal' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-4 text-gray-600">{item.namaPegawai || '-'}</td>
                              <td className="p-4 text-gray-500 text-sm font-mono">{item.nip || '-'}</td>
                              <td className="p-4 text-gray-500 text-sm">{item.pangkat || '-'}</td>
                            </tr>
                          );
                        })}
                        {filteredPeta.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                              Tidak ada data ditemukan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : view === 'admin' ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdminPanel 
                  positions={positions} 
                  employees={employees} 
                  proposals={proposals}
                  petaJabatan={petaJabatan}
                  satyalancana={satyalancana}
                  jabatanFungsional={jabatanFungsional}
                  unifiedProposals={unifiedProposals}
                  onUpdate={fetchData}
                  userRole={userRole}
                  currentUser={currentUser}
                />
              </motion.div>
            ) : view === 'satyalancana' ? (
              <motion.div
                key="satyalancana"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SatyalancanaView 
                  data={satyalancana}
                  onUpdate={fetchData}
                  currentUser={currentUser}
                />
              </motion.div>
            ) : view === 'jabatan-fungsional' ? (
              <motion.div
                key="jabatan-fungsional"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <JabatanFungsionalView 
                  data={jabatanFungsional}
                  onUpdate={fetchData}
                  currentUser={currentUser}
                />
              </motion.div>
            ) : (
              <motion.div
                key="ticketing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TicketingView 
                  proposals={unifiedProposals}
                  searchTerm={searchTerm}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-4">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-bold">Login Sistem</h2>
              <p className="text-gray-500 text-sm">Masukkan kredensial untuk akses panel</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Username</label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="admin atau opd"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full p-4 bg-gray-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5"
                  placeholder="admin atau opd"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 p-4 border border-black/5 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 p-4 bg-black text-white rounded-2xl font-bold hover:bg-black/90 transition-all"
                >
                  Login
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
