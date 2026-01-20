import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // PENTING: Import ini untuk pindah halaman
import { Mail, Lock, User, Hash, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';

// --- CSS ANIMASI ---
const customStyles = `
  @keyframes scaleUp {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
  .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
`;

const AuthPage = ({ initialView = 'login', resetToken = null }) => {
  // PENTING: Inisialisasi navigasi
  const navigate = useNavigate();

  // =================================================================
  // KONFIGURASI URL BACKEND
  // =================================================================
  const LOCAL_URL = "http://localhost:5000";
  const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? LOCAL_URL 
    : PROD_URL; 
  // =================================================================

  const [view, setView] = useState(initialView); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [successModal, setSuccessModal] = useState({ show: false, text: '' });

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [regData, setRegData] = useState({ nik: '', username: '', email: '', password: '', confirmPassword: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetData, setResetData] = useState({ newPassword: '', confirmNewPassword: '' });

  // Effect token
  useEffect(() => {
    if (resetToken) setView('reset');
  }, [resetToken]);

  // Bersihkan pesan error saat ganti view
  useEffect(() => {
    setMessage({ type: '', text: '' });
  }, [view]);

  const showSuccessAnimation = (text, callback) => {
    setSuccessModal({ show: true, text: text });
    setTimeout(() => {
        setSuccessModal({ show: false, text: '' });
        if (callback) callback(); 
    }, 2000); 
  };

  const validatePasswordStrength = (password) => {
    if (password.length < 8) return "Password minimal 8 karakter.";
    if (!/[A-Z]/.test(password)) return "Password harus memiliki minimal 1 Huruf Besar.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password harus memiliki minimal 1 Simbol.";
    return null;
  };

  // --- HANDLER LOGIN (FIX NAVIGASI) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); setMessage({ type: '', text: '' });

    try {
      console.log("Login ke:", `${API_BASE_URL}/api/auth/login`);
      
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(loginData)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userApp', JSON.stringify(data.user));
        showSuccessAnimation("Login Berhasil!", () => {
            // Logika Redirect
            if (data.user.role === 'admin') {
                window.location.href = "/admin"; 
            } else {
                // PERBAIKAN UTAMA: Gunakan navigate
                navigate('/dashboard'); 
            }
        });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) { 
        console.error("Login Error:", err);
        setMessage({ type: 'error', text: 'Gagal terhubung ke server. Pastikan backend nyala.' }); 
    } 
    finally { setIsLoading(false); }
  };

  // --- HANDLER REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (regData.nik.length !== 16) return setMessage({ type: 'error', text: 'NIK harus 16 digit.' });
    if (regData.password !== regData.confirmPassword) return setMessage({ type: 'error', text: 'Password tidak cocok!' });
    const passwordError = validatePasswordStrength(regData.password);
    if (passwordError) return setMessage({ type: 'error', text: passwordError });

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik: regData.nik, username: regData.username, email: regData.email, password: regData.password })
      });
      const data = await res.json();
      
      if (res.ok) { 
        setRegData({ nik: '', username: '', email: '', password: '', confirmPassword: '' });
        showSuccessAnimation("Akun Berhasil Dibuat!", () => setView('login'));
      } else { 
        setMessage({ type: 'error', text: data.message }); 
      }
    } catch (err) { setMessage({ type: 'error', text: 'Server Error.' }); }
    finally { setIsLoading(false); }
  };

  // --- HANDLER FORGOT ---
  const handleForgot = async (e) => {
    e.preventDefault(); setIsLoading(true); setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) setMessage({ type: 'success', text: data.message });
      else setMessage({ type: 'error', text: data.message });
    } catch (err) { setMessage({ type: 'error', text: 'Server Error.' }); }
    finally { setIsLoading(false); }
  };

  // --- HANDLER RESET ---
  const handleReset = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmNewPassword) return setMessage({ type: 'error', text: 'Password tidak cocok!' });
    const passwordError = validatePasswordStrength(resetData.newPassword);
    if (passwordError) return setMessage({ type: 'error', text: passwordError });

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: resetData.newPassword })
      });
      const data = await res.json();

      if (res.ok) { 
          window.history.replaceState({}, document.title, "/");
          showSuccessAnimation("Password Berhasil Diubah!", () => {
             setView('login'); 
          });
      } else { 
          setMessage({ type: 'error', text: data.message }); 
      }
    } catch (err) { setMessage({ type: 'error', text: 'Gagal koneksi server.' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 font-sans relative overflow-hidden">
      <style>{customStyles}</style>

      {/* --- MODAL ANIMASI SUKSES --- */}
      {successModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-scale-up w-80 text-center border border-slate-100">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm ring-4 ring-green-50">
                    <CheckCircle2 size={40} className="animate-bounce" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{successModal.text}</h3>
                <p className="text-slate-500 mt-2 text-xs">Mengalihkan halaman...</p>
                <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full transition-all duration-[2000ms] ease-linear origin-left animate-pulse"></div>
                </div>
            </div>
        </div>
      )}

      {/* --- CARD UTAMA --- */}
      <div className={`bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 relative animate-fade-in transition-all duration-500 ${successModal.show ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* Tombol Kembali: Menggunakan navigate('/') */}
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
            <ArrowLeft size={24} />
        </button>
        
        <div className="text-center mb-8 mt-4">
          <div className="inline-block p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
            {view === 'login' ? <User size={32} /> : view === 'register' ? <User size={32} /> : <KeyRound size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {view === 'login' ? 'Selamat Datang!' : view === 'register' ? 'Buat Akun Siswa' : view === 'reset' ? 'Reset Password' : 'Lupa Password'}
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            {view === 'login' ? 'Masuk ke portal pendaftaran siswa baru.' : view === 'register' ? 'Isi data diri Anda untuk mendaftar.' : view === 'reset' ? 'Buat password baru yang aman.' : 'Kami akan mengirimkan link reset.'}
          </p>
        </div>

        {/* ALERT MESSAGE */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium animate-fade-in border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {message.type === 'success' ? <CheckCircle2 className="shrink-0" size={18} /> : <AlertCircle className="shrink-0" size={18} />} 
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {/* --- FORM LOGIN --- */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
                <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" required className="w-full pl-11 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 focus:bg-white" placeholder="Username" value={loginData.identifier} onChange={e => setLoginData({...loginData, identifier: e.target.value})} />
                </div>
                <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input type={showPassword ? "text" : "password"} required className="w-full pl-11 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 focus:bg-white" placeholder="Password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
            </div>
            
            <div className="flex justify-end">
                <button type="button" onClick={() => setView('forgot')} className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">Lupa Password?</button>
            </div>

            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? <Loader2 size={20} className="animate-spin"/> : 'Login'}
            </button>
            
            <p className="text-center text-sm text-slate-500 mt-6">
                Belum punya akun? <button type="button" onClick={() => setView('register')} className="text-blue-600 font-bold hover:underline ml-1">Daftar Sekarang</button>
            </p>
          </form>
        )}

        {/* --- FORM REGISTER --- */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="relative group">
                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                <input type="text" required maxLength={16} className="w-full pl-10 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm transition-all" placeholder="NIK (16 Digit)" value={regData.nik} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setRegData({...regData, nik: val}); }} />
            </div>
            <div className="relative group">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                <input type="text" required className="w-full pl-10 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm transition-all" placeholder="Username" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} />
            </div>
            <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                <input type="email" required className="w-full pl-10 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm transition-all" placeholder="Email Aktif" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} required className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm transition-all" placeholder="Password (Min 8)" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 scale-75">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
                <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} required className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm transition-all" placeholder="Ulangi Password" value={regData.confirmPassword} onChange={e => setRegData({...regData, confirmPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 scale-75">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
            </div>
            
            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2 flex justify-center items-center gap-2 transition-all active:scale-95">
                {isLoading ? <Loader2 size={18} className="animate-spin"/> : 'Daftar Akun'}
            </button>
            <p className="text-center text-sm text-slate-500 mt-2">Sudah punya akun? <button type="button" onClick={() => setView('login')} className="text-blue-600 font-bold hover:underline">Login</button></p>
          </form>
        )}

        {/* --- VIEW 3: FORGOT PASSWORD --- */}
        {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 border border-blue-100 flex gap-3 items-start">
                    <Mail className="shrink-0 mt-0.5" size={18} />
                    <span>Masukkan email terdaftar Anda. Kami akan mengirimkan link untuk mereset password.</span>
                </div>
                <div className="relative group">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input type="email" required className="w-full pl-11 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50 focus:bg-white" placeholder="Email Terdaftar" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                </div>
                <div className="space-y-3">
                    <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all active:scale-95">
                        {isLoading ? <Loader2 size={20} className="animate-spin"/> : 'Kirim Link Reset'}
                    </button>
                    <button type="button" onClick={() => setView('login')} className="w-full py-3 rounded-xl text-slate-500 font-semibold hover:bg-slate-50 transition-colors">Kembali ke Login</button>
                </div>
            </form>
        )}

        {/* --- VIEW 4: RESET PASSWORD --- */}
        {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl text-sm text-orange-700 border border-orange-100 flex gap-3 items-start mb-2">
                    <Lock className="shrink-0 mt-0.5" size={18} />
                    <span>Buat password baru. (Min 8 Karakter, 1 Huruf Besar, 1 Simbol).</span>
                </div>
                
                <div className="relative group">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                    <input type={showPassword ? "text" : "password"} required className="w-full pl-11 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="Password Baru" value={resetData.newPassword} onChange={e => setResetData({...resetData, newPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>

                <div className="relative group">
                    <CheckCircle2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                    <input type={showConfirmPassword ? "text" : "password"} required className="w-full pl-11 px-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="Konfirmasi Password" value={resetData.confirmNewPassword} onChange={e => setResetData({...resetData, confirmNewPassword: e.target.value})} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>

                <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 flex justify-center items-center gap-2 transition-all active:scale-95">
                    {isLoading ? <Loader2 size={20} className="animate-spin"/> : 'Simpan Password Baru'}
                </button>
            </form>
        )}

      </div>
    </div>
  );
};

export default AuthPage;

