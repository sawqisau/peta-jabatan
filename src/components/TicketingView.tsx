import React from 'react';
import { motion } from 'motion/react';
import { Ticket, Search, Download } from 'lucide-react';
import { UnifiedProposal } from '../types';

interface TicketingViewProps {
  proposals: UnifiedProposal[];
  searchTerm: string;
  userRole: 'admin' | 'opd' | 'public';
  onUpdate: () => void;
}

const TicketingView: React.FC<TicketingViewProps> = ({ proposals, searchTerm, userRole, onUpdate }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const filteredProposals = proposals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nip.includes(searchTerm) ||
    p.jenisUsulan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusUpdate = async (id: number, type: string, newStatus: string) => {
    const endpoint = type === 'satyalancana' ? '/api/satyalancana' : '/api/jabatan-fungsional';
    await fetch(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cek Status Usulan (Ticketing)</h2>
          <p className="text-sm md:text-gray-500 mt-1">Pantau status pengajuan Satyalancana dan Jabatan Fungsional Anda</p>
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
                  <td className="p-4 text-gray-500 text-xs uppercase tracking-wider font-bold">
                    {item.sourceTable === 'satyalancana' ? 'Satya' : 'JF'}
                  </td>
                  <td className="p-4">
                    {userRole === 'admin' ? (
                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, item.sourceTable, e.target.value)}
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
              Menampilkan <span className="text-black">{startIndex + 1}</span> - <span className="text-black">{Math.min(startIndex + itemsPerPage, filteredProposals.length)}</span> dari <span className="text-black">{filteredProposals.length}</span> data
            </div>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
              >
                Prev
              </button>
              <div className="flex items-center px-2 text-xs font-bold">
                {currentPage} / {totalPages}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-black/10 rounded-lg disabled:opacity-30 hover:bg-white transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TicketingView;
