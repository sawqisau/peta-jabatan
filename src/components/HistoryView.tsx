import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, User, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { UnifiedProposal } from '../types';

interface HistoryViewProps {
  proposals: UnifiedProposal[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ proposals }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UnifiedProposal[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const filtered = proposals.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
    setHasSearched(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Cek Riwayat Usulan</h2>
        <p className="text-gray-500">Masukkan Nama atau NIP untuk melihat status pengajuan usulan Anda</p>
      </div>

      <div className="bg-white p-2 rounded-3xl border border-black/5 shadow-xl flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Cari berdasarkan Nama atau NIP..."
              className="w-full p-4 pl-12 bg-transparent border-none outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-black/90 transition-all"
          >
            Cari Data
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {hasSearched ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {results && results.length > 0 ? (
              results.map((item, idx) => (
                <motion.div 
                  key={`${item.sourceTable}-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="font-mono">{item.nip}</span>
                        <span className="flex items-center gap-1"><FileText size={14} /> {item.jenisUsulan}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status Usulan</div>
                      <div className={`flex items-center gap-2 font-bold ${
                        item.status.toLowerCase() === 'selesai' ? 'text-emerald-600' : 
                        item.status.toLowerCase() === 'diproses' ? 'text-blue-600' : 
                        'text-amber-600'
                      }`}>
                        {item.status.toLowerCase() === 'selesai' ? <CheckCircle2 size={16} /> : 
                         item.status.toLowerCase() === 'diproses' ? <Clock size={16} /> : 
                         <AlertCircle size={16} />}
                        {item.status}
                      </div>
                    </div>
                    <div className="md:hidden flex justify-between items-center w-full border-t pt-4">
                      <span className="text-xs font-bold uppercase text-gray-400">Status</span>
                      <span className={`font-bold ${
                        item.status.toLowerCase() === 'selesai' ? 'text-emerald-600' : 
                        item.status.toLowerCase() === 'diproses' ? 'text-blue-600' : 
                        'text-amber-600'
                      }`}>{item.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-400">Data Tidak Ditemukan</h3>
                <p className="text-gray-400 text-sm">Pastikan NIP atau Nama yang Anda masukkan sudah benar</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-20 opacity-30">
            <Search className="mx-auto mb-4" size={48} />
            <p className="text-lg font-medium italic">Silakan lakukan pencarian untuk melihat riwayat usulan</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryView;
