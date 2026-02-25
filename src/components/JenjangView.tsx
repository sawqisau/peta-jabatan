import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface JenjangSummaryItem {
  jenjang: string;
  total: string;
  terisi: string;
  kosong: string;
}

interface JenjangViewProps {
  data: JenjangSummaryItem[];
}

const JenjangView: React.FC<JenjangViewProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-black text-white rounded-lg"><BarChart3 size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Jenjang</div>
          </div>
          <div className="text-4xl font-light">{data.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><PieChart size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Jabatan</div>
          </div>
          <div className="text-4xl font-light">
            {data.reduce((acc, curr) => acc + parseInt(curr.total), 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Rata-rata Terisi</div>
          </div>
          <div className="text-4xl font-light">
            {data.length > 0 
              ? Math.round((data.reduce((acc, curr) => acc + parseInt(curr.terisi), 0) / data.reduce((acc, curr) => acc + parseInt(curr.total), 0)) * 100) 
              : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-xl font-bold">Ringkasan Jabatan per Jenjang</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Jenjang</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Total Jabatan</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Terisi</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-center">Kosong</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Persentase Terisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.map((item, idx) => {
                const total = parseInt(item.total);
                const terisi = parseInt(item.terisi);
                const percentage = total > 0 ? Math.round((terisi / total) * 100) : 0;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{item.jenjang}</td>
                    <td className="p-4 text-center font-mono">{item.total}</td>
                    <td className="p-4 text-center font-mono text-emerald-600">{item.terisi}</td>
                    <td className="p-4 text-center font-mono text-amber-600">{item.kosong}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-black transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default JenjangView;
