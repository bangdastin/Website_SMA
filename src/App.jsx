import React, { useState } from 'react';
import { Menu, X, ArrowRight, GraduationCap } from 'lucide-react';

// --- IMPORT KOMPONEN HALAMAN ---
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import AuthPage from './AuthPage'; 

// --- KOMPONEN LANDING PAGE ---
const LandingPageContent = ({ onNavigateToLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) { element.scrollIntoView({ behavior: 'smooth' }); }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-blue-600 p-2 rounded-lg"><GraduationCap className="text-white w-6 h-6" /></div>
              <span className="font-bold text-xl text-slate-800">SMA <span className="text-blue-600">Unggulan</span></span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              {['Home', 'Tentang', 'Prestasi', 'Pengumuman'].map((item) => (
                <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-slate-600 hover:text-blue-600 font-medium transition-colors">{item}</button>
              ))}
            </div>
            <div className="hidden md:flex">
              <button onClick={onNavigateToLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center gap-2">
                Daftar Siswa Baru <ArrowRight size={18} />
              </button>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
              {['Home', 'Tentang', 'Prestasi', 'Pengumuman'].map((item) => (
                <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-blue-50 hover:text-blue-600 rounded-lg">{item}</button>
              ))}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button onClick={onNavigateToLogin} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                  Daftar Sekarang <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">Penerimaan Siswa Baru 2026/2027</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">Wujudkan Masa Depan <span className="text-blue-600">Gemilang</span> Bersama Kami</h1>
            <p className="text-lg text-slate-500 leading-relaxed">Bergabunglah dengan SMA Unggulan. Kami mencetak generasi berkarakter, berprestasi, dan siap bersaing di era global.</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={onNavigateToLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1">Daftar Sekarang</button>
              <button onClick={() => scrollToSection('tentang')} className="px-8 py-4 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all">Pelajari Lebih Lanjut</button>
            </div>
          </div>
          <div className="relative animate-fade-in delay-100 hidden md:block">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl text-white h-[500px] flex flex-col justify-center items-center text-center">
               <GraduationCap size={120} className="mb-6 opacity-90" />
               <h3 className="text-2xl font-bold mb-2">SMA Unggulan</h3>
               <p className="text-blue-100">Mencerdaskan Kehidupan Bangsa</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const path = window.location.pathname;

  // --- LOGIKA RESET PASSWORD (Tambahan) ---
  // Cek apakah ada parameter ?view=reset&token=... di URL
  const queryParams = new URLSearchParams(window.location.search);
  const viewParam = queryParams.get('view');
  const tokenParam = queryParams.get('token');

  // Jika ada token reset, langsung buka halaman AUTH, jika tidak buka LANDING
  const [currentView, setCurrentView] = useState(
    viewParam === 'reset' && tokenParam ? 'auth' : 'landing'
  );
  
  const [userData, setUserData] = useState(null);

  // LOGIKA 1: ADMIN (Jika URL /admin)
  if (path === '/admin') {
    return <AdminDashboard />;
  }

  // LOGIKA 2: LOGIN SUKSES -> DASHBOARD
  if (currentView === 'dashboard') {
    return <UserDashboard user={userData} />;
  }

  // LOGIKA 3: HALAMAN LOGIN / REGISTER / RESET PASSWORD
  if (currentView === 'auth') {
    return (
      <AuthPage 
        // Kirim props agar AuthPage tahu harus membuka form Reset Password
        initialView={viewParam === 'reset' && tokenParam ? 'reset' : 'login'}
        resetToken={tokenParam} 
        
        onLoginSuccess={(user) => {
          setUserData(user);
          setCurrentView('dashboard');
        }}
        onBackToHome={() => {
            // Bersihkan URL saat kembali ke home agar tidak stuck di reset view
            window.history.replaceState({}, document.title, "/");
            setCurrentView('landing');
        }}
      />
    );
  }

  // LOGIKA 4: LANDING PAGE (DEFAULT)
  return <LandingPageContent onNavigateToLogin={() => setCurrentView('auth')} />;
}

export default App;