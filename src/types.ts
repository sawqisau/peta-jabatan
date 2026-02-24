export interface PetaJabatan {
  id: number;
  idJabatan: string;
  namaJabatan: string;
  opd: string;
  status: string;
  namaPegawai: string;
  nip: string;
  pangkat: string;
  jenjang: string;
  catatan: string;
}

export interface Satyalancana {
  id: number;
  name: string;
  nip: string;
  opd: string;
  type: string; // e.g., 10 Tahun, 20 Tahun, 30 Tahun
  keppresNo: string;
  fileUrl: string;
  status: string;
}

export interface JabatanFungsional {
  id: number;
  type: string;
  nip: string;
  name: string;
  pangkat: string;
  tmtPangkat: string;
  currentJabatan: string;
  currentJenjang: string;
  tmtJabatan: string;
  opd: string;
  proposedJabatan: string;
  proposedJenjang: string;
  pakNo: string;
  pakAmount: string;
  pakDate: string;
  ujikomNo: string;
  ujikomDate: string;
  fileSkPangkat: string;
  fileSkJabatan: string;
  filePak: string;
  fileUjikom: string;
  fileIjazah: string;
  fileSkp: string;
  filePeta: string;
  fileFormasi: string;
  fileUsulanOpd: string;
  fileKetersediaanFormasi: string;
  whatsapp: string;
  status: string;
}

export interface UnifiedProposal {
  id: number;
  name: string;
  nip: string;
  jenisUsulan: string;
  status: string;
  sourceTable: 'satyalancana' | 'jabatan_fungsional';
}

export interface Proposal {
  id: number;
  name: string;
  nip: string;
  type: string;
  status: string;
}

export interface Position {
  id: number;
  title: string;
  department: string;
  parentId: number | null;
  grade: number;
  bezetting: number;
  required: number;
  description: string;
}

export interface Employee {
  id: number;
  name: string;
  positionId: number;
  email: string;
  status: 'active' | 'inactive';
}
