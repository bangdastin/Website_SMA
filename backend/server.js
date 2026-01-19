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
  origin: "*", // Mengizinkan akses dari semua sumber
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
})); 
app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================================================================
// 4. KONEKSI DATABASE (MYSQL ONLY)
// ==================================================================
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',      
    database: process.env.MYSQL_NAME || 'website_sma', 
    port: process.env.MYSQL_PORT || 3306         
});

db.connect((err) => {
    if (err) {
        console.error('❌ MYSQL ERROR:', err.message);
        console.error('⚠️ Pastikan Anda sudah setting Environment Variables di Vercel!');
    } else {
        console.log('✅ BERHASIL TERHUBUNG KE MYSQL!');
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
// 6. KONFIGURASI UPLOAD (MULTER - VERCEL COMPATIBLE)
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
        cb(null, 'bukti-' + uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Format salah! Hanya boleh upload foto (JPG/PNG).'));
        }
    }
});

// ==================================================================
// 7. API ENDPOINTS (AUTHENTICATION)
// ==================================================================

app.post('/api/auth/register', (req, res) => {
    const { nik, username, email, password } = req.body;
    
    console.log("📝 Register Request:", { email, username });

    const checkSql = "SELECT * FROM users1 WHERE email = ? OR nik = ? OR username = ?";
    db.query(checkSql, [email, nik, username], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error saat cek user." });
        if (results.length > 0) return res.status(400).json({ message: "Email, NIK, atau Username sudah terdaftar!" });

        const sql1 = "INSERT INTO users1 (nik, username, email, password) VALUES (?, ?, ?, ?)";
        db.query(sql1, [nik, username, email, password], (err, result1) => {
            if (err) {
                console.error("❌ Error Insert users1:", err);
                return res.status(500).json({ error: "Gagal membuat akun login." });
            }

            const sql2 = "INSERT INTO users (nik, username, email, status_pendaftaran) VALUES (?, ?, ?, 'Belum')";
            db.query(sql2, [nik, username, email], (err, result2) => {
                if (err) console.error("⚠️ Warning Insert users:", err);
                res.status(200).json({ message: "Registrasi Berhasil! Silakan Login." });
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
            res.status(200).json({ 
                message: "Login Berhasil", 
                user: { id: user.id, username: user.username, email: user.email, nik: user.nik }
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

            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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
    
    const sql = `UPDATE users SET nama_lengkap=?, no_telepon=?, tanggal_lahir=?, asal_sekolah=?, alamat_rumah=?, status_pendaftaran='Menunggu' WHERE email=?`;
    
    db.query(sql, [namaLengkap, noTelp, tglLahir, asalSekolah, alamatRumah, email], (err, result) => {
        if (err) return res.status(500).json({ message: "Gagal menyimpan data", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "User data tidak ditemukan." });
        res.status(200).json({ message: "Formulir Berhasil Disimpan" });
    });
});

app.post('/api/upload-payment', upload.single('buktiBayar'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Pilih foto terlebih dahulu." });
    
    const { email } = req.body;
    const sql = "UPDATE users SET bukti_pembayaran = ?, status_pendaftaran = 'Menunggu' WHERE email = ?";
    
    db.query(sql, [req.file.filename, email], (err, result) => {
        if (err) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: "Gagal update database." });
        }
        res.status(200).json({ message: "Sukses Upload!", filename: req.file.filename });
    });
}, (error, req, res, next) => {
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
        res.json({ message: "Status berhasil diperbarui", status });
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
// 10. JALANKAN SERVER (UPDATE UNTUK VERCEL)
// ==================================================================

// Logika ini penting agar berjalan di Localhost (app.listen) 
// TETAPI juga bisa di-export untuk Vercel (export default app)

if (!process.env.VERCEL) {
    // Jalankan server hanya jika BUKAN di Vercel (misal: di Laptop/Local)
    app.listen(PORT, '0.0.0.0', () => { 
        console.log(`🚀 Server Backend MySQL berjalan di port ${PORT}...`);
        console.log(`📡 Host Database: ${process.env.MYSQL_HOST || 'localhost'}`);
    });
}

// Export app agar Vercel bisa membacanya sebagai Serverless Function
export default app;