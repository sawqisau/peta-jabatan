import express from "express";
console.log("[Server] Entry point hit");
import { neon } from "@neondatabase/serverless";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Neon SQL
const getSql = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("[Database] DATABASE_URL is not defined in environment variables");
    return null;
  }
  console.log("[Database] DATABASE_URL found, initializing client...");
  return neon(url);
};

const sql = getSql();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'simpeg_uploads',
    allowed_formats: ['pdf'],
    resource_type: 'raw', // Use 'raw' for PDFs to preserve extension and original format
  } as any,
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Increased to 5MB for Cloudinary
});

let isInitializing = false;
let isInitialized = false;

async function initDatabase(retries = 3) {
  if (isInitialized) return;
  if (isInitializing) return;
  isInitializing = true;

  if (!sql) {
    console.error("[Database] Cannot initialize: sql client is null. Check DATABASE_URL environment variable.");
    isInitializing = false;
    return;
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Database] Initializing tables (attempt ${i + 1})...`);
      // Test connection first
      await sql`SELECT 1`;
      console.log("[Database] Connection test successful");

        await sql`
          CREATE TABLE IF NOT EXISTS peta_jabatan (
            id SERIAL PRIMARY KEY,
            namaJabatan TEXT,
            opd TEXT,
            status TEXT,
            namaPegawai TEXT,
            nip TEXT,
            pangkat TEXT,
            jenjang TEXT,
            catatan TEXT,
            kelas TEXT,
            bezetting INTEGER DEFAULT 0,
            kebutuhan INTEGER DEFAULT 0
          );
        `;
      // Cleanup old columns (migration)
      try {
        await sql`ALTER TABLE peta_jabatan DROP COLUMN IF EXISTS idJabatan`;
        await sql`ALTER TABLE peta_jabatan DROP COLUMN IF EXISTS id_peta`;
      } catch (e) {
        console.log("[Database] Migration: Cleanup failed or columns already removed");
      }
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE,
          password TEXT,
          role TEXT,
          opd TEXT,
          name TEXT
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS proposals (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          nip TEXT NOT NULL,
          type TEXT,
          status TEXT
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS satyalancana (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          nip TEXT NOT NULL,
          opd TEXT NOT NULL,
          type TEXT NOT NULL,
          keppresNo TEXT,
          fileUrl TEXT,
          status TEXT NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS jabatan_fungsional (
          id SERIAL PRIMARY KEY,
          type TEXT NOT NULL,
          nip TEXT NOT NULL,
          name TEXT NOT NULL,
          pangkat TEXT,
          tmtPangkat TEXT,
          currentJabatan TEXT,
          currentJenjang TEXT,
          tmtJabatan TEXT,
          opd TEXT NOT NULL,
          proposedJabatan TEXT,
          proposedJenjang TEXT,
          pakNo TEXT,
          pakAmount TEXT,
          pakDate TEXT,
          ujikomNo TEXT,
          ujikomDate TEXT,
          fileSkPangkat TEXT,
          fileSkJabatan TEXT,
          filePak TEXT,
          fileUjikom TEXT,
          fileIjazah TEXT,
          fileSkp TEXT,
          filePeta TEXT,
          fileFormasi TEXT,
          fileUsulanOpd TEXT,
          fileKetersediaanFormasi TEXT,
          whatsapp TEXT,
          status TEXT NOT NULL
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS positions (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          department TEXT NOT NULL,
          parentId INTEGER,
          grade INTEGER DEFAULT 0,
          bezetting INTEGER DEFAULT 0,
          required INTEGER DEFAULT 0,
          description TEXT
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          positionId INTEGER NOT NULL,
          email TEXT,
          status TEXT DEFAULT 'active'
        );
      `;

      // Ensure Admin User exists
      const adminEmail = "admin@serangkota.go.id";
      const users = await sql`SELECT * FROM users WHERE email = ${adminEmail}`;
      if (users.length === 0) {
        await sql`
          INSERT INTO users (email, password, role, opd, name) 
          VALUES ('admin@serangkota.go.id', 'admin123', 'admin', 'BKPSDM', 'Administrator')
        `;
      }
      console.log("[Database] Database initialized successfully");
      isInitialized = true;
      isInitializing = false;
      return; // Success, exit function
    } catch (error) {
      console.error(`[Database] Failed to initialize database (attempt ${i + 1}):`, error);
      if (i === retries - 1) {
        console.error("[Database] Max retries reached. Database initialization failed.");
        isInitializing = false;
      } else {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Call database initialization (background)
initDatabase();

const app = express();
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  if (!isInitialized) {
    await initDatabase();
  }
  
  let counts = {};
  let tables = [];
  if (sql) {
    try {
      const tableList = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      tables = tableList.map(t => t.table_name);

      const petaCount = await sql`SELECT COUNT(*) FROM peta_jabatan`;
      const userCount = await sql`SELECT COUNT(*) FROM users`;
      counts = {
        peta_jabatan: petaCount[0].count,
        users: userCount[0].count
      };
    } catch (e) {
      console.error("Failed to get counts/tables:", e);
    }
  }

  res.json({ 
    status: "ok", 
    database: !!sql, 
    initialized: isInitialized,
    initializing: isInitializing,
    tables,
    counts
  });
});

// API Routes
app.get("/api/bezetting-summary", async (req, res) => {
  if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
  try {
    const summary = await sql`
      SELECT 
        opd,
        COUNT(*) as total_jabatan,
        SUM(bezetting) as total_bezetting,
        SUM(kebutuhan) as total_kebutuhan,
        SUM(kebutuhan) - SUM(bezetting) as selisih
      FROM peta_jabatan
      GROUP BY opd
      ORDER BY opd ASC
    `;
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/jenjang-summary", async (req, res) => {
  if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
  try {
    const summary = await sql`
      SELECT 
        jenjang,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Terisi') as terisi,
        COUNT(*) FILTER (WHERE status ILIKE '%kosong%') as kosong
      FROM peta_jabatan
      WHERE jenjang IS NOT NULL
      GROUP BY jenjang
      ORDER BY jenjang ASC
    `;
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/stats", async (req, res) => {
  if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
  try {
    const totalJabatan = await sql`SELECT COUNT(*) FROM peta_jabatan`;
    const terisi = await sql`SELECT COUNT(*) FROM peta_jabatan WHERE status = 'Terisi'`;
    const kosong = await sql`SELECT COUNT(*) FROM peta_jabatan WHERE status ILIKE '%kosong%'`;
    const totalUsulan = await sql`SELECT COUNT(*) FROM proposals`;
    
    res.json({
      totalJabatan: parseInt(totalJabatan[0].count),
      terisi: parseInt(terisi[0].count),
      kosong: parseInt(kosong[0].count),
      totalUsulan: parseInt(totalUsulan[0].count)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/peta-jabatan-filters", async (req, res) => {
  if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
  try {
    const opds = await sql`SELECT DISTINCT opd FROM peta_jabatan WHERE opd IS NOT NULL ORDER BY opd ASC`;
    const statuses = await sql`SELECT DISTINCT status FROM peta_jabatan WHERE status IS NOT NULL ORDER BY status ASC`;
    const jenjangs = await sql`SELECT DISTINCT jenjang FROM peta_jabatan WHERE jenjang IS NOT NULL ORDER BY jenjang ASC`;
    
    res.json({
      opds: opds.map(r => r.opd),
      statuses: statuses.map(r => r.status),
      jenjangs: jenjangs.map(r => r.jenjang)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/peta-jabatan", async (req, res) => {
  if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const opd = (req.query.opd as string) || "";
    const status = (req.query.status as string) || "";
    const jenjang = (req.query.jenjang as string) || "";

    // Build query with filters
    let query = sql`SELECT * FROM peta_jabatan WHERE 1=1`;
    let countQuery = sql`SELECT COUNT(*) FROM peta_jabatan WHERE 1=1`;

    if (search) {
      const searchPattern = `%${search}%`;
      query = sql`${query} AND (namaJabatan ILIKE ${searchPattern} OR namaPegawai ILIKE ${searchPattern} OR nip ILIKE ${searchPattern})`;
      countQuery = sql`${countQuery} AND (namaJabatan ILIKE ${searchPattern} OR namaPegawai ILIKE ${searchPattern} OR nip ILIKE ${searchPattern})`;
    }
    if (opd) {
      query = sql`${query} AND opd = ${opd}`;
      countQuery = sql`${countQuery} AND opd = ${opd}`;
    }
    if (status) {
      query = sql`${query} AND status = ${status}`;
      countQuery = sql`${countQuery} AND status = ${status}`;
    }
    if (jenjang) {
      query = sql`${query} AND jenjang = ${jenjang}`;
      countQuery = sql`${countQuery} AND jenjang = ${jenjang}`;
    }

    const totalRes = await countQuery;
    const total = parseInt(totalRes[0].count);

    const data = await sql`${query} ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`;
    
    // Map snake_case to camelCase for compatibility with frontend
    const mappedData = data.map((row: any) => ({
      id: row.id,
      namaJabatan: row.nama_jabatan || row.namajabatan || row.namaJabatan,
      opd: row.opd,
      status: row.status,
      namaPegawai: row.nama_pegawai || row.namapegawai || row.namaPegawai,
      nip: row.nip,
      pangkat: row.pangkat,
      jenjang: row.jenjang,
      catatan: row.catatan,
      kelas: row.kelas,
      bezetting: row.bezetting,
      kebutuhan: row.kebutuhan
    }));

    res.json({
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    console.error("[API] Error fetching peta-jabatan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

  app.post("/api/peta-jabatan", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const { namaJabatan, opd, status, namaPegawai, nip, pangkat, jenjang, catatan, kelas, bezetting, kebutuhan } = req.body;
      const result = await sql`
        INSERT INTO peta_jabatan (namaJabatan, opd, status, namaPegawai, nip, pangkat, jenjang, catatan, kelas, bezetting, kebutuhan) 
        VALUES (${namaJabatan}, ${opd}, ${status}, ${namaPegawai}, ${nip}, ${pangkat}, ${jenjang}, ${catatan}, ${kelas}, ${bezetting}, ${kebutuhan}) 
        RETURNING id
      `;
      res.json({ id: result[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put("/api/peta-jabatan/:id", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const { namaJabatan, opd, status, namaPegawai, nip, pangkat, jenjang, catatan, kelas, bezetting, kebutuhan } = req.body;
      const id = req.params.id;
      await sql`
        UPDATE peta_jabatan 
        SET namaJabatan = ${namaJabatan}, opd = ${opd}, status = ${status}, 
            namaPegawai = ${namaPegawai}, nip = ${nip}, pangkat = ${pangkat}, jenjang = ${jenjang}, 
            catatan = ${catatan}, kelas = ${kelas}, bezetting = ${bezetting}, kebutuhan = ${kebutuhan}
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/peta-jabatan/:id", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const id = req.params.id;
      await sql`DELETE FROM peta_jabatan WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const { email, password } = req.body;
      const users = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
      const user = users[0] as any;
      
      if (user) {
        res.json({ 
          success: true, 
          role: user.role, 
          opd: user.opd,
          name: user.name 
        });
      } else {
        res.status(401).json({ success: false, message: "Email atau password salah" });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/proposals", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const proposals = await sql`SELECT * FROM proposals ORDER BY id ASC`;
      res.json(proposals);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/satyalancana", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const data = await sql`SELECT * FROM satyalancana ORDER BY id ASC`;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/satyalancana", upload.single('file'), async (req, res) => {
    try {
      const { name, nip, opd, type, keppresNo, status } = req.body;
      const fileUrl = req.file ? (req.file as any).path : "";
      const finalStatus = status || "Diajukan";
      
      const result = await sql`
        INSERT INTO satyalancana (name, nip, opd, type, keppresNo, fileUrl, status) 
        VALUES (${name}, ${nip}, ${opd}, ${type}, ${keppresNo}, ${fileUrl}, ${finalStatus}) 
        RETURNING id
      `;
      
      res.json({ success: true, id: result[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put("/api/satyalancana/:id", async (req, res) => {
    try {
      const { name, nip, opd, type, keppresNo, status } = req.body;
      const id = req.params.id;
      await sql`
        UPDATE satyalancana 
        SET name = ${name}, nip = ${nip}, opd = ${opd}, type = ${type}, keppresNo = ${keppresNo}, status = ${status} 
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/satyalancana/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await sql`DELETE FROM satyalancana WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/jabatan-fungsional", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const data = await sql`SELECT * FROM jabatan_fungsional ORDER BY id ASC`;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/jabatan-fungsional", upload.fields([
    { name: 'fileSkPangkat', maxCount: 1 },
    { name: 'fileSkJabatan', maxCount: 1 },
    { name: 'filePak', maxCount: 1 },
    { name: 'fileUjikom', maxCount: 1 },
    { name: 'fileIjazah', maxCount: 1 },
    { name: 'fileSkp', maxCount: 1 },
    { name: 'filePeta', maxCount: 1 },
    { name: 'fileFormasi', maxCount: 1 },
    { name: 'fileUsulanOpd', maxCount: 1 },
    { name: 'fileKetersediaanFormasi', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const getFileUrl = (fieldname: string) => files[fieldname] ? (files[fieldname][0] as any).path : "";
      
      const { 
        type, nip, name, pangkat, tmtPangkat, currentJabatan, currentJenjang, 
        tmtJabatan, opd, proposedJabatan, proposedJenjang, pakNo, pakAmount, 
        pakDate, ujikomNo, ujikomDate, whatsapp, status 
      } = req.body;

      const finalStatus = status || "Diajukan";
      const fSkPangkat = getFileUrl('fileSkPangkat');
      const fSkJabatan = getFileUrl('fileSkJabatan');
      const fPak = getFileUrl('filePak');
      const fUjikom = getFileUrl('fileUjikom');
      const fIjazah = getFileUrl('fileIjazah');
      const fSkp = getFileUrl('fileSkp');
      const fPeta = getFileUrl('filePeta');
      const fFormasi = getFileUrl('fileFormasi');
      const fUsulanOpd = getFileUrl('fileUsulanOpd');
      const fKetersediaanFormasi = getFileUrl('fileKetersediaanFormasi');

      const result = await sql`
        INSERT INTO jabatan_fungsional (
          type, nip, name, pangkat, tmtPangkat, currentJabatan, currentJenjang, 
          tmtJabatan, opd, proposedJabatan, proposedJenjang, pakNo, pakAmount, 
          pakDate, ujikomNo, ujikomDate, fileSkPangkat, fileSkJabatan, filePak, 
          fileUjikom, fileIjazah, fileSkp, filePeta, fileFormasi, fileUsulanOpd, 
          fileKetersediaanFormasi, whatsapp, status
        ) VALUES (
          ${type}, ${nip}, ${name}, ${pangkat}, ${tmtPangkat}, ${currentJabatan}, ${currentJenjang}, 
          ${tmtJabatan}, ${opd}, ${proposedJabatan}, ${proposedJenjang}, ${pakNo}, ${pakAmount}, 
          ${pakDate}, ${ujikomNo}, ${ujikomDate}, ${fSkPangkat}, ${fSkJabatan}, ${fPak}, 
          ${fUjikom}, ${fIjazah}, ${fSkp}, ${fPeta}, ${fFormasi}, ${fUsulanOpd}, 
          ${fKetersediaanFormasi}, ${whatsapp}, ${finalStatus}
        )
        RETURNING id
      `;
      
      res.json({ success: true, id: result[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/jabatan-fungsional/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await sql`DELETE FROM jabatan_fungsional WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/all-proposals", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const satya = await sql`
        SELECT id, name, nip, type as "jenisUsulan", status, 'satyalancana' as "sourceTable" 
        FROM satyalancana
      `;
      
      const jf = await sql`
        SELECT id, name, nip, type as "jenisUsulan", status, 'jabatan_fungsional' as "sourceTable" 
        FROM jabatan_fungsional
      `;
      
      res.json([...satya, ...jf]);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.patch("/api/update-proposal-status", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const { id, sourceTable, status } = req.body;
      if (sourceTable === 'satyalancana') {
        await sql`UPDATE satyalancana SET status = ${status} WHERE id = ${id}`;
      } else if (sourceTable === 'jabatan_fungsional') {
        await sql`UPDATE jabatan_fungsional SET status = ${status} WHERE id = ${id}`;
      } else {
        return res.status(400).json({ success: false, message: "Invalid source table" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/proposals", async (req, res) => {
    try {
      const { name, nip, type, status } = req.body;
      const result = await sql`
        INSERT INTO proposals (name, nip, type, status) 
        VALUES (${name}, ${nip}, ${type}, ${status}) 
        RETURNING id
      `;
      res.json({ id: result[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put("/api/proposals/:id", async (req, res) => {
    try {
      const { name, nip, type, status } = req.body;
      const id = req.params.id;
      await sql`
        UPDATE proposals 
        SET name = ${name}, nip = ${nip}, type = ${type}, status = ${status} 
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/proposals/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await sql`DELETE FROM proposals WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/positions", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const positions = await sql`SELECT * FROM positions ORDER BY id ASC`;
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/positions", async (req, res) => {
    try {
      const { title, department, parentId, grade, bezetting, required, description } = req.body;
      const result = await sql`
        INSERT INTO positions (title, department, parentId, grade, bezetting, required, description) 
        VALUES (${title}, ${department}, ${parentId}, ${grade}, ${bezetting}, ${required}, ${description}) 
        RETURNING id
      `;
      res.json({ id: result[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put("/api/positions/:id", async (req, res) => {
    try {
      const { title, department, parentId, grade, bezetting, required, description } = req.body;
      const id = req.params.id;
      await sql`
        UPDATE positions 
        SET title = ${title}, department = ${department}, parentId = ${parentId}, grade = ${grade}, 
            bezetting = ${bezetting}, required = ${required}, description = ${description} 
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/positions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await sql`DELETE FROM positions WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/employees", async (req, res) => {
    if (!sql) return res.status(500).json({ success: false, message: "Database not configured" });
    try {
      const employees = await sql`SELECT * FROM employees ORDER BY id ASC`;
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const { name, positionId, email, status } = req.body;
      const result = await sql`
        INSERT INTO employees (name, positionId, email, status) 
        VALUES (${name}, ${positionId}, ${email}, ${status}) 
        RETURNING id
      `;
      res.json({ id: result[0].id });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const { name, positionId, email, status } = req.body;
      const id = req.params.id;
      await sql`
        UPDATE employees 
        SET name = ${name}, positionId = ${positionId}, email = ${email}, status = ${status} 
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await sql`DELETE FROM employees WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Vite middleware for development
  console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[Server] VERCEL: ${process.env.VERCEL}`);
  
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL || fs.existsSync(path.join(__dirname, "..", "dist"));

  if (!isProduction) {
    try {
      console.log("[Server] Attempting to load Vite dev server...");
      const require = createRequire(import.meta.url);
      const vitePkg = "vite";
      const { createServer: createViteServer } = require(vitePkg);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[Server] Vite dev server middleware attached");
    } catch (e) {
      console.error("[Server] Failed to load Vite:", e);
    }
  } else {
    console.log("[Server] Serving static files from dist");
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

export default app;
