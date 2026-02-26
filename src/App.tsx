import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Shield, LogOut, Map as MapIcon, Briefcase, UserCircle, Search, FileText, Medal, Plus, UserPlus, Edit2, Trash2, BarChart3, LayoutGrid, Clock } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import SatyalancanaView from './components/SatyalancanaView';
import JabatanFungsionalView from './components/JabatanFungsionalView';
import JenjangView from './components/JenjangView';
import BezettingView from './components/BezettingView';
import HistoryView from './components/HistoryView';
import TicketingView from './components/TicketingView';
import { Position, Employee, Proposal, PetaJabatan, Satyalancana, JabatanFungsional, UnifiedProposal } from './types';

export default function App() {
  const [view, setView] = useState<'public' | 'admin' | 'satyalancana' | 'jabatan-fungsional' | 'jenjang' | 'bezetting' | 'history' | 'ticketing'>('public');
  const [isAdmin, setIsAdmin] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [satyalancana, setSatyalancana] = useState<Satyalancana[]>([]);
  const [jabatanFungsional, setJabatanFungsional] = useState<JabatanFungsional[]>([]);
  const [unifiedProposals, setUnifiedProposals] = useState<UnifiedProposal[]>([]);
  const [petaJabatan, setPetaJabatan] = useState<PetaJabatan[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [filterOptions, setFilterOptions] = useState<{ opds: string[], statuses: string[], jenjangs: string[] }>({ opds: [], statuses: [], jenjangs: [] });
  const [stats, setStats] = useState({ totalJabatan: 0, terisi: 0, kosong: 0, totalUsulan: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpd, setFilterOpd] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJenjang, setFilterJenjang] = useState('');
  const [jenjangSummary, setJenjangSummary] = useState<any[]>([]);
  const [bezettingSummary, setBezettingSummary] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; opd: string } | null>(null);
  const [userRole, setUserRole] = useState<'public' | 'admin' | 'opd'>('public');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchPetaJabatan = async (page: number, search: string, opd: string, status: string, jenjang: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        opd,
        status,
        jenjang
      });
      const res = await fetch(`/api/peta-jabatan?${params}`);
      const data = await res.json();
      setPetaJabatan(data.data);
      setTotalPages(data.totalPages);
      setTotalRows(data.total);
    } catch (error) {
      console.error("Failed to fetch peta jabatan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      console.log("[Fetch] Starting initial data fetch...");
      const [posRes, empRes, propRes, satyaRes, jfRes, unifiedRes, filterRes, statsRes, summaryRes, bezettingRes] = await Promise.all([
        fetch('/api/positions'),
        fetch('/api/employees'),
        fetch('/api/proposals'),
        fetch('/api/satyalancana'),
        fetch('/api/jabatan-fungsional'),
        fetch('/api/all-proposals'),
        fetch('/api/peta-jabatan-filters'),
        fetch('/api/stats'),
        fetch('/api/jenjang-summary'),
        fetch('/api/bezetting-summary')
      ]);
      
      const [posData, empData, propData, satyaData, jfData, unifiedData, filterData, statsData, summaryData, bezettingData] = await Promise.all([
        posRes.json(),
        empRes.json(),
        propRes.json(),
        satyaRes.json(),
        jfRes.json(),
        unifiedRes.json(),
        filterRes.json(),
        statsRes.json(),
        summaryRes.json(),
        bezettingRes.json()
      ]);
      
      setPositions(posData);
      setEmployees(empData);
      setProposals(propData);
      setSatyalancana(satyaData);
      setJabatanFungsional(jfData);
      setUnifiedProposals(unifiedData);
      setFilterOptions(filterData);
      setStats(statsData);
      setJenjangSummary(summaryData);
      setBezettingSummary(bezettingData);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const fetchData = async () => {
    await Promise.all([
      fetchInitialData(),
      fetchPetaJabatan(currentPage, searchTerm, filterOpd, filterStatus, filterJenjang)
    ]);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // If user is OPD, lock the OPD filter
    const effectiveOpd = userRole === 'opd' ? (currentUser?.opd || '') : filterOpd;
    fetchPetaJabatan(currentPage, searchQuery, effectiveOpd, filterStatus, filterJenjang);
  }, [currentPage, searchQuery, filterOpd, filterStatus, filterJenjang, userRole, currentUser]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterOpd, filterStatus, filterJenjang]);

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
        if (data.opd) {
          setFilterOpd(data.opd);
        }
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
    setFilterOpd('');
    setSearchQuery('');
    setSearchTerm('');
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

  const uniqueOpds = filterOptions.opds;
  const uniqueStatuses = filterOptions.statuses;
  const uniqueJenjangs = filterOptions.jenjangs;
  const uniqueJabatans: string[] = []; // Removed for now as it's too many to fetch all

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
        <div className="w-12 h-12 shrink-0 mt-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Serang_City.png/960px-Flag_of_Serang_City.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
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
            onClick={() => setView('jenjang')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'jenjang' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Ringkasan Jenjang"
          >
            <BarChart3 size={24} />
          </button>

          <button 
            type="button"
            onClick={() => setView('bezetting')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'bezetting' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Data Bezetting"
          >
            <LayoutGrid size={24} />
          </button>

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
            onClick={() => setView('history')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'history' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Riwayat Usulan"
          >
            <Clock size={24} />
          </button>

          <button 
            type="button"
            onClick={() => setView('ticketing')}
            className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-center relative z-[110] ${view === 'ticketing' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Ticketing / Kelola Usulan"
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
          onClick={() => setView('history')}
          className={`p-3 rounded-xl transition-all ${view === 'history' ? 'bg-black text-white' : 'text-gray-400'}`}
        >
          <Clock size={20} />
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
            <div className="flex items-center gap-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Serang_City.png/960px-Flag_of_Serang_City.png" 
                alt="Logo Kota Serang" 
                className="w-12 h-12 md:w-16 md:h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">
                {view === 'admin' ? (userRole === 'admin' ? 'DASHPEG - Admin' : 'DASHPEG - OPD') : 
                 view === 'satyalancana' ? 'DASHPEG - Satyalancana' :
                 view === 'jabatan-fungsional' ? 'DASHPEG - Jabatan Fungsional' :
                 view === 'jenjang' ? 'DASHPEG - Ringkasan Jenjang' :
                 view === 'bezetting' ? 'DASHPEG - Data Bezetting' :
                 'DASHPEG'}
              </h1>
              <p className="text-sm md:text-gray-500 font-medium">
                {view === 'jenjang' ? 'Ringkasan Jabatan Berdasarkan Jenjang' : 
                 view === 'bezetting' ? 'Data Bezetting dan Kebutuhan Pegawai' :
                 'Sistem Informasi Kepegawaian & Jabatan (DASHPEG)'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearchQuery(searchTerm);
                }}
                className="relative w-full md:w-auto flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari..."
                    className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none w-full md:w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                >
                  Cari
                </button>
              </form>
              <select 
                value={userRole === 'opd' ? (currentUser?.opd || '') : filterOpd}
                onChange={(e) => setFilterOpd(e.target.value)}
                disabled={userRole === 'opd'}
                className={`p-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none max-w-[150px] ${userRole === 'opd' ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {userRole !== 'opd' && <option value="">Semua OPD</option>}
                {userRole === 'opd' ? (
                  <option value={currentUser?.opd}>{currentUser?.opd}</option>
                ) : (
                  uniqueOpds.map(opd => <option key={opd} value={opd}>{opd}</option>)
                )}
              </select>
              <select 
                value={filterJenjang}
                onChange={(e) => setFilterJenjang(e.target.value)}
                className="p-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none max-w-[150px]"
              >
                <option value="">Semua Jenjang</option>
                {uniqueJenjangs.map(j => <option key={j} value={j}>{j}</option>)}
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
                    <div className="text-4xl font-light">{stats.totalJabatan}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCircle size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Terisi</div>
                    </div>
                    <div className="text-4xl font-light">{stats.terisi}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Users size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Kosong</div>
                    </div>
                    <div className="text-4xl font-light text-amber-600">
                      {stats.kosong}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Usulan</div>
                    </div>
                    <div className="text-4xl font-light">{stats.totalUsulan}</div>
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
                        {petaJabatan.map(item => {
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
                        {petaJabatan.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                              Tidak ada data ditemukan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="p-4 border-t border-black/5 flex items-center justify-between bg-gray-50/50">
                    <div className="text-xs text-gray-500 font-medium">
                      Menampilkan <span className="text-black">{petaJabatan.length}</span> dari <span className="text-black">{totalRows}</span> data
                    </div>
                    <div className="flex gap-2">
                      <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
                      >
                        Prev
                      </button>
                      <div className="flex items-center px-2 text-xs font-bold">
                        {currentPage} / {totalPages}
                      </div>
                      <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : view === 'jenjang' ? (
              <JenjangView data={jenjangSummary} />
            ) : view === 'bezetting' ? (
              <BezettingView data={userRole === 'opd' ? bezettingSummary.filter(b => b.opd === currentUser?.opd) : bezettingSummary} />
            ) : view === 'admin' ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AdminPanel 
                  petaJabatan={petaJabatan}
                  onUpdate={fetchData}
                  userRole={userRole}
                  currentUser={currentUser}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRows={totalRows}
                  onPageChange={setCurrentPage}
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
            ) : view === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HistoryView proposals={unifiedProposals} />
              </motion.div>
            ) : (
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
