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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; 

// Gunakan API Key SerpApi Anda
const SERPAPI_KEY = process.env.SERPAPI_KEY || '543c23317076911b0c2648de7597a0ede38d4187a41a01d58c1047bf7e9149dc'; 

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"]
})); 

app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',      
    database: process.env.MYSQL_NAME || 'website_sma', 
    port: process.env.MYSQL_PORT || 3306,
    dateStrings: true 
});

db.connect((err) => {
    if (err) console.error('❌ MYSQL ERROR:', err.message);
    else console.log('✅ MYSQL TERHUBUNG!');
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,               
    secure: true,           
    auth: {
        user: process.env.EMAIL_USER || 'raynoldsirait7@gmail.com', 
        pass: process.env.EMAIL_PASS || 'obwwmbyvwiykahch' 
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isVercel = process.env.VERCEL === '1';
        const dir = isVercel ? '/tmp' : path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Format salah! Hanya boleh upload foto (JPG/PNG) atau PDF.'));
        }
    }
});

// Helper check registration
const checkRegistrationOpen = (res, callback) => {
    db.query("SELECT value FROM settings WHERE `key` = 'registration_status'", (err, results) => {
        if (err) return res.status(500).json({ error: "Gagal mengecek status pendaftaran." });
        const status = results.length > 0 ? results[0].value : 'closed';
        if (status === 'closed') {
            return res.status(403).json({ message: "MOHON MAAF, PENDAFTARAN SUDAH DITUTUP." });
        }
        callback();
    });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', (req, res) => {
    checkRegistrationOpen(res, () => {
        const { nik, username, email, password } = req.body;
        if (!nik || !username || !email || !password) return res.status(400).json({ message: "Data tidak lengkap!" });

        const checkSql = "SELECT * FROM users1 WHERE email = ? OR nik = ? OR username = ?";
        db.query(checkSql, [email, nik, username], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error." });
            if (results.length > 0) return res.status(400).json({ message: "Email, NIK, atau Username sudah terdaftar!" });

            const sql1 = "INSERT INTO users1 (nik, username, email, password) VALUES (?, ?, ?, ?)";
            db.query(sql1, [nik, username, email, password], (err, result1) => {
                if (err) return res.status(500).json({ error: "Gagal membuat akun." });

                const sql2 = "INSERT INTO users (nik, username, email, status_pendaftaran) VALUES (?, ?, ?, 'Belum')";
                db.query(sql2, [nik, username, email], (err) => {
                    if (err) console.error("Warning Insert users:", err.message);
                    res.status(200).json({ 
                        message: "Registrasi Berhasil!",
                        user: { id: result1.insertId, username, email, nik, role: 'user' }
                    });
                });
            });
        });
    });
});

app.post('/api/auth/login', (req, res) => {
    const identifier = req.body.identifier || req.body.email; 
    const password = req.body.password;

    if (!identifier || !password) return res.status(400).json({ message: "Email/Username dan Password wajib diisi!" });

    const sql = "SELECT * FROM users1 WHERE (email = ? OR username = ?) AND password = ?";
    db.query(sql, [identifier, identifier, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            const user = results[0];
            res.status(200).json({ 
                message: "Login Berhasil", 
                user: { id: user.id, username: user.username, email: user.email, nik: user.nik, role: 'user' }
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
            
            // 🔥 PERBAIKAN DISINI: Tambahkan '/auth' agar tidak lari ke Landing Page
            const resetLink = `${baseUrl}/auth?view=reset&token=${token}`; 

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
                res.status(200).json({ message: "Reset Password Telah dikirimkan ke email anda." });
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

app.get('/api/users/:id', (req, res) => {
    const { id } = req.params; 
    db.query("SELECT * FROM users1 WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        const userAccount = results[0];
        db.query("SELECT * FROM users WHERE email = ?", [userAccount.email], (err2, profiles) => {
            if (profiles.length > 0) {
                res.json({ ...profiles[0], id: userAccount.id });
            } else {
                res.json({ 
                    id: userAccount.id, email: userAccount.email, username: userAccount.username, 
                    nama_lengkap: userAccount.username, status_pendaftaran: 'Belum', 
                    asal_sekolah: '-', no_ujian: '-' 
                });
            }
        });
    });
});

app.post('/api/register', upload.fields([
    { name: 'pasFoto', maxCount: 1 },
    { name: 'raport1', maxCount: 1 },
    { name: 'sertifikat1', maxCount: 1 }
]), (req, res) => {
    const { 
        email, namaLengkap, noTelp, tglLahir, tempatLahir, jenisKelamin, nik, nisn, agama, asalSekolah, alamatRumah,
        namaAyah, pekerjaanAyah, namaIbu, pekerjaanIbu,
        nilaiMatematika, nilaiBhsIndonesia, nilaiIpa, nilaiBhsInggris
    } = req.body;

    const pasFoto = req.files?.['pasFoto'] ? req.files['pasFoto'][0].filename : null;
    const fileRaport = req.files?.['raport1'] ? req.files['raport1'][0].filename : null;
    const fileSertifikat = req.files?.['sertifikat1'] ? req.files['sertifikat1'][0].filename : null;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if(err) return res.status(500).json({message: "Database Error", error: err});

        if(results.length > 0) {
            let sql = `UPDATE users SET 
                nama_lengkap=?, no_telepon=?, tanggal_lahir=?, tempat_lahir=?, jenis_kelamin=?, nik=?, nisn=?, agama=?, asal_sekolah=?, alamat_rumah=?,
                nama_ayah=?, pekerjaan_ayah=?, nama_ibu=?, pekerjaan_ibu=?,
                nilai_matematika=?, nilai_bhs_indonesia=?, nilai_ipa=?, nilai_bhs_inggris=?,
                status_pendaftaran='Menunggu'`; 
            
            const params = [
                namaLengkap, noTelp, tglLahir, tempatLahir, jenisKelamin, nik, nisn, agama, asalSekolah, alamatRumah,
                namaAyah, pekerjaanAyah, namaIbu, pekerjaanIbu,
                nilaiMatematika, nilaiBhsIndonesia, nilaiIpa, nilaiBhsInggris
            ];

            if (pasFoto) { sql += `, pas_foto=?`; params.push(pasFoto); }
            if (fileRaport) { sql += `, file_raport=?`; params.push(fileRaport); }
            if (fileSertifikat) { sql += `, file_sertifikat=?`; params.push(fileSertifikat); }

            sql += ` WHERE email=?`;
            params.push(email);

            db.query(sql, params, (errUpdate) => {
                if (errUpdate) return res.status(500).json({ message: "Gagal update data", error: errUpdate });
                res.status(200).json({ message: "Data Berhasil Diperbarui" });
            });

        } else {
            checkRegistrationOpen(res, () => {
                const sql = `INSERT INTO users (
                    email, nama_lengkap, no_telepon, tanggal_lahir, tempat_lahir, jenis_kelamin, nik, nisn, agama, asal_sekolah, alamat_rumah,
                    nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu,
                    nilai_matematika, nilai_bhs_indonesia, nilai_ipa, nilai_bhs_inggris,
                    pas_foto, file_raport, file_sertifikat, status_pendaftaran
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')`;

                const params = [
                    email, namaLengkap, noTelp, tglLahir, tempatLahir, jenisKelamin, nik, nisn, agama, asalSekolah, alamatRumah,
                    namaAyah, pekerjaanAyah, namaIbu, pekerjaanIbu,
                    nilaiMatematika, nilaiBhsIndonesia, nilaiIpa, nilaiBhsInggris,
                    pasFoto, fileRaport, fileSertifikat
                ];

                db.query(sql, params, (errInsert) => {
                    if (errInsert) return res.status(500).json({ message: "Gagal menyimpan data baru", error: errInsert });
                    res.status(200).json({ message: "Data Berhasil Disimpan" });
                });
            });
        }
    });
});

app.get('/api/users', (req, res) => {
    db.query("SELECT * FROM users ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query("UPDATE users SET status_pendaftaran = ? WHERE id = ?", [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Status berhasil diperbarui" });
    });
});

app.get('/api/settings/registration-status', (req, res) => {
    db.query("SELECT value FROM settings WHERE `key` = 'registration_status'", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const status = results.length > 0 ? results[0].value : 'closed';
        res.json({ status });
    });
});

app.put('/api/settings/registration-status', (req, res) => {
    const { status } = req.body; 
    const sql = "UPDATE settings SET value = ? WHERE `key` = 'registration_status'";
    db.query(sql, [status], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Status pendaftaran diperbarui!" });
    });
});

app.get('/api/prestasi', (req, res) => {
    db.query("SELECT * FROM prestasi ORDER BY tanggal DESC", (err, results) => res.json(err ? [] : results));
});

app.post('/api/prestasi', upload.single('gambar'), (req, res) => {
    const { judul, deskripsi, tanggal, penyelenggara } = req.body;
    const gambar = req.file ? req.file.filename : null;
    db.query("INSERT INTO prestasi (judul, deskripsi, tanggal, penyelenggara, gambar) VALUES (?, ?, ?, ?, ?)", [judul, deskripsi, tanggal, penyelenggara, gambar], (err) => {
        if(err) return res.status(500).json({error: err.message});
        res.status(201).json({message: "Berhasil"});
    });
});

app.put('/api/prestasi/:id', upload.single('gambar'), (req, res) => {
    const { id } = req.params;
    const { judul, deskripsi, tanggal, penyelenggara } = req.body;
    let sql = "UPDATE prestasi SET judul=?, deskripsi=?, tanggal=?, penyelenggara=? WHERE id=?";
    let params = [judul, deskripsi, tanggal, penyelenggara, id];
    
    if (req.file) {
        sql = "UPDATE prestasi SET judul=?, deskripsi=?, tanggal=?, penyelenggara=?, gambar=? WHERE id=?";
        params = [judul, deskripsi, tanggal, penyelenggara, req.file.filename, id];
    }
    db.query(sql, params, (err) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({message: "Updated"});
    });
});

app.delete('/api/prestasi/:id', (req, res) => {
    db.query("DELETE FROM prestasi WHERE id = ?", [req.params.id], (err) => res.json({message: "Dihapus"}));
});

app.get('/api/pengumuman', (req, res) => {
    db.query("SELECT * FROM pengumuman ORDER BY tanggal DESC", (err, results) => res.json(err ? [] : results));
});

app.post('/api/pengumuman', upload.array('files_pdf', 10), (req, res) => {
    const { judul, isi, tanggal } = req.body;
    const files = req.files ? req.files.map(f => f.filename) : [];
    const filesJson = JSON.stringify(files); 

    db.query("INSERT INTO pengumuman (judul, isi, tanggal, file_pdf) VALUES (?, ?, ?, ?)", [judul, isi, tanggal, filesJson], (err) => {
        if(err) return res.status(500).json({error: err.message});
        res.status(201).json({message: "Berhasil"});
    });
});

app.put('/api/pengumuman/:id', upload.array('files_pdf', 10), (req, res) => {
    const { id } = req.params;
    const { judul, isi, tanggal } = req.body;
    let sql = "UPDATE pengumuman SET judul=?, isi=?, tanggal=? WHERE id=?";
    let params = [judul, isi, tanggal, id];

    if (req.files && req.files.length > 0) {
        const files = req.files.map(f => f.filename);
        const filesJson = JSON.stringify(files);
        sql = "UPDATE pengumuman SET judul=?, isi=?, tanggal=?, file_pdf=? WHERE id=?";
        params = [judul, isi, tanggal, filesJson, id];
    }
    db.query(sql, params, (err) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({message: "Updated"});
    });
});

app.delete('/api/pengumuman/:id', (req, res) => {
    db.query("DELETE FROM pengumuman WHERE id = ?", [req.params.id], (err) => res.json({message: "Dihapus"}));
});

// ==========================================
//  PERBAIKAN FITUR SEARCH SCHOOL (REMOVE PLUS CODE) 
// ==========================================
app.get('/api/search-school', async (req, res) => {
    const { query } = req.query; 
    
    if (!query || query.length < 3) return res.json([]); 

    try {
        console.log(`🔍 Searching SerpApi for: ${query}`); 

        const response = await axios.get('https://serpapi.com/search.json', {
            params: { 
                engine: 'google_maps', 
                q: `SMP ${query}`, 
                google_domain: 'google.co.id', 
                hl: 'id', 
                gl: 'id', 
                type: 'search', 
                api_key: SERPAPI_KEY 
            }
        });

        if (response.data.error) {
            console.error("❌ SerpApi Error Response:", response.data.error);
            return res.json([]);
        }

        const results = response.data.local_results || [];
        
        const cleanResults = results.map(place => {
            let cleanAddress = place.address || '';

            //  LOGIKA PENGHAPUSAN PLUS CODE 
            // Regex ini mencari pola kode di awal string (misal: "7VG9+WM4, ") dan menghapusnya
            // Penjelasan Regex: 
            // ^ = awal kalimat
            // [A-Z0-9+]+ = kombinasi huruf besar, angka, dan tanda plus
            // \s*,\s* = diikuti spasi (opsional), koma, dan spasi lagi
            cleanAddress = cleanAddress.replace(/^[A-Z0-9]+\+[A-Z0-9]+\s*,\s*/, '');

            return { 
                value: place.title,       
                address: cleanAddress    
            };
        }).filter(item => item.value && item.address); 

        console.log(`✅ Found ${cleanResults.length} schools for query '${query}'`);
        res.json(cleanResults);

    } catch (error) { 
        console.error("❌ API Search Error:", error.response?.data || error.message);
        res.json([]); 
    }
});

if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server berjalan di port ${PORT}...`));
}

export default app;