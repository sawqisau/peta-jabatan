import React from 'react';
import { motion } from 'motion/react';
import { Ticket, Search, Download } from 'lucide-react';
import { UnifiedProposal } from '../types';

interface TicketingViewProps {
  proposals: UnifiedProposal[];
  searchTerm: string;
}

const TicketingView: React.FC<TicketingViewProps> = ({ proposals, searchTerm }) => {
  const filteredProposals = proposals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nip.includes(searchTerm) ||
    p.jenisUsulan.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredProposals.map(item => (
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
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                      item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                    Data tidak ditemukan. Silakan gunakan fitur pencarian di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketingView;
