import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Ticket, Search, Download, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { UnifiedProposal } from '../types';

interface TicketingViewProps {
  proposals: UnifiedProposal[];
  onUpdate: () => void;
  userRole: 'admin' | 'opd' | 'public';
}

const TicketingView: React.FC<TicketingViewProps> = ({ proposals, onUpdate, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProposals = proposals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nip.includes(searchTerm) ||
    p.jenisUsulan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusUpdate = async (id: number, sourceTable: string, newStatus: string) => {
    try {
      const response = await fetch('/api/update-proposal-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, sourceTable, status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal memperbarui status. Silakan coba lagi.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring Usulan (Ticketing)</h2>
          <p className="text-sm md:text-gray-500 mt-1">Daftar semua usulan Satyalancana dan Jabatan Fungsional</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Cari Nama, NIP, atau Jenis Usulan..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-black/5 rounded-xl outline-none focus:ring-2 focus:ring-black/5 transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Total: {filteredProposals.length} Usulan
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Nama / NIP</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Jenis Usulan</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Sumber</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {paginatedProposals.map(item => (
                <tr key={`${item.sourceTable}-${item.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.nip}</div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{item.jenisUsulan}</td>
                  <td className="p-4 text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                    <span className="px-2 py-1 bg-gray-100 rounded-md">
                      {item.sourceTable === 'satyalancana' ? 'Satyalancana' : 'Jabatan Fungsional'}
                    </span>
                  </td>
                  <td className="p-4">
                    {userRole === 'admin' ? (
                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, item.sourceTable, e.target.value)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none ${
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
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                        item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                        item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status.toLowerCase() === 'selesai' ? <CheckCircle2 size={12} /> : 
                         item.status.toLowerCase() === 'diproses' ? <Clock size={12} /> : 
                         <AlertCircle size={12} />}
                        {item.status}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedProposals.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-black/5 flex items-center justify-between bg-gray-50/50">
            <div className="text-xs text-gray-500 font-medium">
              Halaman <span className="text-black">{currentPage}</span> dari <span className="text-black">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TicketingView;
