import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, School, MapPin, Calendar, Send, CheckCircle2, 
  AlertCircle, Loader2, Lock, Home, Camera, Image as ImageIcon, UploadCloud
} from 'lucide-react';

const RegistrationForm = ({ onSuccess, onGoHome, userData }) => {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    noTelp: '',
    tglLahir: '',
    asalSekolah: '', 
    alamatRumah: ''
  });

  // State untuk Foto
  const [pasFoto, setPasFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  // State untuk Jadwal Ujian (Dinamis dari Server/Admin)
  const [jadwalUjian, setJadwalUjian] = useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false); 
  
  // State Pencarian Sekolah
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolError, setSchoolError] = useState("");
  
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // =================================================================
  // PERBAIKAN URL SERVER
  // =================================================================
  const LOCAL_URL = "http://localhost:5000";
  const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? LOCAL_URL 
    : PROD_URL; 
  // =================================================================

  // --- 1. FETCH CONFIG & USER DATA ---
  useEffect(() => {
    // A. Auto Fill Email User Login
    if (userData?.email) {
        setFormData(prev => ({ ...prev, email: userData.email }));
    }

    // B. Cek Status Existing User
    if (userData && (userData.status === 'Menunggu' || userData.status === 'Diterima' || userData.status === 'Ditolak')) {
        setIsAlreadyRegistered(true); 
        setIsSubmitted(true); 
        setFormData(prev => ({ 
            ...prev, 
            namaLengkap: userData.nama || '',
            asalSekolah: userData.asalSekolah || ''
        }));
    }

    // C. [BARU] Fetch Jadwal Ujian dari Server (Kontrol Admin)
    // Ini memastikan tanggal ujian di kartu nanti sesuai settingan server
    const fetchSchedule = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/settings/exam-schedule`);
            const data = await res.json();
            if (data && data.date) {
                setJadwalUjian(data.date); // Simpan jadwal untuk validasi atau info
            }
        } catch (error) {
            console.log("Menggunakan jadwal default karena server offline/belum disetting.");
        }
    };
    fetchSchedule();

  }, [userData, API_BASE_URL]);

  // --- 2. LOGIKA UPLOAD FOTO ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validasi Ukuran (Max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran foto terlalu besar! Maksimal 2MB.");
            return;
        }
        // Validasi Tipe
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            alert("Format file harus JPG atau PNG.");
            return;
        }

        setPasFoto(file);
        // Buat Preview URL
        const previewUrl = URL.createObjectURL(file);
        setFotoPreview(previewUrl);
    }
  };

  const triggerFileInput = () => {
      fileInputRef.current.click();
  };

  // --- 3. FETCH SEKOLAH ---
  const fetchSchools = async (query) => {
    if (!query || query.length < 3) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search-school?query=${query}`);
      const data = await response.json(); 

      if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data); 
          setShowSuggestions(true);
      } else {
          setSuggestions([]);
      }
    } catch (error) { 
        console.error("Gagal fetch sekolah:", error); 
        setSuggestions([]);
    } finally { 
        setIsLoading(false); 
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.asalSekolah && formData.asalSekolah.length > 2) {
          fetchSchools(formData.asalSekolah);
      }
    }, 800); 
    return () => clearTimeout(timer);
  }, [formData.asalSekolah]);

  const handleSelectSchool = (schoolItem) => {
    const schoolName = schoolItem.value || schoolItem.name || ""; 
    
    setFormData(prev => ({ ...prev, asalSekolah: schoolName }));
    setSuggestions([]); 
    setShowSuggestions(false); 
    
    const upperName = schoolName.toUpperCase();
    if (!upperName.includes("SMP") && !upperName.includes("MTS")) {
       setSchoolError("Peringatan: Pastikan sekolah yang dipilih adalah tingkat SMP/MTs.");
    } else { 
       setSchoolError(""); 
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'asalSekolah') setShowSuggestions(true); 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 4. SUBMIT DATA (MENGGUNAKAN FORMDATA UNTUK FILE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (schoolError) { alert("Mohon perbaiki Asal Sekolah terlebih dahulu."); return; }
    if (!pasFoto) { alert("Wajib upload Pas Foto untuk Kartu Ujian."); return; }
    
    try {
      // Menggunakan FormData karena ada upload file (foto)
      const dataToSend = new FormData();
      dataToSend.append('userId', userData?.id);
      dataToSend.append('namaLengkap', formData.namaLengkap);
      dataToSend.append('email', formData.email);
      dataToSend.append('noTelp', formData.noTelp);
      dataToSend.append('tglLahir', formData.tglLahir);
      dataToSend.append('asalSekolah', formData.asalSekolah);
      dataToSend.append('alamatRumah', formData.alamatRumah);
      
      // Masukkan Foto
      dataToSend.append('pasFoto', pasFoto); 

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        // Jangan set Content-Type header secara manual saat pakai FormData, 
        // biarkan browser yang mengaturnya (multipart/form-data)
        body: dataToSend, 
      });

      const data = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess(); // Refresh Dashboard
      } else {
        alert("Gagal mendaftar: " + (data.error?.sqlMessage || data.message || "Terjadi kesalahan server"));
      }
    } catch (error) { 
        console.error(error);
        alert("Tidak bisa terhubung ke server backend."); 
    }
  };

  // --- TAMPILAN SUKSES ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 max-w-md w-full text-center relative overflow-hidden">
          {isAlreadyRegistered && (<div className="absolute top-0 left-0 w-full h-2 bg-yellow-400"></div>)}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isAlreadyRegistered ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
            {isAlreadyRegistered ? <Lock size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{isAlreadyRegistered ? 'Anda Sudah Terdaftar' : 'Data Tersimpan!'}</h2>
          
          <p className="text-slate-500 mb-6 text-sm">
            {isAlreadyRegistered 
                ? "Data Anda sudah ada di sistem kami. Tidak perlu mengisi formulir lagi." 
                : "Biodata dan Foto berhasil disimpan. Silakan masuk ke menu 'Pembayaran' untuk upload bukti transfer."}
          </p>
          
          <button onClick={onGoHome} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><Home size={20} /> Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN FORMULIR LENGKAP ---
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-3xl w-full overflow-hidden">
        
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Formulir Pendaftaran</h1>
          <p className="text-blue-100 text-sm">Lengkapi biodata & upload foto untuk Kartu Ujian.</p>
          
          {/* Badge Jadwal Ujian (Info dari Server) */}
          {jadwalUjian && (
             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/30 hidden md:block">
                Jadwal Ujian: {jadwalUjian}
             </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* KOLOM KIRI: UPLOAD FOTO (Untuk Kartu Ujian) */}
            <div className="md:col-span-4 flex flex-col items-center">
                <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Camera size={18} className="text-blue-600" /> Pas Foto (3x4)
                </label>
                
                <div 
                    onClick={triggerFileInput}
                    className={`w-40 h-[213px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group hover:border-blue-500 hover:bg-blue-50 ${!pasFoto ? 'border-slate-300 bg-slate-50' : 'border-green-500'}`}
                >
                    {fotoPreview ? (
                        <>
                            <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold"><Camera size={20} className="mx-auto mb-1"/> Ganti Foto</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4 text-slate-400">
                            <UploadCloud size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-xs">Klik untuk upload foto</p>
                            <p className="text-[10px] mt-1 text-slate-300">(Wajib: Seragam Sekolah)</p>
                        </div>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <p className="text-xs text-slate-400 mt-2 text-center max-w-[180px]">
                    *Foto ini akan dicetak otomatis di Kartu Ujian. Gunakan foto formal.
                </p>
            </div>

            {/* KOLOM KANAN: FORM DATA */}
            <div className="md:col-span-8 space-y-5">
                 
                 {/* Nama & Tgl Lahir */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                        <input type="text" name="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} placeholder="Sesuai Ijazah" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tanggal Lahir</label>
                        <input type="date" name="tglLahir" required value={formData.tglLahir} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-slate-600" />
                    </div>
                 </div>

                 {/* Email & WA */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email (Akun)</label>
                        <div className="relative">
                            <input type="email" name="email" value={formData.email} disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none" />
                            <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">WhatsApp</label>
                        <input type="tel" name="noTelp" required value={formData.noTelp} onChange={handleChange} placeholder="0812xxxxxxxx" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none" />
                    </div>
                 </div>

                 {/* Asal Sekolah */}
                 <div className="space-y-2" ref={dropdownRef}>
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><School size={16} className="text-blue-600" /> Asal Sekolah (SMP/MTs)</label>
                    <div className="relative">
                        <input type="text" name="asalSekolah" required value={formData.asalSekolah} onChange={handleChange} autoComplete="off" placeholder="Ketik nama sekolah..." className={`w-full px-4 py-2.5 pl-10 rounded-lg border outline-none transition-all placeholder:text-slate-400 ${schoolError ? 'border-orange-300 focus:border-orange-500' : 'border-slate-300 focus:border-blue-500'}`} />
                        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">{isLoading ? <Loader2 size={18} className="animate-spin text-blue-500"/> : <School size={18} />}</div>
                        
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                            {suggestions.map((item, index) => (
                                <li key={index} onClick={() => handleSelectSchool(item)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0 transition-colors">
                                <span className="font-semibold block">{item.value || item.name}</span>
                                {item.address && <span className="text-xs text-slate-400 block truncate">{item.address}</span>}
                                </li>
                            ))}
                            </ul>
                        )}
                    </div>
                    {schoolError && <p className="text-xs text-orange-600 font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/> {schoolError}</p>}
                 </div>

                 {/* Alamat */}
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Alamat Lengkap</label>
                    <textarea name="alamatRumah" required rows="2" value={formData.alamatRumah} onChange={handleChange} placeholder="Jl. Merdeka No. 10..." className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none resize-none"></textarea>
                 </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100">
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                 <Send size={20} /> Simpan Formulir Pendaftaran
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;