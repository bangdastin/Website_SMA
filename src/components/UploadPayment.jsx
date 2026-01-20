import React, { useState } from 'react';
import { 
  Upload, Loader2, CheckCircle2, AlertCircle, X, Image as ImageIcon, 
  MessageCircle, Clock, ShieldCheck 
} from 'lucide-react';

const UploadPayment = ({ userId, userEmail, onUploadSuccess, currentStatus, existingImage }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // CONFIG URL
  const LOCAL_URL = "http://localhost:5000";
  const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
  const API_BASE_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PROD_URL; 

  const NOMOR_PANITIA = "6281234567890"; 

  const handleContactWA = () => {
    const pesan = `Halo Panitia PPDB, saya siswa dengan email *${userEmail}* sudah upload bukti bayar. Mohon verifikasi data saya.`;
    window.open(`https://wa.me/${NOMOR_PANITIA}?text=${encodeURIComponent(pesan)}`, '_blank');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setMessage({ type: '', text: '' });
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) { setMessage({ type: 'error', text: 'Ukuran file terlalu besar! Maksimal 2MB.' }); return; }
      if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'File harus berupa gambar (JPG/PNG).' }); return; }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    if (!userId) {
        setMessage({ type: 'error', text: 'Sesi user tidak valid. Silakan login ulang.' });
        return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('buktiBayar', selectedFile); 
    formData.append('userId', userId); // KIRIM ID
    if (userEmail) formData.append('email', userEmail); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-payment`, {
        method: 'POST', 
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Berhasil diupload!' });
        setTimeout(() => { if (onUploadSuccess) onUploadSuccess(); }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal upload.' });
      }
    } catch (error) {
      console.error("Error Upload:", error);
      setMessage({ type: 'error', text: 'Gagal terhubung ke server.' });
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleCancel = () => { setSelectedFile(null); setPreviewUrl(null); setMessage({ type: '', text: '' }); };

  // --- TAMPILAN STATUS ---

  if (currentStatus === 'Diterima') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 max-w-xl mx-auto text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-green-50"><ShieldCheck size={40} /></div>
        <h2 className="text-2xl font-bold text-slate-800">Pendaftaran Diterima! 🎉</h2>
        <p className="text-slate-500 mt-2 mb-6">Selamat! Bukti pembayaran Anda valid. Anda resmi terdaftar sebagai calon siswa.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold"><CheckCircle2 size={16}/> LUNAS & TERVERIFIKASI</div>
      </div>
    );
  }

  if (currentStatus === 'Menunggu' && existingImage) { 
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-8 max-w-xl mx-auto text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
        <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-yellow-50 animate-pulse"><Clock size={40} /></div>
        <h2 className="text-2xl font-bold text-slate-800">Sedang Diverifikasi...</h2>
        <p className="text-slate-500 mt-3 mb-8 text-sm leading-relaxed">Bukti pembayaran Anda sudah kami terima dan sedang dicek oleh Admin. <br/>Form upload dikunci sementara.</p>
        <div className="mb-6 flex justify-center"><a href={`${API_BASE_URL}/uploads/${existingImage}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline hover:text-blue-700 flex items-center gap-1"><ImageIcon size={12}/> Lihat Bukti Terupload</a></div>
        <button onClick={handleContactWA} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 flex items-center justify-center gap-3 transition-all hover:-translate-y-1"><MessageCircle size={20} /> Chat Panitia (Minta Approve)</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-full max-w-2xl mx-auto animate-fade-in">
      {currentStatus === 'Ditolak' && (
         <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-center gap-3 text-red-700 animate-pulse">
            <AlertCircle size={20}/>
            <span className="font-semibold text-sm">Bukti sebelumnya Ditolak. Silakan upload ulang.</span>
         </div>
      )}
      <div className={`p-8 text-white text-center bg-gradient-to-r ${currentStatus === 'Ditolak' ? 'from-red-600 to-pink-600' : 'from-blue-600 to-indigo-600'}`}>
        <h2 className="text-xl font-bold flex items-center justify-center gap-2"><Upload size={24} /> {currentStatus === 'Ditolak' ? 'Upload Ulang Bukti' : 'Upload Bukti Pembayaran'}</h2>
        <p className="text-white/90 text-sm mt-2">Transfer ke Bank BRI: 123-456-7890 (a.n Sekolah)</p>
      </div>
      <div className="p-8">
        <div className="mb-6">
            {!previewUrl ? (
                <label className="group border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all duration-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform"><ImageIcon className="text-slate-400 group-hover:text-blue-500" size={32} /></div>
                    <p className="font-bold text-slate-600 group-hover:text-blue-600">Klik untuk pilih foto</p>
                    <p className="text-xs text-slate-400 mt-1">Format JPG/PNG, Maks. 2MB</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
            ) : (
                <div className="relative border rounded-2xl overflow-hidden bg-slate-900 h-64 flex items-center justify-center group">
                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:bg-red-600 transition-colors flex items-center gap-2"><X size={16}/> Ganti Foto</button>
                    </div>
                </div>
            )}
        </div>
        {message.text && (<div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold animate-bounce ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}{message.text}</div>)}
        <div className="flex gap-3">
             {previewUrl ? (
                 <button onClick={handleUpload} disabled={isLoading} className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all active:scale-95 ${currentStatus === 'Ditolak' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>{isLoading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />} {isLoading ? 'Sedang Mengirim...' : 'Kirim Bukti Pembayaran'}</button>
             ) : (
                 <div className="w-full text-center text-sm text-slate-400 py-3 border-t border-slate-100 mt-2 italic">Silakan pilih foto bukti transfer terlebih dahulu.</div>
             )}
        </div>
      </div>
    </div>
  );
};

export default UploadPayment;