import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, Users, AlertCircle, TrendingUp } from 'lucide-react';

interface BezettingSummaryItem {
  opd: string;
  total_jabatan: string;
  total_bezetting: string;
  total_kebutuhan: string;
  selisih: string;
}

interface BezettingViewProps {
  data: BezettingSummaryItem[];
}

const BezettingView: React.FC<BezettingViewProps> = ({ data }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  if (!Array.isArray(data)) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-black/5 text-center">
        <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
        <h3 className="text-lg font-bold mb-2">Gagal Memuat Data</h3>
        <p className="text-gray-500">Terjadi kesalahan saat mengambil ringkasan bezetting. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black text-white rounded-lg"><LayoutGrid size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total OPD</div>
          </div>
          <div className="text-4xl font-light">{safeData.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Bezetting</div>
          </div>
          <div className="text-4xl font-light">
            {safeData.reduce((acc, curr) => acc + parseInt(String(curr.total_bezetting || '0')), 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Kebutuhan</div>
          </div>
          <div className="text-4xl font-light">
            {safeData.reduce((acc, curr) => acc + parseInt(String(curr.total_kebutuhan || '0')), 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertCircle size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Selisih</div>
          </div>
          <div className="text-4xl font-light text-amber-600">
            {safeData.reduce((acc, curr) => acc + parseInt(String(curr.selisih || '0')), 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-xl font-bold">Data Bezetting per OPD</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Unit Kerja (OPD)</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Total Jabatan</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Bezetting</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Kebutuhan</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">+/-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {safeData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium">{item.opd}</td>
                  <td className="p-4 text-center font-mono">{item.total_jabatan}</td>
                  <td className="p-4 text-center font-mono text-emerald-600">{item.total_bezetting}</td>
                  <td className="p-4 text-center font-mono text-blue-600">{item.total_kebutuhan}</td>
                  <td className={`p-4 text-center font-mono font-bold ${parseInt(String(item.selisih)) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {parseInt(String(item.selisih)) > 0 ? `+${item.selisih}` : item.selisih}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default BezettingView;
