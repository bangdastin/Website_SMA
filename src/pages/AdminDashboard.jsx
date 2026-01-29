import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Import Library Excel
import { 
  Users, LogOut, Bell, Search, School, RefreshCw, Loader2, Check, X, AlertTriangle, 
  Trophy, Megaphone, Plus, Trash2, Calendar, Edit, FileText, Download, Eye, Phone, Lock, Unlock,
  FileSpreadsheet 
} from 'lucide-react';
import Footer from '../Footer'; 

// =================================================================
// 1. CONFIGURATION & UTILITIES
// =================================================================

const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
const hostname = window.location.hostname;
export const API_BASE_URL = (hostname === 'localhost') 
  ? "http://localhost:5000" 
  : (hostname.includes('vercel.app')) 
    ? PROD_URL 
    : `http://${hostname}:5000`;
    
/**
 * Fungsi Helper untuk Generate HTML PDF Siswa
 */
const generateStudentPDF = (user) => {
    const printWindow = window.open('', '', 'height=800,width=800');
    
    const parseNilai = (jsonStr) => { try { return JSON.parse(jsonStr) || {}; } catch (e) { return {}; } };
    
    const nilaiMtk = parseNilai(user.nilai_matematika);
    const nilaiInd = parseNilai(user.nilai_bhs_indonesia);
    const nilaiIpa = parseNilai(user.nilai_ipa);
    const nilaiIng = parseNilai(user.nilai_bhs_inggris);

    const fileRaport = user.raport1 || user.file_raport || null;
    const fileSertifikat = user.sertifikat1 || user.file_sertifikat || null;

    const linkRaport = fileRaport ? `${API_BASE_URL}/uploads/${fileRaport}` : null;
    const linkSertifikat = fileSertifikat ? `${API_BASE_URL}/uploads/${fileSertifikat}` : null;

    const htmlContent = `
        <html>
        <head>
            <title>Formulir Pendaftaran - ${user.nama_lengkap}</title>
            <style>
                body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
                .header { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; }
                .header img { height: 80px; float: left; }
                .header h3, .header h2, .header h1, .header p { margin: 2px; }
                .title { text-align: center; font-weight: bold; margin-bottom: 20px; text-decoration: underline; font-size: 18px; }
                .section { margin-bottom: 20px; }
                .label { width: 180px; display: inline-block; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
                th, td { border: 1px solid black; padding: 6px; text-align: center; }
                .text-left { text-align: left; }
                .photo-box { width: 113px; height: 151px; border: 1px solid black; display: flex; align-items: center; justify-content: center; background: #f0f0f0; }
                .photo-box img { width: 100%; height: 100%; object-fit: cover; }
                .print-btn { position: fixed; top: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; z-index: 999; }
                .file-link { color: blue; text-decoration: underline; font-weight: bold; cursor: pointer; }

                @media print { 
                    .print-btn { display: none; } 
                    .file-link { text-decoration: none; color: black; pointer-events: none; }
                    .file-link::after { content: " (File Tersimpan di Server)"; font-size: 11px; color: #555; }
                }
            </style>
        </head>
        <body>
            <button class="print-btn" onclick="window.print()">🖨️ Cetak Formulir</button>
            <div class="header">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Coat_of_arms_of_North_Sumatra.svg/1200px-Coat_of_arms_of_North_Sumatra.svg.png" alt="Logo">
                <h3>PEMERINTAH PROVINSI SUMATERA UTARA</h3>
                <h2>DINAS PENDIDIKAN</h2>
                <h1>SMA NEGERI 2 LINTONGNIHUTA</h1>
                <p>Jalan Letjend. TB. Simatupang, Desa Siponjot</p>
            </div>
            <div class="title">FORMULIR PENDAFTARAN SISWA BARU</div>
            <div class="section">
                <p><strong>A. IDENTITAS PRIBADI</strong></p>
                <div><span class="label">Nama Lengkap</span>: ${user.nama_lengkap || '-'}</div>
                <div><span class="label">NISN</span>: ${user.nisn || '-'}</div>
                <div><span class="label">NIK</span>: ${user.nik || '-'}</div>
                <div><span class="label">TTL</span>: ${user.tempat_lahir || '-'}, ${user.tanggal_lahir ? new Date(user.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</div>
                <div><span class="label">Jenis Kelamin</span>: ${user.jenis_kelamin || '-'}</div>
                <div><span class="label">Agama</span>: ${user.agama || '-'}</div>
                <div><span class="label">Asal Sekolah</span>: ${user.asal_sekolah || '-'}</div>
                <div><span class="label">Alamat</span>: ${user.alamat_rumah || '-'}</div>
            </div>
            <div class="section">
                <p><strong>B. DATA ORANG TUA</strong></p>
                <div><span class="label">Nama Ayah</span>: ${user.nama_ayah || '-'}</div>
                <div><span class="label">Pekerjaan Ayah</span>: ${user.pekerjaan_ayah || '-'}</div>
                <div><span class="label">Nama Ibu</span>: ${user.nama_ibu || '-'}</div>
                <div><span class="label">Pekerjaan Ibu</span>: ${user.pekerjaan_ibu || '-'}</div>
                <div><span class="label">No. Telepon</span>: ${user.no_telepon || '-'}</div>
            </div>
            <div class="section">
                <p><strong>C. DATA NILAI RAPORT</strong></p>
                <table>
                    <thead><tr><th>Mata Pelajaran</th><th>Sem 1</th><th>Sem 2</th><th>Sem 3</th><th>Sem 4</th><th>Sem 5</th></tr></thead>
                    <tbody>
                        <tr><td class="text-left">Matematika</td><td>${nilaiMtk.sem1||'-'}</td><td>${nilaiMtk.sem2||'-'}</td><td>${nilaiMtk.sem3||'-'}</td><td>${nilaiMtk.sem4||'-'}</td><td>${nilaiMtk.sem5||'-'}</td></tr>
                        <tr><td class="text-left">Bhs. Indonesia</td><td>${nilaiInd.sem1||'-'}</td><td>${nilaiInd.sem2||'-'}</td><td>${nilaiInd.sem3||'-'}</td><td>${nilaiInd.sem4||'-'}</td><td>${nilaiInd.sem5||'-'}</td></tr>
                        <tr><td class="text-left">IPA</td><td>${nilaiIpa.sem1||'-'}</td><td>${nilaiIpa.sem2||'-'}</td><td>${nilaiIpa.sem3||'-'}</td><td>${nilaiIpa.sem4||'-'}</td><td>${nilaiIpa.sem5||'-'}</td></tr>
                        <tr><td class="text-left">Bhs. Inggris</td><td>${nilaiIng.sem1||'-'}</td><td>${nilaiIng.sem2||'-'}</td><td>${nilaiIng.sem3||'-'}</td><td>${nilaiIng.sem4||'-'}</td><td>${nilaiIng.sem5||'-'}</td></tr>
                    </tbody>
                </table>
            </div>
             <div class="section">
                <p><strong>D. LAMPIRAN DOKUMEN (PDF)</strong></p>
                <table style="border: none; margin-top:0;">
                     <tr style="border: none;">
                        <td style="border: 1px solid #000; text-align: left; padding: 10px; width: 50%;">
                            <strong>1. File Raport (Semester 1-5)</strong><br/><br/>
                            ${linkRaport ? `<a href="${linkRaport}" target="_blank" class="file-link">📄 Buka/Download File Raport</a>` : '<span style="color: red; font-style: italic;">Tidak ada file diupload</span>'}
                        </td>
                        <td style="border: 1px solid #000; text-align: left; padding: 10px; width: 50%;">
                            <strong>2. Sertifikat Pendukung</strong><br/><br/>
                             ${linkSertifikat ? `<a href="${linkSertifikat}" target="_blank" class="file-link">📄 Buka/Download Sertifikat</a>` : '<span style="color: gray; font-style: italic;">Tidak ada sertifikat</span>'}
                        </td>
                     </tr>
                </table>
            </div>
            <div class="section" style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px;">
                <div>
                    <p><strong>Pas Foto:</strong></p>
                    <div class="photo-box">
                        ${user.pas_foto ? `<img src="${API_BASE_URL}/uploads/${user.pas_foto}" />` : 'Tidak Ada Foto'}
                    </div>
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <p>Lintongnihuta, ${new Date().toLocaleDateString('id-ID', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                    <br><br><br>
                    <p style="border-bottom: 1px solid black; display: inline-block; min-width: 200px;">(${user.nama_lengkap || '.......................'})</p>
                    <p>Tanda Tangan Peserta</p>
                </div>
            </div>
        </body>
        </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

// =================================================================
// 2. SUB-COMPONENTS
// =================================================================

const CustomAlert = ({ isOpen, type, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  const isConfirm = type === 'confirm';
  const isSuccess = type === 'success';
  const isError = type === 'error';
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : isError ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
          {isSuccess ? <Check size={32} /> : isError ? <X size={32} /> : <AlertTriangle size={32} />}
        </div>
        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-slate-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          {isConfirm && (<button onClick={onCancel} disabled={isLoading} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Batal</button>)}
          <button onClick={onConfirm} disabled={isLoading} className={`flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSuccess ? 'bg-green-600 hover:bg-green-700' : isError ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isConfirm ? 'Ya, Lanjutkan' : 'Tutup')}
          </button>
        </div>
      </div>
    </div>
  );
};

const PrestasiManager = ({ showAlert }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ judul: '', deskripsi: '', tanggal: '', penyelenggara: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/prestasi`);
      if (res.ok) setDataList(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('gambar', imageFile);

    try {
      let url = isEditing ? `${API_BASE_URL}/api/prestasi/${editId}` : `${API_BASE_URL}/api/prestasi`;
      let method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showAlert('success', 'Berhasil', isEditing ? 'Prestasi diperbarui' : 'Prestasi ditambahkan');
        resetForm(); fetchData();
      } else { showAlert('error', 'Gagal', 'Terjadi kesalahan server'); }
    } catch (err) { showAlert('error', 'Error', 'Gagal koneksi server'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = (id) => {
    showAlert('confirm', 'Hapus Prestasi?', 'Data akan dihapus permanen.', async () => {
      try {
        await fetch(`${API_BASE_URL}/api/prestasi/${id}`, { method: 'DELETE' });
        showAlert('success', 'Terhapus', 'Data telah dihapus.'); fetchData();
      } catch (err) { showAlert('error', 'Error', 'Gagal menghapus data.'); }
    });
  };

  const handleEdit = (item) => {
    setFormData({ judul: item.judul, deskripsi: item.deskripsi, tanggal: item.tanggal.split('T')[0], penyelenggara: item.penyelenggara });
    setEditId(item.id); setIsEditing(true); setShowForm(true); setImageFile(null);
  };

  const resetForm = () => {
    setFormData({ judul: '', deskripsi: '', tanggal: '', penyelenggara: '' });
    setImageFile(null); setIsEditing(false); setEditId(null); setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Trophy className="text-yellow-500" size={24}/> Daftar Prestasi</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
          {showForm ? <X size={18}/> : <Plus size={18}/>} {showForm ? 'Tutup Form' : 'Tambah'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" className="p-2 border rounded-lg" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} placeholder="Judul Prestasi..." />
            <input required type="date" className="p-2 border rounded-lg" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} />
            <input required type="text" className="p-2 border rounded-lg" value={formData.penyelenggara} onChange={e=>setFormData({...formData, penyelenggara: e.target.value})} placeholder="Penyelenggara..." />
            <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files[0])} className="p-2 border rounded-lg bg-white" />
            <textarea required className="md:col-span-2 p-2 border rounded-lg h-24" value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} placeholder="Deskripsi..."></textarea>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg">Batal</button>
            <button disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-yellow-50 text-yellow-800 font-bold uppercase text-xs">
            <tr><th className="p-4">No</th><th className="p-4">Judul</th><th className="p-4">Tanggal</th><th className="p-4">Gambar</th><th className="p-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="p-8 text-center">Memuat...</td></tr> : dataList.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">{idx + 1}</td>
                <td className="p-4 font-bold">{item.judul}<div className="text-xs font-normal text-slate-400">{item.penyelenggara}</div></td>
                <td className="p-4">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                <td className="p-4">{item.gambar ? <div className="w-16 h-10 border rounded overflow-hidden"><img src={`${API_BASE_URL}/uploads/${item.gambar}`} className="w-full h-full object-cover" alt="img"/></div> : '-'}</td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PengumumanManager = ({ showAlert }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ judul: '', isi: '', tanggal: '' });
  const [pdfFiles, setPdfFiles] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengumuman`);
      if (res.ok) setDataList(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    let hasError = false;
    for (let file of files) {
      if (file.size > 2 * 1024 * 1024) { 
         showAlert('error', 'File Terlalu Besar', `File ${file.name} melebihi 2MB.`);
         hasError = true;
         continue; 
      }
      validFiles.push(file);
    }
    if (hasError) e.target.value = null; 
    setPdfFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('judul', formData.judul); data.append('isi', formData.isi); data.append('tanggal', formData.tanggal);
    if (pdfFiles.length > 0) {
        pdfFiles.forEach(file => data.append('files_pdf', file));
    }
    try {
      let url = isEditing ? `${API_BASE_URL}/api/pengumuman/${editId}` : `${API_BASE_URL}/api/pengumuman`;
      let method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showAlert('success', 'Berhasil', isEditing ? 'Pengumuman diperbarui' : 'Pengumuman ditambahkan');
        resetForm(); fetchData();
      } else { showAlert('error', 'Gagal', 'Terjadi kesalahan server'); }
    } catch (err) { showAlert('error', 'Error', 'Gagal koneksi server'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = (id) => {
    showAlert('confirm', 'Hapus Pengumuman?', 'Data akan dihapus permanen.', async () => {
      try {
        await fetch(`${API_BASE_URL}/api/pengumuman/${id}`, { method: 'DELETE' });
        showAlert('success', 'Terhapus', 'Data telah dihapus.'); fetchData();
      } catch (err) { showAlert('error', 'Error', 'Gagal menghapus data.'); }
    });
  };

  const handleEdit = (item) => {
    setFormData({ judul: item.judul, isi: item.isi, tanggal: item.tanggal.split('T')[0] });
    setEditId(item.id); setIsEditing(true); setShowForm(true); setPdfFiles([]); 
  };

  const resetForm = () => {
    setFormData({ judul: '', isi: '', tanggal: '' });
    setPdfFiles([]); setIsEditing(false); setEditId(null); setShowForm(false);
  };

  const parseFiles = (fileString) => {
      if (!fileString) return []; 
      try {
          const parsed = JSON.parse(fileString);
          return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
          return fileString ? [fileString] : [];
      }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Megaphone className="text-blue-500" size={24}/> Daftar Pengumuman</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
          {showForm ? <X size={18}/> : <Plus size={18}/>} {showForm ? 'Tutup' : 'Tambah'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input required type="text" className="p-2 border rounded-lg" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} placeholder="Judul Pengumuman..." />
               <input required type="date" className="p-2 border rounded-lg" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} />
            </div>
            <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File PDF (Bisa Banyak, Opsional)</label>
                <input type="file" multiple accept="application/pdf" onChange={handleFileChange} className="w-full p-2 border rounded-lg bg-white text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Maks 2MB per file. Format .pdf</p>
                {pdfFiles.length > 0 && (
                    <div className="mt-2 text-sm text-slate-600">
                        <p className="font-semibold">File terpilih:</p>
                        <ul className="list-disc list-inside">
                            {pdfFiles.map((f, i) => <li key={i}>{f.name}</li>)}
                        </ul>
                    </div>
                )}
            </div>
            <textarea required className="p-2 border rounded-lg h-32" value={formData.isi} onChange={e=>setFormData({...formData, isi: e.target.value})} placeholder="Isi pengumuman lengkap..."></textarea>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg">Batal</button>
            <button disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {loading ? <p className="text-center text-slate-400">Memuat data...</p> : dataList.length === 0 ? <p className="text-center text-slate-400">Belum ada pengumuman.</p> : 
          dataList.map(item => {
            const files = parseFiles(item.file_pdf); 
            return (
            <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-blue-200 transition-colors flex justify-between items-start group">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg">{item.judul}</h4>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Calendar size={10}/> {new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.isi}</p>
                    {files.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {files.map((file, idx) => (
                                <a key={idx} href={`${API_BASE_URL}/uploads/${file}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                                    <FileText size={16} className="text-red-500"/><span className="font-medium">Lampiran {idx + 1}</span><Download size={14} className="ml-1 opacity-50"/>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"><Trash2 size={16}/></button>
                </div>
            </div>
            );
          })}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, activeMenu, setActiveMenu, handleLogout }) => {
  const menus = [ { id: 'pendaftar', name: "Data Pendaftar", icon: Users }, { id: 'prestasi', name: "Prestasi", icon: Trophy }, { id: 'pengumuman', name: "Pengumuman", icon: Megaphone } ];
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-blue-100 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'} hidden md:block`}>
      <div className="flex items-center justify-center h-16 border-b border-blue-50"><div className="bg-blue-600 p-2 rounded-lg"><School className="text-white w-6 h-6" /></div>{isOpen && <span className="ml-3 font-bold text-xl text-blue-900">Admin PPDB</span>}</div>
      <nav className="p-4 space-y-2">{menus.map((menu) => (<button key={menu.id} onClick={() => setActiveMenu(menu.id)} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === menu.id ? 'bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}><menu.icon size={20} />{isOpen && <span className="ml-3">{menu.name}</span>}</button>))}</nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-blue-50"><button onClick={handleLogout} className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-lg"><LogOut size={20} />{isOpen && <span className="ml-3">Keluar</span>}</button></div>
    </aside>
  );
};

const Header = ({ searchTerm, setSearchTerm, userCount }) => (
  <header className="bg-white h-16 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
    <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full w-96"><Search size={18} className="text-blue-400" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari data..." className="bg-transparent border-none outline-none ml-2 text-sm w-full" /></div>
    <div className="flex items-center gap-6">
      <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500"><Bell size={20} />{userCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}</button>
      <div className="flex items-center gap-3 pl-6 border-l border-slate-200"><div className="text-right hidden md:block"><p className="text-sm font-semibold text-slate-700">Admin</p><p className="text-xs text-slate-500">Panitia</p></div><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">AS</div></div>
    </div>
  </header>
);

// =================================================================
// 3. MAIN DASHBOARD COMPONENT
// =================================================================

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('pendaftar'); 
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State: Access Control
  const [regStatus, setRegStatus] = useState('open'); 
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // State: Alert
  const [alertState, setAlertState] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertState({ isOpen: true, type, title, message, onConfirm: () => { if(onConfirm) onConfirm(); setAlertState(prev => ({...prev, isOpen: false})); }});
  };
  const closeAlert = () => setAlertState(prev => ({...prev, isOpen: false}));

  // --- API CALLS ---
  const fetchRegStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/registration-status`);
      const data = await res.json();
      setRegStatus(data.status);
    } catch (err) { console.error("Gagal ambil status pendaftaran:", err); }
  };

  const fetchPendaftar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (res.ok) setPendaftar(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { 
    if(activeMenu === 'pendaftar') {
        fetchPendaftar();
        fetchRegStatus(); 
    } 
  }, [activeMenu]);

  // --- HANDLERS ---
  
  // Fungsi Export to Excel (.xlsx) - STATUS DIHAPUS
  const downloadExcel = () => {
    const parseNilai = (jsonStr) => { try { return JSON.parse(jsonStr) || {}; } catch (e) { return {}; } };
    
    // Siapkan Data untuk Excel (Tanpa Status)
    const worksheetData = pendaftar.map((user, index) => {
      const mtk = parseNilai(user.nilai_matematika);
      const ind = parseNilai(user.nilai_bhs_indonesia);
      const ipa = parseNilai(user.nilai_ipa);
      const ing = parseNilai(user.nilai_bhs_inggris);

      return {
        "No": index + 1,
        "Nama Lengkap": user.nama_lengkap,
        "NISN": user.nisn,
        "NIK": user.nik,
        "Tempat Lahir": user.tempat_lahir,
        "Tanggal Lahir": user.tanggal_lahir ? new Date(user.tanggal_lahir).toLocaleDateString('id-ID') : '',
        "Jenis Kelamin": user.jenis_kelamin,
        "Agama": user.agama,
        "Asal Sekolah": user.asal_sekolah,
        "Alamat": user.alamat_rumah,
        "No Telepon": user.no_telepon,
        "Email": user.email,
        "Nama Ayah": user.nama_ayah,
        "Pekerjaan Ayah": user.pekerjaan_ayah,
        "Nama Ibu": user.nama_ibu,
        "Pekerjaan Ibu": user.pekerjaan_ibu,
        
        // Nilai
        "Mtk Sem 1": mtk.sem1, "Mtk Sem 2": mtk.sem2, "Mtk Sem 3": mtk.sem3, "Mtk Sem 4": mtk.sem4, "Mtk Sem 5": mtk.sem5,
        "B.Indo Sem 1": ind.sem1, "B.Indo Sem 2": ind.sem2, "B.Indo Sem 3": ind.sem3, "B.Indo Sem 4": ind.sem4, "B.Indo Sem 5": ind.sem5,
        "IPA Sem 1": ipa.sem1, "IPA Sem 2": ipa.sem2, "IPA Sem 3": ipa.sem3, "IPA Sem 4": ipa.sem4, "IPA Sem 5": ipa.sem5,
        "B.Inggris Sem 1": ing.sem1, "B.Inggris Sem 2": ing.sem2, "B.Inggris Sem 3": ing.sem3, "B.Inggris Sem 4": ing.sem4, "B.Inggris Sem 5": ing.sem5
      };
    });

    // Buat Workbook dan Worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Auto-width columns (Opsional - agar rapi)
    const wscols = Object.keys(worksheetData[0] || {}).map(() => ({ wch: 20 }));
    worksheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    
    // Download File
    XLSX.writeFile(workbook, `Data_Pendaftar_PPDB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleToggleRegistration = (currentStatus) => {
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
    const actionText = nextStatus === 'open' ? 'MEMBUKA' : 'MENUTUP';
    
    showAlert('confirm', 'Ubah Akses Pendaftaran?', `Anda akan ${actionText} akses pendaftaran bagi calon siswa baru.`, async () => {
      setIsUpdatingStatus(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings/registration-status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (res.ok) {
          setRegStatus(nextStatus);
          showAlert('success', 'Berhasil', `Pendaftaran kini telah ${nextStatus === 'open' ? 'Dibuka' : 'Ditutup'}.`);
        }
      } catch (err) { showAlert('error', 'Error', "Gagal menghubungi server"); }
      finally { setIsUpdatingStatus(false); }
    });
  };

  const handleStatusChange = (user, status) => {
    showAlert('confirm', 'Konfirmasi', `Ubah status ${user.nama_lengkap} menjadi ${status}?`, async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setPendaftar(prev => prev.map(u => u.id === user.id ? { ...u, status_pendaftaran: status } : u));
                showAlert('success', 'Berhasil', `Status diubah ke ${status}`);
            }
        } catch (error) { showAlert('error', 'Error', "Gagal koneksi server"); }
    });
  };

  const filteredPendaftar = pendaftar.filter(item => {
    const term = searchTerm.toLowerCase();
    return (item.nama_lengkap || '').toLowerCase().includes(term) || (item.asal_sekolah || '').toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      <CustomAlert {...alertState} onCancel={closeAlert} />
      <Sidebar isOpen={true} activeMenu={activeMenu} setActiveMenu={setActiveMenu} handleLogout={() => { localStorage.removeItem('userApp'); window.location.href='/'; }} />
      <main className="flex-1 flex flex-col md:ml-64 transition-all">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} userCount={pendaftar.length} />
        <div className="p-8 flex-1">
          {activeMenu === 'pendaftar' && (
            <>
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Data Pendaftar</h1>
                        <p className="text-slate-500">Total: <span className="font-bold text-blue-600">{pendaftar.length}</span> Siswa</p>
                    </div>
                    <div className="bg-white border rounded-xl p-3 shadow-sm flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${regStatus === 'open' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {regStatus === 'open' ? <Unlock size={20} /> : <Lock size={20} />}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Status Pendaftaran</p>
                            <p className={`text-sm font-bold ${regStatus === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                                {regStatus === 'open' ? 'DIBUKA' : 'DITUTUP'}
                            </p>
                        </div>
                        <button disabled={isUpdatingStatus} onClick={() => handleToggleRegistration(regStatus)} className={`ml-4 px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${regStatus === 'open' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {isUpdatingStatus ? <Loader2 size={14} className="animate-spin" /> : (regStatus === 'open' ? 'Tutup Pendaftaran' : 'Buka Pendaftaran')}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={downloadExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors shadow-sm">
                             <FileSpreadsheet size={18} /> Export Excel
                        </button>
                        <button onClick={fetchPendaftar} className="bg-white border hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-slate-600"><RefreshCw size={16} /> Refresh</button>
                    </div>
                </div>
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-blue-50 text-blue-900 font-semibold">
                            <tr>
                                <th className="p-4">No</th>
                                <th className="p-4">Nama</th>
                                <th className="p-4">Asal Sekolah</th>
                                <th className="p-4 text-center">Formulir PDF</th> 
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? <tr><td colSpan="6" className="p-8 text-center">Memuat...</td></tr> : filteredPendaftar.map((item, i) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-4">{i + 1}</td>
                                <td className="p-4 font-bold">{item.nama_lengkap || item.username}<div className="text-xs font-normal text-slate-400 flex items-center gap-1"><Phone size={10}/> {item.no_telepon || '-'}</div></td>
                                <td className="p-4">{item.asal_sekolah || '-'}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => generateStudentPDF(item)} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors text-xs font-bold" title="Lihat Formulir Lengkap">
                                        <Eye size={14} /> Lihat Formulir
                                    </button>
                                </td>
                                <td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-xs border ${item.status_pendaftaran === 'Diterima' ? 'bg-green-50 text-green-700 border-green-200' : item.status_pendaftaran === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{item.status_pendaftaran || 'Menunggu'}</span></td>
                                <td className="p-4 text-center flex justify-center gap-2">
                                    <button onClick={() => handleStatusChange(item, 'Diterima')} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Terima"><Check size={16}/></button>
                                    <button onClick={() => handleStatusChange(item, 'Ditolak')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Tolak"><X size={16}/></button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </>
          )}
          {activeMenu === 'prestasi' && <PrestasiManager showAlert={showAlert} />}
          {activeMenu === 'pengumuman' && <PengumumanManager showAlert={showAlert} />}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AdminDashboard;