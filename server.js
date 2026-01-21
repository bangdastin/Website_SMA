import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import nodemailer from 'nodemailer'; 
import crypto from 'crypto'; 
import axios from 'axios'; 
import multer from 'multer'; 
import path from 'path';     
import fs from 'fs';         
import { fileURLToPath } from 'url'; 
import dotenv from 'dotenv'; 

// 1. Inisialisasi Environment Variables
dotenv.config();

// ==================================================================
// 2. KONFIGURASI DASAR
// ==================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; 

const SERPAPI_KEY = process.env.SERPAPI_KEY || '543c23317076911b0c2648de7597a0ede38d4187a41a01d58c1047bf7e9149dc'; 

// ==================================================================
// 3. MIDDLEWARE
// ==================================================================
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"]
})); 

app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================================================================
// 4. KONEKSI DATABASE (MENGGUNAKAN POOL)
// ==================================================================
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',      
    database: process.env.MYSQL_NAME || 'website_sma', 
    port: process.env.MYSQL_PORT || 3306,
    dateStrings: true // PENTING: Agar tanggal tidak berubah karena timezone
});

// Cek koneksi saat server mulai
db.connect((err) => {
    if (err) {
        console.error('❌ MYSQL ERROR:', err.message);
    } else {
        console.log('✅ MYSQL TERHUBUNG!');
    }
});

// ==================================================================
// 5. KONFIGURASI EMAIL (NODEMAILER)
// ==================================================================
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,               
    secure: true,           
    auth: {
        user: process.env.EMAIL_USER || 'raynoldsirait7@gmail.com', 
        pass: process.env.EMAIL_PASS || 'obwwmbyvwiykahch' 
    }
});

// ==================================================================
// 6. KONFIGURASI UPLOAD (MULTER) - DIPERBARUI UNTUK PDF
// ==================================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isVercel = process.env.VERCEL === '1';
        const dir = isVercel ? '/tmp' : path.join(__dirname, 'uploads');

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
    fileFilter: (req, file, cb) => {
        // [PERBAIKAN] Izinkan Image DAN PDF
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Format salah! Hanya boleh upload foto (JPG/PNG) atau PDF.'));
        }
    }
});

// ==================================================================
// 7. API ENDPOINTS (AUTHENTICATION)
// ==================================================================

app.post('/api/auth/register', (req, res) => {
    const { nik, username, email, password } = req.body;
    
    if (!nik || !username || !email || !password) {
        return res.status(400).json({ message: "Data tidak lengkap!" });
    }

    const checkSql = "SELECT * FROM users1 WHERE email = ? OR nik = ? OR username = ?";
    db.query(checkSql, [email, nik, username], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error saat cek user." });
        if (results.length > 0) return res.status(400).json({ message: "Email, NIK, atau Username sudah terdaftar!" });

        // Insert ke users1 (Akun Login) - TANPA ROLE
        const sql1 = "INSERT INTO users1 (nik, username, email, password) VALUES (?, ?, ?, ?)";
        db.query(sql1, [nik, username, email, password], (err, result1) => {
            if (err) return res.status(500).json({ error: "Gagal membuat akun login.", details: err.message });

            // Insert ke users (Data Siswa)
            const sql2 = "INSERT INTO users (nik, username, email, status_pendaftaran) VALUES (?, ?, ?, 'Belum')";
            db.query(sql2, [nik, username, email], (err, result2) => {
                if (err) console.error("⚠️ Warning Insert users:", err.message);
                
                // Return Data User agar Frontend bisa Auto-Login
                res.status(200).json({ 
                    message: "Registrasi Berhasil! Silakan Login.",
                    user: {
                        id: result1.insertId,
                        username: username,
                        email: email,
                        nik: nik,
                        role: 'user'
                    }
                });
            });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const identifier = req.body.identifier || req.body.email; 
    const password = req.body.password;

    if (!identifier || !password) {
        return res.status(400).json({ message: "Email/Username dan Password wajib diisi!" });
    }

    const sql = "SELECT * FROM users1 WHERE (email = ? OR username = ?) AND password = ?";
    db.query(sql, [identifier, identifier, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const user = results[0];
            const userRole = 'user'; 

            res.status(200).json({ 
                message: "Login Berhasil", 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email, 
                    nik: user.nik,
                    role: userRole 
                }
            });
        } else {
            res.status(401).json({ message: "Username atau Password salah!" });
        }
    });
});

app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    db.query("SELECT * FROM users1 WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (results.length === 0) return res.status(404).json({ message: "Email tidak terdaftar." });

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); 

        const updateSql = "UPDATE users1 SET reset_token = ?, reset_token_expires = ? WHERE email = ?";
        db.query(updateSql, [token, expires, email], (err) => {
            if (err) return res.status(500).json({ message: "Gagal generate token." });

            const baseUrl = req.headers.origin || 'http://localhost:5173';
            const resetLink = `${baseUrl}/?view=reset&token=${token}`; 

            const mailOptions = {
                from: `"Panitia PPDB" <${process.env.EMAIL_USER || 'raynoldsirait7@gmail.com'}>`,
                to: email,
                subject: 'Reset Password Akun',
                html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h3>Reset Password</h3>
                        <p>Silakan klik tombol di bawah untuk mereset password Anda:</p>
                        <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                       </div>`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) return res.status(500).json({ message: "Gagal mengirim email." });
                res.status(200).json({ message: "Link reset password telah dikirim ke email Anda." });
            });
        });
    });
});

app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    
    db.query("SELECT * FROM users1 WHERE reset_token = ? AND reset_token_expires > NOW()", [token], (err, results) => {
        if (results.length === 0) return res.status(400).json({ message: "Token tidak valid atau kadaluarsa." });

        const userId = results[0].id;
        db.query("UPDATE users1 SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?", [newPassword, userId], (err) => {
            if (err) return res.status(500).json({ message: "Gagal update password." });
            res.status(200).json({ message: "Password berhasil diubah!" });
        });
    });
});

// ==================================================================
// 8. API ENDPOINTS (DATA SISWA & REGISTRASI)
// ==================================================================

app.get('/api/users/:id', (req, res) => {
    const { id } = req.params; // ID dari users1 (akun login)

    // 1. Ambil Data Akun
    db.query("SELECT * FROM users1 WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length === 0) return res.status(404).json({ message: "User Account not found" });

        const userAccount = results[0];

        // 2. Ambil Data Profil berdasarkan Email
        db.query("SELECT * FROM users WHERE email = ?", [userAccount.email], (err2, profiles) => {
            if (err2) return res.status(500).json({ error: err2.message });

            if (profiles.length > 0) {
                // Profil Ditemukan -> Return data lengkap
                res.json({
                    ...profiles[0],
                    id: userAccount.id // Pastikan ID yang dikembalikan adalah ID Akun agar konsisten
                });
            } else {
                // Profil TIDAK Ditemukan -> Return Data Dummy
                res.json({
                    id: userAccount.id,
                    email: userAccount.email,
                    username: userAccount.username,
                    nama_lengkap: userAccount.username, 
                    status_pendaftaran: 'Belum',
                    asal_sekolah: '-',
                    no_ujian: '-',
                    bukti_pembayaran: null
                });
            }
        });
    });
});

app.get('/api/user-status', (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email diperlukan" });

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            const data = results[0];
            res.json({ 
                registered: data.status_pendaftaran !== 'Belum' && data.status_pendaftaran !== null, 
                email: data.email,       
                nama: data.nama_lengkap || data.username, 
                status: (data.status_pendaftaran === 'Belum') ? null : data.status_pendaftaran, 
                asalSekolah: data.asal_sekolah,
                noUjian: data.id ? `2026-${data.id}-EXM` : '-',
                bukti_pembayaran: data.bukti_pembayaran 
            });
        } else {
            res.json({ registered: false, status: null });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { namaLengkap, email, noTelp, tglLahir, asalSekolah, alamatRumah } = req.body;
    
    // Gunakan UPDATE atau INSERT (Upsert Logic)
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if(err) return res.status(500).json({message: "Database Error"});

        if(results.length > 0) {
            // Data ada -> UPDATE
            const sql = `UPDATE users SET nama_lengkap=?, no_telepon=?, tanggal_lahir=?, asal_sekolah=?, alamat_rumah=?, status_pendaftaran='Menunggu' WHERE email=?`;
            db.query(sql, [namaLengkap, noTelp, tglLahir, asalSekolah, alamatRumah, email], (err, result) => {
                if (err) return res.status(500).json({ message: "Gagal menyimpan data", error: err });
                res.status(200).json({ message: "Formulir Berhasil Disimpan" });
            });
        } else {
            // Data tidak ada -> INSERT BARU
            db.query("SELECT nik, username FROM users1 WHERE email = ?", [email], (err2, res2) => {
                if(res2.length > 0) {
                    const { nik, username } = res2[0];
                    const insertSql = `INSERT INTO users (nik, username, email, nama_lengkap, no_telepon, tanggal_lahir, asal_sekolah, alamat_rumah, status_pendaftaran) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')`;
                    db.query(insertSql, [nik, username, email, namaLengkap, noTelp, tglLahir, asalSekolah, alamatRumah], (err3) => {
                        if(err3) return res.status(500).json({message: "Gagal membuat data profil baru"});
                        res.status(200).json({ message: "Formulir Berhasil Disimpan (Profil Baru Dibuat)" });
                    });
                } else {
                    res.status(400).json({message: "Akun login tidak ditemukan"});
                }
            });
        }
    });
});

app.post('/api/upload-payment', upload.single('buktiBayar'), (req, res) => {
    // 1. Validasi File
    if (!req.file) return res.status(400).json({ message: "Pilih foto terlebih dahulu." });
    
    // 2. Validasi User ID dari FormData
    const { userId } = req.body;

    if (!userId) {
        console.error("❌ Error: UserId tidak dikirim dari frontend");
        return res.status(400).json({ message: "User ID tidak ditemukan dalam request." });
    }

    // 3. Cari User di tabel Akun (users1)
    db.query("SELECT email FROM users1 WHERE id = ?", [userId], (err, results) => {
        if(err || results.length === 0) {
            console.error("❌ Error cari user by ID:", err);
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: "User ID tidak valid atau user tidak ditemukan." });
        }

        const emailUser = results[0].email;
        console.log(`📸 Uploading bukti bayar untuk User ID: ${userId} (${emailUser})`);

        // 4. Update tabel Profil Siswa
        const sql = "UPDATE users SET bukti_pembayaran = ?, status_pendaftaran = 'Menunggu' WHERE email = ?";
        
        db.query(sql, [req.file.filename, emailUser], (errUpdate, resUpdate) => {
            if (errUpdate) {
                console.error("❌ Error Update DB:", errUpdate);
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); 
                return res.status(500).json({ message: "Gagal update database." });
            }
            
            res.status(200).json({ message: "Sukses Upload!", filename: req.file.filename });
        });
    });

}, (error, req, res, next) => {
    console.error("❌ Multer Error:", error.message);
    res.status(400).json({ message: error.message });
});

// ==================================================================
// 9. API ENDPOINTS (ADMIN & SEARCH)
// ==================================================================

app.get('/api/users', (req, res) => {
    db.query("SELECT * FROM users ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query("UPDATE users SET status_pendaftaran = ? WHERE id = ?", [status, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Status berhasil diperbarui" });
    });
});

app.get('/api/search-school', async (req, res) => {
    const { query } = req.query; 
    if (!query || query.length < 3) return res.json([]); 

    try {
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                engine: 'google_maps',
                q: `SMP ${query} Indonesia`,
                google_domain: 'google.co.id',
                hl: 'id',
                type: 'search',
                api_key: SERPAPI_KEY
            }
        });

        const cleanResults = (response.data.local_results || [])
            .filter(place => !place.title.toUpperCase().includes("TOKO")) 
            .map(place => ({
                value: place.title,
                address: place.address
            }));

        res.json(cleanResults);
    } catch (error) {
        console.error("SerpApi Error:", error.message);
        res.json([]);
    }
});

// ==================================================================
// 10. API ENDPOINTS (MANAJEMEN PRESTASI)
// ==================================================================

// GET ALL PRESTASI
app.get('/api/prestasi', (req, res) => {
    const sql = "SELECT * FROM prestasi ORDER BY tanggal DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// CREATE PRESTASI
app.post('/api/prestasi', upload.single('gambar'), (req, res) => {
    const { judul, deskripsi, tanggal, penyelenggara } = req.body;
    const gambar = req.file ? req.file.filename : null;
    const sql = "INSERT INTO prestasi (judul, deskripsi, tanggal, penyelenggara, gambar) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [judul, deskripsi, tanggal, penyelenggara, gambar], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Prestasi berhasil ditambahkan", id: result.insertId });
    });
});

// UPDATE PRESTASI
app.put('/api/prestasi/:id', upload.single('gambar'), (req, res) => {
    const { id } = req.params;
    const { judul, deskripsi, tanggal, penyelenggara } = req.body;
    
    if (req.file) {
        const newImage = req.file.filename;
        db.query("SELECT gambar FROM prestasi WHERE id = ?", [id], (err, results) => {
            if (results.length > 0) {
                const oldImage = results[0].gambar;
                if (oldImage && fs.existsSync(path.join(__dirname, 'uploads', oldImage))) {
                    fs.unlinkSync(path.join(__dirname, 'uploads', oldImage));
                }
            }
            const sql = "UPDATE prestasi SET judul=?, deskripsi=?, tanggal=?, penyelenggara=?, gambar=? WHERE id=?";
            db.query(sql, [judul, deskripsi, tanggal, penyelenggara, newImage, id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Update berhasil" });
            });
        });
    } else {
        const sql = "UPDATE prestasi SET judul=?, deskripsi=?, tanggal=?, penyelenggara=? WHERE id=?";
        db.query(sql, [judul, deskripsi, tanggal, penyelenggara, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Update berhasil" });
        });
    }
});

// DELETE PRESTASI
app.delete('/api/prestasi/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT gambar FROM prestasi WHERE id = ?", [id], (err, results) => {
        if (results.length > 0) {
            const gambarLama = results[0].gambar;
            db.query("DELETE FROM prestasi WHERE id = ?", [id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                if (gambarLama && fs.existsSync(path.join(__dirname, 'uploads', gambarLama))) {
                    fs.unlinkSync(path.join(__dirname, 'uploads', gambarLama));
                }
                res.json({ message: "Berhasil dihapus" });
            });
        } else {
            res.status(404).json({ message: "Data tidak ditemukan" });
        }
    });
});

// ==================================================================
// 11. API ENDPOINTS (MANAJEMEN PENGUMUMAN - DIPERBARUI UNTUK PDF)
// ==================================================================

// GET Pengumuman
app.get('/api/pengumuman', (req, res) => {
    const sql = "SELECT * FROM pengumuman ORDER BY tanggal DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST Pengumuman (Sekarang Support Upload File PDF)
app.post('/api/pengumuman', upload.single('file_pdf'), (req, res) => {
    const { judul, isi, tanggal } = req.body;
    const filePdf = req.file ? req.file.filename : null;

    const sql = "INSERT INTO pengumuman (judul, isi, tanggal, file_pdf) VALUES (?, ?, ?, ?)";
    db.query(sql, [judul, isi, tanggal, filePdf], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Pengumuman berhasil ditambahkan" });
    });
});

// PUT Pengumuman (Update Data & PDF)
app.put('/api/pengumuman/:id', upload.single('file_pdf'), (req, res) => {
    const { id } = req.params;
    const { judul, isi, tanggal } = req.body;
    
    // Cek apakah ada file baru yang diupload
    if (req.file) {
        const newFile = req.file.filename;

        // Ambil file lama untuk dihapus
        db.query("SELECT file_pdf FROM pengumuman WHERE id = ?", [id], (err, results) => {
            if (results.length > 0) {
                const oldFile = results[0].file_pdf;
                // Hapus file lama jika ada
                if (oldFile && fs.existsSync(path.join(__dirname, 'uploads', oldFile))) {
                    fs.unlinkSync(path.join(__dirname, 'uploads', oldFile));
                }
            }

            // Update database dengan file baru
            const sql = "UPDATE pengumuman SET judul=?, isi=?, tanggal=?, file_pdf=? WHERE id=?";
            db.query(sql, [judul, isi, tanggal, newFile, id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Pengumuman & File berhasil diupdate" });
            });
        });
    } else {
        // Jika tidak ada file baru, update data teks saja
        const sql = "UPDATE pengumuman SET judul=?, isi=?, tanggal=? WHERE id=?";
        db.query(sql, [judul, isi, tanggal, id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Pengumuman berhasil diupdate (File tetap)" });
        });
    }
});

// DELETE Pengumuman (Hapus File juga)
app.delete('/api/pengumuman/:id', (req, res) => {
    const { id } = req.params;

    // Ambil nama file sebelum menghapus data
    db.query("SELECT file_pdf FROM pengumuman WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            const filePdf = results[0].file_pdf;
            
            // Hapus data dari database
            db.query("DELETE FROM pengumuman WHERE id=?", [id], (errDelete) => {
                if (errDelete) return res.status(500).json({ error: errDelete.message });
                
                // Hapus file fisik jika ada
                if (filePdf && fs.existsSync(path.join(__dirname, 'uploads', filePdf))) {
                    fs.unlinkSync(path.join(__dirname, 'uploads', filePdf));
                }
                
                res.json({ message: "Pengumuman berhasil dihapus" });
            });
        } else {
            res.status(404).json({ message: "Data tidak ditemukan" });
        }
    });
});

// ==================================================================
// 12. JALANKAN SERVER
// ==================================================================

if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => { 
        console.log(`🚀 Server Backend MySQL berjalan di port ${PORT}...`);
    });
}

export default app;