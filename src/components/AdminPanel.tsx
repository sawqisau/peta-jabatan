import React, { useState } from 'react';
import { Position, Employee, Proposal, PetaJabatan, Satyalancana, JabatanFungsional, UnifiedProposal } from '../types';
import { Plus, Trash2, Edit2, UserPlus, FileText, Map as MapIcon, Medal, Download, Briefcase, Ticket } from 'lucide-react';

interface AdminPanelProps {
  petaJabatan: PetaJabatan[];
  onUpdate: () => void;
  userRole: 'admin' | 'opd';
  currentUser: { name: string; opd: string } | null;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  petaJabatan, onUpdate, userRole, 
  currentUser, currentPage, totalPages, totalRows, onPageChange 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const canManagePositions = userRole === 'admin';

  // Filter data based on role and OPD
  const filteredPeta = userRole === 'admin'
    ? petaJabatan
    : petaJabatan.filter(p => p.opd === currentUser?.opd);
    
  const handleDelete = async (id: number, type: string) => {
    if (confirm(`Hapus ${type} ini?`)) {
      await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      onUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Auto-fill OPD for OPD users
    if (userRole === 'opd' && currentUser?.opd) {
      (data as any).opd = currentUser.opd;
    }
    
    const endpoint = `/api/peta-jabatan`;
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
          <div className="px-4 py-2 rounded-lg bg-black text-white whitespace-nowrap">
            Peta Jabatan
          </div>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-all w-full md:w-auto justify-center"
        >
          <MapIcon size={18} />
          Tambah Peta
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-[#fcfcfc] border-bottom border-black/5">
            <tr>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Jabatan</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">OPD</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">Kelas</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">Bezetting</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">Kebutuhan</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-center">+/-</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider">Pegawai</th>
              <th className="p-4 font-medium text-sm text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {filteredPeta.map(item => {
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
            })}
          </tbody>
        </table>
        </div>
        
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl my-8">
            <h3 className="text-xl font-bold mb-6">
              {editingItem ? 'Edit' : 'Tambah'} Peta
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
