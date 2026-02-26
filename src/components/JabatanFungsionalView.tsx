import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Plus, FileText, Send, AlertCircle, CheckCircle2, Download, Phone } from 'lucide-react';
import { JabatanFungsional } from '../types';

interface JabatanFungsionalViewProps {
  data: JabatanFungsional[];
  onUpdate: () => void;
  currentUser: { name: string; opd: string } | null;
}

const JabatanFungsionalView: React.FC<JabatanFungsionalViewProps> = ({ data, onUpdate, currentUser }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    // Validate file sizes (2MB each)
    const fileFields = [
      'fileSkPangkat', 'fileSkJabatan', 'filePak', 'fileUjikom', 
      'fileIjazah', 'fileSkp', 'filePeta', 'fileFormasi', 
      'fileUsulanOpd', 'fileKetersediaanFormasi'
    ];

    for (const field of fileFields) {
      const file = formData.get(field) as File;
      if (file && file.size > 2 * 1024 * 1024) {
        setError(`Ukuran file ${field} maksimal 2MB`);
        setIsSubmitting(false);
        return;
      }
      if (file && file.name && file.type !== "application/pdf") {
        setError(`File ${field} harus berformat PDF`);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/jabatan-fungsional', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
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
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Usulan Jabatan Fungsional</h2>
        <p className="text-sm md:text-gray-500 mt-1">Layanan pengusulan kenaikan jenjang, perpindahan, dan pengukuhan JF</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Informasi Umum</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jenis Usulan</label>
                <select name="type" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5 appearance-none">
                  <option value="Kenaikan Jenjang Jabatan Fungsional">Kenaikan Jenjang Jabatan Fungsional</option>
                  <option value="Perpindahan ke dalam Jabatan Fungsional">Perpindahan ke dalam Jabatan Fungsional</option>
                  <option value="Pengukuhan Jabatan Fungsional">Pengukuhan Jabatan Fungsional</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nama Lengkap & Gelar</label>
                <input name="name" required defaultValue={currentUser?.name || ""} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">NIP</label>
                <input name="nip" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">OPD / Unit Kerja</label>
                <input name="opd" required defaultValue={currentUser?.opd || ""} className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="whatsapp" required className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" placeholder="0812..." />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Data Jabatan Saat Ini</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pangkat/Golongan</label>
                <input name="pangkat" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">TMT Pangkat</label>
                <input name="tmtPangkat" type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jabatan Saat Ini</label>
                <input name="currentJabatan" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jenjang Jabatan</label>
                <input name="currentJenjang" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">TMT Jabatan</label>
                <input name="tmtJabatan" type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Data Jabatan Yang Diusulkan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jabatan Yang Diusulkan</label>
                <input name="proposedJabatan" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jenjang Jabatan</label>
                <input name="proposedJenjang" required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Data Pendukung (PAK & Ujikom)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">No. PAK</label>
                <input name="pakNo" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jumlah Angka Kredit</label>
                <input name="pakAmount" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tgl Penetapan PAK</label>
                <input name="pakDate" type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">No. Sertifikat Ujikom</label>
                <input name="ujikomNo" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tgl Lulus Ujikom</label>
                <input name="ujikomDate" type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b pb-2">Upload Dokumen (PDF, Max 2MB per file)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                { label: "SK Pangkat Terakhir", name: "fileSkPangkat" },
                { label: "SK Jabatan Terakhir", name: "fileSkJabatan" },
                { label: "SK Penetapan Angka Kredit", name: "filePak" },
                { label: "Sertifikat Lulus Uji Kompetensi", name: "fileUjikom" },
                { label: "Ijazah & Transkrip Terakhir", name: "fileIjazah" },
                { label: "SKP 2 Tahun Terakhir", name: "fileSkp" },
                { label: "Peta Jabatan", name: "filePeta" },
                { label: "Penetapan Formasi (KemenpanRB)", name: "fileFormasi" },
                { label: "Surat Usulan Kepala OPD", name: "fileUsulanOpd" },
                { label: "Form Ketersediaan Formasi OPD", name: "fileKetersediaanFormasi" },
              ].map((file) => (
                <div key={file.name} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{file.label}</label>
                  <input 
                    type="file" 
                    name={file.name} 
                    accept=".pdf"
                    className="w-full p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-black/80"
                  />
                </div>
              ))}
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
            className="w-full p-6 bg-black text-white rounded-2xl font-bold hover:bg-black/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
          >
            {isSubmitting ? "Mengirim..." : <><Send size={24} /> Kirim Seluruh Data Usulan</>}
          </button>
        </form>
      </motion.div>

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
            <p className="text-sm opacity-80">Usulan Jabatan Fungsional Anda telah masuk dalam antrian verifikasi.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default JabatanFungsionalView;
