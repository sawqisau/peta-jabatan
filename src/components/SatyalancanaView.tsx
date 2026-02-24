import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Medal, Plus, FileText, Send, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Satyalancana } from '../types';

interface SatyalancanaViewProps {
  data: Satyalancana[];
  onUpdate: () => void;
  currentUser: { name: string; opd: string } | null;
}

const SatyalancanaView: React.FC<SatyalancanaViewProps> = ({ data, onUpdate, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (file && file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      setIsSubmitting(false);
      return;
    }

    if (file && file.type !== "application/pdf") {
      setError("Hanya file PDF yang diperbolehkan");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/satyalancana', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setShowForm(false);
        onUpdate();
      } else {
        setError(result.message || "Gagal mengirim usulan");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pengusulan Satyalancana</h2>
          <p className="text-sm md:text-gray-500 mt-1">Layanan pengusulan tanda kehormatan Satyalancana Karya Satya</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-black/90 transition-all shadow-lg shadow-black/10 w-full md:w-auto justify-center"
        >
          {showForm ? "Batal" : <><Plus size={20} /> Buat Usulan</>}
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nama Lengkap</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={currentUser?.name || ""}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" 
                  placeholder="Masukkan nama sesuai ijazah"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">NIP</label>
                <input 
                  name="nip" 
                  required 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" 
                  placeholder="Masukkan 18 digit NIP"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">OPD / Unit Kerja</label>
                <input 
                  name="opd" 
                  required 
                  defaultValue={currentUser?.opd || ""}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" 
                  placeholder="Nama instansi asal"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jenis Usulan</label>
                <select 
                  name="type" 
                  required 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                >
                  <option value="X TAHUN">X TAHUN (10 Tahun)</option>
                  <option value="XX TAHUN">XX TAHUN (20 Tahun)</option>
                  <option value="XXX TAHUN">XXX TAHUN (30 Tahun)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">No TK Keppres (Jika Ada)</label>
                <input 
                  name="keppresNo" 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" 
                  placeholder="Nomor Keppres sebelumnya"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Dokumen Persyaratan (PDF, Max 2MB)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    name="file" 
                    required 
                    accept=".pdf"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-black/80"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full p-4 bg-black text-white rounded-2xl font-bold hover:bg-black/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : <><Send size={20} /> Kirim Usulan</>}
            </button>
          </form>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-bold">Usulan Berhasil Dikirim!</h4>
            <p className="text-sm opacity-80">Usulan Anda sedang dalam proses verifikasi oleh tim BKPSDM.</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText size={20} /> Riwayat Usulan Anda
        </h3>
        <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Nama / NIP</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Jenis Usulan</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.nip}</div>
                  </td>
                  <td className="p-4 text-gray-600">{item.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status.toLowerCase() === 'diajukan' ? 'bg-blue-100 text-blue-700' : 
                      item.status.toLowerCase() === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.fileUrl ? (
                      <a 
                        href={item.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-black hover:underline"
                      >
                        <Download size={14} /> Lihat PDF
                      </a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                    Belum ada riwayat usulan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SatyalancanaView;
