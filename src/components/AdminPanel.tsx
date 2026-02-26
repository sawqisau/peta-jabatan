import React, { useState } from 'react';
import { Position, Employee, Proposal, PetaJabatan, Satyalancana, JabatanFungsional, UnifiedProposal } from '../types';
import { Plus, Trash2, Edit2, UserPlus, FileText, Map as MapIcon, Medal, Download, Briefcase, Ticket } from 'lucide-react';

interface AdminPanelProps {
  proposals: Proposal[];
  petaJabatan: PetaJabatan[];
  satyalancana: Satyalancana[];
  jabatanFungsional: JabatanFungsional[];
  onUpdate: () => void;
  userRole: 'admin' | 'opd';
  currentUser: { name: string; opd: string } | null;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  proposals, petaJabatan, satyalancana, 
  jabatanFungsional, onUpdate, userRole, 
  currentUser, currentPage, totalPages, totalRows, onPageChange 
}) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'peta-jabatan' | 'satyalancana' | 'jabatan-fungsional'>('peta-jabatan');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const canManagePositions = userRole === 'admin';

  // Filter data based on role and OPD
  const filteredPeta = userRole === 'admin'
    ? petaJabatan
    : petaJabatan.filter(p => p.opd === currentUser?.opd);
    
  const filteredProposalsList = userRole === 'admin'
    ? proposals
    : proposals.filter(p => {
        // Try to find the OPD from the source tables
        const satya = satyalancana.find(s => s.nip === p.nip);
        if (satya) return satya.opd === currentUser?.opd;
        const jf = jabatanFungsional.find(j => j.nip === p.nip);
        if (jf) return jf.opd === currentUser?.opd;
        return false;
      });
    
  const filteredSatya = userRole === 'admin'
    ? satyalancana
    : satyalancana.filter(s => s.opd === currentUser?.opd);

  const filteredJF = userRole === 'admin'
    ? jabatanFungsional
    : jabatanFungsional.filter(j => j.opd === currentUser?.opd);

  const handleDelete = async (id: number, type: string) => {
    if (confirm(`Hapus ${type} ini?`)) {
      await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      onUpdate();
    }
  };

  const handleStatusUpdate = async (id: number, type: string, newStatus: string) => {
    await fetch(`/api/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Auto-fill OPD for OPD users
    if (userRole === 'opd' && currentUser?.opd) {
      if (activeTab === 'peta-jabatan') (data as any).opd = currentUser.opd;
      if (activeTab === 'satyalancana') (data as any).opd = currentUser.opd;
      if (activeTab === 'jabatan-fungsional') (data as any).opd = currentUser.opd;
    }
    
    const endpoint = `/api/${activeTab}`;
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setIsModalOpen(false);
    setEditingItem(null);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-black/5 flex justify-between items-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Logged in as</div>
          <div className="font-bold text-lg">{currentUser?.name || 'User'}</div>
          <div className="text-sm text-gray-500">{currentUser?.opd || 'Semua Unit Kerja'}</div>
        </div>
        <div className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
          {userRole}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('peta-jabatan')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'peta-jabatan' ? 'bg-black text-white' : 'bg-white text-black border border-black/10'}`}
          >
            Peta Jabatan
          </button>
          <button 
            onClick={() => setActiveTab('proposals')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'proposals' ? 'bg-black text-white' : 'bg-white text-black border border-black/10'}`}
          >
            Data Usulan
          </button>
          <button 
            onClick={() => setActiveTab('satyalancana')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'satyalancana' ? 'bg-black text-white' : 'bg-white text-black border border-black/10'}`}
          >
            Satyalancana
          </button>
          <button 
            onClick={() => setActiveTab('jabatan-fungsional')}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${activeTab === 'jabatan-fungsional' ? 'bg-black text-white' : 'bg-white text-black border border-black/10'}`}
          >
            Jabatan Fungsional
          </button>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all w-full md:w-auto justify-center"
        >
          {activeTab === 'peta-jabatan' ? <MapIcon size={18} /> : activeTab === 'proposals' ? <FileText size={18} /> : activeTab === 'satyalancana' ? <Medal size={18} /> : <Briefcase size={18} />}
          Tambah {activeTab === 'peta-jabatan' ? 'Peta' : activeTab === 'proposals' ? 'Usulan' : activeTab === 'satyalancana' ? 'Satya' : 'JF'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-bottom border-black/5">
            <tr>
              {activeTab === 'peta-jabatan' ? (
                <>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">OPD</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">Kelas</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">Bezetting</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">Kebutuhan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">+/-</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Pegawai</th>
                </>
              ) : activeTab === 'proposals' ? (
                <>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">NIP</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jenis Usulan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Status</th>
                </>
              ) : activeTab === 'positions' ? (
                <>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Unit Kerja</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Bezetting</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Kebutuhan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">+/-</th>
                </>
              ) : activeTab === 'satyalancana' ? (
                <>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Nama / NIP</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">OPD</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Status</th>
                </>
              ) : activeTab === 'jabatan-fungsional' ? (
                <>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Nama / NIP</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">OPD</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jenis Usulan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Status</th>
                </>
              ) : (
                <>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Status</th>
                </>
              )}
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {activeTab === 'peta-jabatan' ? (
              filteredPeta.map(item => {
                const selisih = (item.bezetting || 0) - (item.kebutuhan || 0);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{item.namaJabatan}</td>
                    <td className="p-4 text-gray-600 text-sm">{item.opd}</td>
                    <td className="p-4 text-center font-mono text-sm">{item.kelas || '-'}</td>
                    <td className="p-4 text-center font-mono text-sm">{item.bezetting || 0}</td>
                    <td className="p-4 text-center font-mono text-sm">{item.kebutuhan || 0}</td>
                    <td className="p-4 text-center">
                      <span className={`font-mono text-xs font-bold ${selisih >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {selisih >= 0 ? `+${selisih}` : selisih}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'Terisi' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{item.namaPegawai || '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id, 'peta-jabatan')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : activeTab === 'proposals' ? (
              filteredProposalsList.map(prop => (
                <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{prop.name}</td>
                  <td className="p-4 text-gray-600 font-mono text-sm">{prop.nip}</td>
                  <td className="p-4 text-gray-600">{prop.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${prop.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {prop.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingItem(prop); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(prop.id, 'proposal')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : activeTab === 'satyalancana' ? (
              filteredSatya.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.nip}</div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{item.opd}</td>
                  <td className="p-4 text-gray-600">{item.type}</td>
                  <td className="p-4">
                    {userRole === 'admin' ? (
                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, 'satyalancana', e.target.value)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${
                          item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                          item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <option value="Diajukan">Diajukan</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                        item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.fileUrl && (
                        <a href={item.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <Download size={16} />
                        </a>
                      )}
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id, 'satyalancana')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              filteredJF.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.nip}</div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{item.opd}</td>
                  <td className="p-4 text-gray-600 text-sm">{item.type}</td>
                  <td className="p-4">
                    {userRole === 'admin' ? (
                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, 'jabatan-fungsional', e.target.value)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${
                          item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                          item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <option value="Diajukan">Diajukan</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                        item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id, 'jabatan-fungsional')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        
        {activeTab === 'peta-jabatan' && (
          <div className="p-4 border-t border-black/5 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
            <div className="text-xs text-gray-500 font-medium">
              Menampilkan <span className="text-black">{petaJabatan.length}</span> dari <span className="text-black">{totalRows}</span> data
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
              >
                Prev
              </button>
              <div className="flex items-center px-2 text-xs font-bold">
                {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl my-8">
            <h3 className="text-xl font-bold mb-6">
              {editingItem ? 'Edit' : 'Tambah'} {activeTab === 'peta-jabatan' ? 'Peta' : activeTab === 'proposals' ? 'Usulan' : activeTab === 'satyalancana' ? 'Satya' : 'JF'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'peta-jabatan' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama Jabatan</label>
                    <input name="namaJabatan" defaultValue={editingItem?.namaJabatan} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  {userRole === 'admin' ? (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">OPD</label>
                      <input name="opd" defaultValue={editingItem?.opd || ''} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                    </div>
                  ) : (
                    <input type="hidden" name="opd" value={currentUser?.opd || ''} />
                  )}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                    <select name="status" defaultValue={editingItem?.status || "Kosong"} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                      <option value="Terisi">Terisi</option>
                      <option value="Kosong">Kosong</option>
                      <option value="Kosong-Purnabakti">Kosong-Purnabakti</option>
                      <option value="Kosong-Meninggal">Kosong-Meninggal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama Pegawai</label>
                    <input name="namaPegawai" defaultValue={editingItem?.namaPegawai} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">NIP</label>
                    <input name="nip" defaultValue={editingItem?.nip} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Pangkat/Golongan</label>
                    <input name="pangkat" defaultValue={editingItem?.pangkat} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jenjang</label>
                    <input name="jenjang" defaultValue={editingItem?.jenjang} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Kelas Jabatan</label>
                    <input name="kelas" defaultValue={editingItem?.kelas} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Bezetting</label>
                    <input name="bezetting" type="number" defaultValue={editingItem?.bezetting || 0} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Kebutuhan</label>
                    <input name="kebutuhan" type="number" defaultValue={editingItem?.kebutuhan || 0} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Catatan</label>
                    <textarea name="catatan" defaultValue={editingItem?.catatan} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" rows={2} />
                  </div>
                </div>
              ) : activeTab === 'proposals' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama Lengkap</label>
                    <input name="name" defaultValue={editingItem?.name} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">NIP</label>
                    <input name="nip" defaultValue={editingItem?.nip} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jenis Usulan</label>
                    <input name="type" defaultValue={editingItem?.type} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                    <select 
                      name="status" 
                      defaultValue={editingItem?.status || "Diajukan"} 
                      disabled={userRole !== 'admin'}
                      className={`w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none ${userRole !== 'admin' ? 'bg-gray-50 opacity-70' : ''}`}
                    >
                      <option value="Diajukan">Diajukan</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                    {userRole !== 'admin' && <input type="hidden" name="status" value={editingItem?.status || "Diajukan"} />}
                  </div>
                </>
              ) : activeTab === 'satyalancana' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">NIP</label>
                      <input name="nip" defaultValue={editingItem?.nip} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                    </div>
                    {userRole === 'admin' ? (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">OPD</label>
                        <input name="opd" defaultValue={editingItem?.opd || ''} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                    ) : (
                      <input type="hidden" name="opd" value={currentUser?.opd || ''} />
                    )}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jenis</label>
                      <select name="type" defaultValue={editingItem?.type || "X TAHUN"} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                        <option value="X TAHUN">X TAHUN</option>
                        <option value="XX TAHUN">XX TAHUN</option>
                        <option value="XXX TAHUN">XXX TAHUN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">No Keppres</label>
                      <input name="keppresNo" defaultValue={editingItem?.keppresNo} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                      <select 
                        name="status" 
                        defaultValue={editingItem?.status || "Diajukan"} 
                        disabled={userRole !== 'admin'}
                        className={`w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none ${userRole !== 'admin' ? 'bg-gray-50 opacity-70' : ''}`}
                      >
                        <option value="Diajukan">Diajukan</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                      {userRole !== 'admin' && <input type="hidden" name="status" value={editingItem?.status || "Diajukan"} />}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b pb-1">Informasi Umum</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jenis Usulan</label>
                        <select name="type" defaultValue={editingItem?.type || "Kenaikan Jenjang Jabatan Fungsional"} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none">
                          <option value="Kenaikan Jenjang Jabatan Fungsional">Kenaikan Jenjang Jabatan Fungsional</option>
                          <option value="Perpindahan ke dalam Jabatan Fungsional">Perpindahan ke dalam Jabatan Fungsional</option>
                          <option value="Pengukuhan Jabatan Fungsional">Pengukuhan Jabatan Fungsional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nama Lengkap & Gelar</label>
                        <input name="name" defaultValue={editingItem?.name} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">NIP</label>
                        <input name="nip" defaultValue={editingItem?.nip} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                      {userRole === 'admin' ? (
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">OPD / Unit Kerja</label>
                          <input name="opd" defaultValue={editingItem?.opd || ''} required className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                        </div>
                      ) : (
                        <input type="hidden" name="opd" value={currentUser?.opd || ''} />
                      )}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Nomor WhatsApp</label>
                        <input name="whatsapp" defaultValue={editingItem?.whatsapp} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" placeholder="0812..." />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b pb-1">Data Jabatan Saat Ini</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Pangkat/Golongan</label>
                        <input name="pangkat" defaultValue={editingItem?.pangkat} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">TMT Pangkat</label>
                        <input name="tmtPangkat" type="date" defaultValue={editingItem?.tmtPangkat} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jabatan Saat Ini</label>
                        <input name="currentJabatan" defaultValue={editingItem?.currentJabatan} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Jenjang Jabatan</label>
                        <input name="currentJenjang" defaultValue={editingItem?.currentJenjang} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">TMT Jabatan</label>
                        <input name="tmtJabatan" type="date" defaultValue={editingItem?.tmtJabatan} className="w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold border-b pb-1">Status Usulan</h4>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                      <select 
                        name="status" 
                        defaultValue={editingItem?.status || "Diajukan"} 
                        disabled={userRole !== 'admin'}
                        className={`w-full p-2 border border-black/10 rounded-lg focus:ring-2 focus:ring-black/5 outline-none ${userRole !== 'admin' ? 'bg-gray-50 opacity-70' : ''}`}
                      >
                        <option value="Diajukan">Diajukan</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                      {userRole !== 'admin' && <input type="hidden" name="status" value={editingItem?.status || "Diajukan"} />}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-black/10 rounded-lg hover:bg-gray-50 transition-all">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
