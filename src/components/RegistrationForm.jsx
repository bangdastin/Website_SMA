import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, School, MapPin, Calendar, Send, CheckCircle2, AlertCircle, Loader2, Lock, Home
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

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false); 
  
  // State Pencarian Sekolah
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [schoolError, setSchoolError] = useState("");
  
  const dropdownRef = useRef(null);
  
  // =================================================================
  // PERBAIKAN URL SERVER (Agar Sinkron dengan Dashboard)
  // =================================================================
  const LOCAL_URL = "http://localhost:5000";
  const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? LOCAL_URL 
    : PROD_URL; 
  // =================================================================

  // --- LOGIKA UTAMA: AUTO FILL EMAIL & CEK STATUS ---
  useEffect(() => {
    if (userData?.email) {
        setFormData(prev => ({ ...prev, email: userData.email }));
    }

    // Mengisi data jika user sudah pernah daftar (untuk keperluan edit/view jika diperlukan nanti)
    if (userData && (userData.status === 'Menunggu' || userData.status === 'Diterima' || userData.status === 'Ditolak')) {
        setIsAlreadyRegistered(true); 
        setIsSubmitted(true); 
        setFormData(prev => ({ 
            ...prev, 
            namaLengkap: userData.nama || '',
            asalSekolah: userData.asalSekolah || ''
        }));
    }
  }, [userData]);

  // --- FETCH SEKOLAH ---
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (schoolError) { alert("Mohon perbaiki Asal Sekolah terlebih dahulu."); return; }
    
    try {
      // Kita kirim juga ID User agar lebih aman (jika ada di userData)
      const payload = { ...formData, userId: userData?.id };

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess(); // Panggil fungsi refresh di Dashboard
      } else {
        alert("Gagal mendaftar: " + (data.error?.sqlMessage || data.message || "Terjadi kesalahan server"));
      }
    } catch (error) { alert("Tidak bisa terhubung ke server backend. Cek koneksi/IP."); }
  };

  // --- TAMPILAN SUKSES / SUDAH DAFTAR ---
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
                : "Biodata berhasil disimpan. Silakan masuk ke menu 'Pembayaran' untuk upload bukti transfer."}
          </p>
          
          {userData?.status && (
             <div className="mb-6"><span className={`px-4 py-2 rounded-full font-bold text-sm border ${userData.status === 'Menunggu' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : userData.status === 'Diterima' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>Status: {userData.status}</span></div>
          )}
          
          <button onClick={onGoHome} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"><Home size={20} /> Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  // --- TAMPILAN FORMULIR LENGKAP ---
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Formulir Pendaftaran</h1>
          <p className="text-blue-100">Lengkapi data diri Anda di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><User size={16} className="text-blue-600" /> Nama Lengkap</label>
              <input type="text" name="namaLengkap" required value={formData.namaLengkap} onChange={handleChange} placeholder="Contoh: Budi Santoso" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-400" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Calendar size={16} className="text-blue-600" /> Tanggal Lahir</label>
              <input type="date" name="tglLahir" required value={formData.tglLahir} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 outline-none text-slate-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-blue-600" /> Email
                <span className="text-xs text-slate-400 font-normal">(Sesuai akun login)</span>
              </label>
              <div className="relative">
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    disabled 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-200 text-slate-500 cursor-not-allowed focus:outline-none" 
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={16} className="text-blue-600" /> WhatsApp</label>
              <input type="tel" name="noTelp" required value={formData.noTelp} onChange={handleChange} placeholder="0812xxxxxxxx" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-400" />
            </div>
          </div>

          <div className="space-y-2" ref={dropdownRef}>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><School size={16} className="text-blue-600" /> Asal Sekolah (SMP/MTs)</label>
            <div className="relative">
              <input type="text" name="asalSekolah" required value={formData.asalSekolah} onChange={handleChange} autoComplete="off" placeholder="Ketik nama sekolah (Misal: SMPN 1 Jakarta)..." className={`w-full px-4 py-3 pl-10 rounded-lg border outline-none transition-all placeholder:text-slate-400 ${schoolError ? 'border-orange-300 focus:border-orange-500' : 'border-slate-300 focus:border-blue-500'}`} />
              <div className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">{isLoading ? <Loader2 size={18} className="animate-spin text-blue-500"/> : <School size={18} />}</div>
              
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                  {suggestions.map((item, index) => (
                    <li key={index} onClick={() => handleSelectSchool(item)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0 transition-colors">
                      <span className="font-semibold block">{item.value || item.name}</span>
                      {item.address && <span className="text-xs text-slate-400 block truncate">{item.address}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {schoolError ? (<p className="text-xs text-orange-600 font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/> {schoolError}</p>) : (<p className="text-xs text-slate-400">*Mencari data Sekolah SMP/MTs di Indonesia.</p>)}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><MapPin size={16} className="text-blue-600" /> Alamat Lengkap</label>
            <textarea name="alamatRumah" required rows="3" value={formData.alamatRumah} onChange={handleChange} placeholder="Jl. Merdeka No. 10, RT 01/RW 02, Kelurahan, Kecamatan..." className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 outline-none resize-none placeholder:text-slate-400"></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"><Send size={20} /> Kirim Pendaftaran</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;