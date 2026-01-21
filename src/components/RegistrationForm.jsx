import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, School, MapPin, Calendar, Send, CheckCircle2, 
  AlertCircle, Loader2, Lock, Home, Camera, UploadCloud, FileText, 
  X, Eye, Trash2 // Import icon tambahan
} from 'lucide-react';

// --- KOMPONEN POPUP VALIDASI ---
const ValidationModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center transform scale-100 transition-all">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Peringatan</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95"
        >
          OK, Mengerti
        </button>
      </div>
    </div>
  );
};

const RegistrationForm = ({ onSuccess, onGoHome, userData }) => {
  // --- STATE DATA PRIBADI & RAPORT ---
  const [formData, setFormData] = useState({
    namaLengkap: '', nisn: '', tempatLahir: '', tglLahir: '', jenisKelamin: '', 
    nik: '', asalSekolah: '', agama: '', namaAyah: '', pekerjaanAyah: '', 
    namaIbu: '', pekerjaanIbu: '', noTelp: '', alamatRumah: '', email: '',
    nilaiMatematika: { sem1: '', sem2: '', sem3: '', sem4: '', sem5: '' },
    nilaiBhsIndonesia: { sem1: '', sem2: '', sem3: '', sem4: '', sem5: '' },
    nilaiIpa: { sem1: '', sem2: '', sem3: '', sem4: '', sem5: '' },
    nilaiBhsInggris: { sem1: '', sem2: '', sem3: '', sem4: '', sem5: '' },
  });

  // --- STATE FILE UPLOAD ---
  const [files, setFiles] = useState({
    pasFoto: null,         
    raport1: null,         
    sertifikat1: null      
  });
  
  const [fotoPreview, setFotoPreview] = useState(null);

  // --- STATE VALIDASI & LAINNYA ---
  const [validationMessage, setValidationMessage] = useState(""); 
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false); 
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null); 
  
  const LOCAL_URL = "http://localhost:5000";
  const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
  const API_BASE_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PROD_URL; 

  const today = new Date();
  const minBirthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
  const minDateStr = minBirthDate.toISOString().split('T')[0];
  const maxBirthDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
  const maxDateStr = maxBirthDate.toISOString().split('T')[0];

  const showError = (msg) => {
    setValidationMessage(msg);
    setShowValidationModal(true);
  };

  useEffect(() => {
    if (userData?.email) setFormData(prev => ({ ...prev, email: userData.email }));
    if (userData && (userData.status === 'Menunggu' || userData.status === 'Diterima' || userData.status === 'Ditolak')) {
        setIsAlreadyRegistered(true); setIsSubmitted(true); 
        setFormData(prev => ({ ...prev, namaLengkap: userData.nama || '', asalSekolah: userData.asalSekolah || '' }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tglLahir') {
        const selectedDate = new Date(value);
        if (selectedDate < minBirthDate) { showError("Mohon maaf, umur maksimal pendaftar adalah 17 tahun."); return; }
    }
    if (name === 'nik') {
        if (value !== '' && !/^\d+$/.test(value)) { showError("NIK hanya boleh berisi angka (0-9)."); return; }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'asalSekolah') setShowSuggestions(true); 
  };

  const handleNilaiChange = (subject, semester, value) => {
      if (value === '') { setFormData(prev => ({ ...prev, [subject]: { ...prev[subject], [semester]: value } })); return; }
      const regex = /^\d+([.,]\d{0,2})?$/;
      if (!regex.test(value)) {
          if (value.includes('.') || value.includes(',')) showError("Format salah! Maksimal 2 digit di belakang koma.");
          else showError("Input hanya boleh berupa angka.");
          return;
      }
      const normalizedValue = parseFloat(value.replace(',', '.'));
      if (normalizedValue > 100) { showError("Nilai tidak boleh lebih dari 100."); return; }
      setFormData(prev => ({ ...prev, [subject]: { ...prev[subject], [semester]: value } }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (fileType === 'pasFoto') {
        if (!file.type.match('image.*')) { showError("Format Salah! Pas Foto harus berupa gambar (JPG/PNG)."); e.target.value = null; return; }
        if (file.size > 1 * 1024 * 1024) { showError("Ukuran Pas Foto terlalu besar! Maksimal 1MB."); e.target.value = null; return; }
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            if (img.width >= img.height) { showError("Orientasi Salah! Foto harus berbentuk Portrait (Tegak) sesuai rasio 3x4."); URL.revokeObjectURL(img.src); e.target.value = null; return; }
            setFiles(prev => ({ ...prev, [fileType]: file }));
            setFotoPreview(img.src);
        };
        return;
    }

    if (file.type !== 'application/pdf') { showError("Format Salah! Dokumen harus berformat PDF."); e.target.value = null; return; }
    if (file.size > 2 * 1024 * 1024) { showError("Ukuran File PDF terlalu besar! Maksimal 2MB."); e.target.value = null; return; }
    setFiles(prev => ({ ...prev, [fileType]: file }));
  };

  // Helper untuk menghapus file
  const removeFile = (fileType) => {
      setFiles(prev => ({ ...prev, [fileType]: null }));
      // Reset input value agar bisa upload file yang sama lagi jika perlu
      const inputId = `file-input-${fileType}`;
      const inputEl = document.getElementById(inputId);
      if(inputEl) inputEl.value = "";
  };

  const triggerPhotoInput = () => fileInputRef.current.click();

  const fetchSchools = async (query) => {
    if (!query || query.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-school?query=${query}`);
      const data = await response.json(); 
      if (Array.isArray(data) && data.length > 0) { setSuggestions(data); setShowSuggestions(true); } else { setSuggestions([]); }
    } catch (error) { setSuggestions([]); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (formData.asalSekolah.length > 2) fetchSchools(formData.asalSekolah); }, 800); 
    return () => clearTimeout(timer);
  }, [formData.asalSekolah]);

  const handleSelectSchool = (item) => {
    const name = item.value || item.name || ""; 
    if (!name.toUpperCase().includes("SMP") && !name.toUpperCase().includes("MTS")) { showError("Peringatan: Pastikan sekolah yang dipilih adalah tingkat SMP/MTs."); setFormData(prev => ({ ...prev, asalSekolah: "" })); return; }
    setFormData(prev => ({ ...prev, asalSekolah: name })); setSuggestions([]); setShowSuggestions(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asalSekolah.toUpperCase().includes("SMP") && !formData.asalSekolah.toUpperCase().includes("MTS")) { showError("Mohon perbaiki Asal Sekolah (Harus SMP/MTs)."); return; }
    if (!files.pasFoto) { showError("Wajib upload Pas Foto."); return; }
    
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
          if (typeof formData[key] === 'object' && formData[key] !== null) dataToSend.append(key, JSON.stringify(formData[key]));
          else dataToSend.append(key, formData[key]);
      });
      dataToSend.append('userId', userData?.id);
      Object.keys(files).forEach(key => { if (files[key]) dataToSend.append(key, files[key]); });

      const response = await fetch(`${API_BASE_URL}/api/register`, { method: 'POST', body: dataToSend });
      const data = await response.json();
      if (response.ok) { setIsSubmitted(true); if (onSuccess) onSuccess(); } 
      else { showError("Gagal Mendaftar: " + (data.message || "Terjadi kesalahan pada server.")); }
    } catch (error) { showError("Gagal terhubung ke server backend."); }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} /></div>
           <h2 className="text-2xl font-bold mb-2">Data Tersimpan!</h2>
           <button onClick={onGoHome} className="w-full bg-blue-600 text-white py-3 rounded-xl mt-4">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center animate-fade-in">
      <ValidationModal isOpen={showValidationModal} message={validationMessage} onClose={() => setShowValidationModal(false)} />

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-4xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Formulir Pendaftaran Siswa Baru</h1>
          <p className="text-blue-100 text-sm">Mohon isi data dengan lengkap dan benar.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          {/* Identitas Diri */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2"><User size={20}/> Identitas Peserta Didik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1"><label className="text-sm font-semibold">Nama Lengkap</label><input required name="namaLengkap" value={formData.namaLengkap} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">NISN</label><input required name="nisn" value={formData.nisn} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">Tempat Lahir</label><input required name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Tanggal Lahir</label>
                    <input type="date" required name="tglLahir" value={formData.tglLahir} onChange={handleChange} min={minDateStr} max={maxDateStr} className="w-full px-3 py-2 border rounded-lg" />
                    <p className="text-[10px] text-slate-400">Maksimal umur 17 tahun.</p>
                </div>
                <div className="space-y-1"><label className="text-sm font-semibold">Jenis Kelamin</label>
                    <select required name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"><option value="">Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select>
                </div>
                <div className="space-y-1"><label className="text-sm font-semibold">NIK</label><input required name="nik" value={formData.nik} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Masukkan NIK" inputMode="numeric" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">Agama</label>
                    <select required name="agama" value={formData.agama} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"><option value="">Pilih...</option>{['Islam', 'Kristen', 'Katholik', 'Hindu', 'Budha', 'Konghucu', 'Kepercayaan'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                </div>
                <div className="space-y-1 relative" ref={dropdownRef}>
                    <label className="text-sm font-semibold">Asal Sekolah</label>
                    <input name="asalSekolah" value={formData.asalSekolah} onChange={handleChange} placeholder="Masukkan nama sekolah" className="w-full px-3 py-2 border rounded-lg" autoComplete="off"/>
                    {showSuggestions && suggestions.length > 0 && (<ul className="absolute z-10 w-full bg-white border mt-1 shadow-lg max-h-40 overflow-y-auto">{suggestions.map((item, idx) => <li key={idx} onClick={() => handleSelectSchool(item)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">{item.value}</li>)}</ul>)}
                </div>
                 <div className="space-y-1 md:col-span-2"><label className="text-sm font-semibold">Alamat Rumah</label><textarea required name="alamatRumah" value={formData.alamatRumah} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" rows="2" /></div>
            </div>
          </div>

          {/* Data Orang Tua */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2"><User size={20}/> Data Orang Tua</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1"><label className="text-sm font-semibold">Nama Ayah</label><input required name="namaAyah" value={formData.namaAyah} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">Pekerjaan Ayah</label><input required name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">Nama Ibu</label><input required name="namaIbu" value={formData.namaIbu} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">Pekerjaan Ibu</label><input required name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">No Telp / WA</label><input required name="noTelp" value={formData.noTelp} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div className="space-y-1"><label className="text-sm font-semibold">Email</label><input disabled value={formData.email} className="w-full px-3 py-2 border rounded-lg bg-gray-100" /></div>
            </div>
          </div>

          {/* Nilai Raport */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2"><FileText size={20}/> Nilai Raport (Semester 1-5)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead><tr className="bg-slate-100"><th className="p-2 border">MATA PELAJARAN</th>{[1, 2, 3, 4, 5].map(i => <th key={i} className="p-2 border text-center">SEM {i}</th>)}</tr></thead>
                    <tbody>
                        {[{ label: 'Matematika', key: 'nilaiMatematika' }, { label: 'Bhs. Indonesia', key: 'nilaiBhsIndonesia' }, { label: 'IPA', key: 'nilaiIpa' }, { label: 'Bhs. Inggris', key: 'nilaiBhsInggris' }].map((mapel) => (
                            <tr key={mapel.key}><td className="p-2 border font-medium">{mapel.label}</td>{['sem1', 'sem2', 'sem3', 'sem4', 'sem5'].map((sem) => (
                                <td key={sem} className="p-1 border"><input type="text" inputMode="decimal" placeholder="0-100" className="w-full px-2 py-1 text-center border-none focus:ring-1" value={formData[mapel.key][sem]} onChange={(e) => handleNilaiChange(mapel.key, sem, e.target.value)} /></td>))}
                            </tr>))}
                    </tbody>
                </table>
            </div>
          </div>

          {/* Upload Dokumen dengan Preview */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2"><UploadCloud size={20}/> Upload Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Pas Foto (Kiri) */}
                <div className="md:col-span-4 flex flex-col items-center">
                    <label className="text-sm font-bold mb-2">Pas Foto (3x4)</label>
                    <div onClick={triggerPhotoInput} className="w-32 h-44 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden bg-slate-50 hover:bg-blue-50 relative group">
                        {fotoPreview ? (
                            <>
                                <img src={fotoPreview} className="w-full h-full object-cover" alt="Preview"/>
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <Camera className="text-white mb-1"/>
                                    <span className="text-white text-xs font-bold">Ganti Foto</span>
                                </div>
                            </>
                        ) : <Camera className="text-slate-400"/>}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'pasFoto')} className="hidden" accept="image/*" />
                    <p className="text-xs text-orange-600 font-bold mt-2 text-center bg-orange-50 px-2 py-1 rounded">*Wajib rasio 3x4 (Portrait) & Maks 1MB</p>
                </div>

                {/* Dokumen PDF (Kanan) */}
                <div className="md:col-span-8 grid grid-cols-1 gap-4">
                    {[
                        { label: 'Raport (Sem 1-5)', key: 'raport1' },
                        { label: 'Sertifikat Pendukung', key: 'sertifikat1' },
                    ].map((doc) => (
                        <div key={doc.key} className="p-3 border rounded-lg bg-slate-50 relative">
                            <label className="text-sm font-semibold block mb-2">{doc.label}</label>
                            
                            {/* TAMPILAN PREVIEW JIKA FILE ADA */}
                            {files[doc.key] ? (
                                <div className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{files[doc.key].name}</p>
                                            <p className="text-[10px] text-slate-400">{(files[doc.key].size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={URL.createObjectURL(files[doc.key])} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Lihat File"
                                        >
                                            <Eye size={18} /> 
                                        </a>
                                        <button 
                                            type="button"
                                            onClick={() => removeFile(doc.key)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Hapus File"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // TAMPILAN INPUT JIKA KOSONG
                                <>
                                    <input 
                                        id={`file-input-${doc.key}`}
                                        type="file" 
                                        onChange={(e) => handleFileChange(e, doc.key)} 
                                        accept=".pdf" 
                                        className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-[10px] text-orange-600 mt-2 font-medium bg-orange-50 p-2 rounded border border-orange-100 leading-tight">
                                        *Gabungkan semua foto/scan halaman {doc.label.toLowerCase()} menjadi <strong>1 file PDF</strong> (Maks 2MB).
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                 <Send size={20} /> SIMPAN / SAVE
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;