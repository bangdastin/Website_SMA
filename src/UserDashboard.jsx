import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, Megaphone, UserPlus, LogOut, Bell, User, CheckCircle2, ChevronRight, 
  Printer, FileBadge, AlertTriangle, MapPin, Calendar, QrCode, XCircle, RefreshCw,
  CreditCard, Upload, MessageCircle 
} from 'lucide-react';

import RegistrationForm from './RegistrationForm'; 
import UploadPayment from './UploadPayment'; 

// --- 1. SIDEBAR COMPONENT ---
const Sidebar = ({ isOpen, activeMenu, onMenuClick, onLogout }) => {
  const menus = [
    { name: "Home", id: "home", icon: Home },
    { name: "Pendaftaran", id: "pendaftaran", icon: UserPlus },
    { name: "Pembayaran", id: "upload", icon: CreditCard }, 
    { name: "Kartu Ujian", id: "kartu", icon: FileBadge }, 
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'} hidden md:block print:hidden`}>
      <div className="flex items-center justify-center h-20 border-b border-slate-100">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
          <UserPlus className="text-white w-6 h-6" />
        </div>
        {isOpen && <span className="ml-3 font-bold text-xl text-slate-800">Siswa<span className="text-blue-600">App</span></span>}
      </div>
      <nav className="p-4 space-y-2 mt-4">
        {menus.map((menu) => (
          <button key={menu.id} onClick={() => onMenuClick(menu.id)} className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 group ${activeMenu === menu.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-blue-50'}`}>
            <menu.icon size={22} className={`${activeMenu === menu.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
            {isOpen && <span className="ml-3 font-medium">{menu.name}</span>}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-6">
        <button onClick={onLogout} className="flex items-center w-full p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={20} />{isOpen && <span className="ml-3 font-medium">Keluar</span>}</button>
      </div>
    </aside>
  );
};

// --- 2. KARTU UJIAN COMPONENT ---
const ExamCardView = ({ userData }) => {
    if (userData.status !== 'Diterima') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-fade-in">
                <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={40} /></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Kartu Belum Tersedia</h2>
                <p className="text-slate-500 max-w-md">
                    Status Anda saat ini: <span className="font-bold text-blue-600">{userData.status || 'Belum Mendaftar'}</span>. <br/>
                    Kartu ujian hanya dapat dicetak setelah status menjadi <span className="font-bold text-green-600">DITERIMA</span>.
                </p>
            </div>
        );
    }
    return (
        <div className="p-4 md:p-8 flex flex-col items-center animate-fade-in">
            <div className="w-full max-w-lg flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">Kartu Ujian</h2>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-lg flex items-center gap-2"><Printer size={18} /> Cetak</button>
            </div>
            <div id="print-area" className="relative bg-white w-[500px] h-[300px] rounded-xl shadow-2xl overflow-hidden border border-slate-300 print:shadow-none print:border-2 print:border-black print:mx-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 h-20 flex items-center px-5 relative z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shadow-md">LOGO</div>
                    <div className="ml-3 text-white"><h1 className="text-sm font-bold opacity-80 uppercase tracking-wide">Kartu Peserta Ujian</h1><h2 className="text-lg font-bold leading-tight">SMA NEGERI UNGGULAN</h2></div>
                </div>
                <div className="p-5 flex gap-4 h-[calc(100%-80px)] relative z-10">
                    <div className="flex flex-col items-center justify-center w-28"><div className="w-24 h-32 bg-slate-100 border-2 border-slate-200 rounded-md flex items-center justify-center text-slate-300 shadow-inner"><User size={40} /></div><p className="text-[10px] text-slate-400 mt-1">2026/2027</p></div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="mb-2"><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nama Peserta</p><p className="text-lg font-bold text-slate-800 leading-tight uppercase truncate">{userData.nama}</p></div>
                            <div className="mb-2"><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">No. Ujian</p><p className="text-base font-mono font-bold text-blue-600 tracking-wide">{userData.noUjian}</p></div>
                            <div className="flex justify-between items-end"><div><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lokasi</p><p className="text-xs font-bold text-slate-700">{userData.lokasi}</p></div><div className="text-slate-800"><QrCode size={40} /></div></div>
                        </div>
                        <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 3. DASHBOARD CONTENT (HOME) ---
const DashboardContent = ({ onRegisterClick, onUploadClick, userData, onRefresh }) => {
  const getStatusColor = (status) => {
    if (status === 'Diterima') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'Ditolak') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getProgressWidth = () => {
      if (userData.status === 'Diterima') return 'w-full'; 
      if (userData.status === 'Ditolak') return 'w-3/4'; 
      if (userData.status === 'Menunggu' && userData.buktiBayar) return 'w-3/4'; 
      if (userData.status === 'Menunggu' && !userData.buktiBayar) return 'w-2/4'; 
      if (userData.status) return 'w-1/4'; 
      return 'w-[5%]'; 
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in print:hidden">
      
      {/* Box Status Pendaftaran */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Progres Pendaftaran</h3>
            <button onClick={onRefresh} className="text-slate-400 hover:text-blue-600 transition-colors" title="Refresh Status">
                <RefreshCw size={20} />
            </button>
        </div>
        <div className="relative flex justify-between items-center px-2 md:px-6">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-1000 ${getProgressWidth()}`}></div>

          {/* STEP 1: AKUN */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={18} /></div>
            <p className="text-xs md:text-sm font-semibold text-blue-700">Akun</p>
          </div>

          {/* STEP 2: FORMULIR */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 ${userData.status ? 'bg-blue-600 text-white' : 'bg-white border-4 border-blue-600 text-blue-600'}`}>
              {userData.status ? <CheckCircle2 size={18}/> : <span className="text-sm font-bold">2</span>}
            </div>
            <p className="text-xs md:text-sm font-bold text-slate-800">Formulir</p>
          </div>

          {/* STEP 3: PEMBAYARAN */}
          <div className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 border-4 ${userData.buktiBayar ? 'bg-blue-600 border-blue-600 text-white' : userData.status ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}>
               {userData.buktiBayar ? <CheckCircle2 size={18}/> : <span className="text-sm font-bold">3</span>}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-600">Bayar</p>
          </div>

          {/* STEP 4: VERIFIKASI */}
          <div className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 border-4 ${userData.status === 'Diterima' ? 'bg-blue-600 border-blue-600 text-white' : userData.status === 'Ditolak' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-slate-200 text-slate-400'}`}>
               {userData.status === 'Diterima' ? <CheckCircle2 size={18}/> : userData.status === 'Ditolak' ? <XCircle size={18}/> : <span className="text-sm font-bold">4</span>}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-400">Verifikasi</p>
          </div>

          {/* STEP 5: KARTU */}
          <div className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 border-4 ${userData.status === 'Diterima' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
               {userData.status === 'Diterima' ? <FileBadge size={18}/> : <span className="text-sm font-bold">5</span>}
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-400">Kartu</p>
          </div>
        </div>
      </div>

      {/* ALERT BOX STATUS */}
      <div className={`border rounded-xl p-6 flex items-start gap-4 mb-8 transition-colors duration-500 ${getStatusColor(userData.status)}`}>
          <div className="p-2 rounded-full bg-white/50">
              {userData.status === 'Ditolak' ? <XCircle size={24} /> : <Megaphone size={24} />}
          </div>
          <div>
              <h4 className="font-bold mb-1">Halo, {userData.nama}!</h4>
              
              {!userData.status && (
                  <p className="text-sm">Anda belum melakukan pendaftaran. Silakan klik tombol di bawah untuk mengisi formulir.</p>
              )}

              {userData.status === 'Menunggu' && !userData.buktiBayar && (
                  <div>
                    <p className="text-sm font-bold mb-1 text-orange-700">Langkah Selanjutnya: Upload Bukti Pembayaran.</p>
                    <p className="text-sm">Data formulir Anda sudah tersimpan. Silakan transfer biaya pendaftaran, lalu upload buktinya agar kami bisa memverifikasi.</p>
                  </div>
              )}

              {userData.status === 'Menunggu' && userData.buktiBayar && (
                  <div>
                    <p className="text-sm font-bold mb-1 text-blue-700">Terima Kasih, Bukti Pembayaran Diterima.</p>
                    <p className="text-sm">
                        Saat ini panitia sedang memverifikasi data dan pembayaran Anda. 
                        <strong> Silakan Hubungi Panitia via WhatsApp untuk mempercepat proses (Akseptasi).</strong>
                    </p>
                  </div>
              )}

              {userData.status === 'Diterima' && (
                  <p className="text-sm">Selamat! Pendaftaran Anda <strong>DITERIMA</strong>. Silakan unduh Kartu Ujian Anda pada menu di samping.</p>
              )}

              {userData.status === 'Ditolak' && (
                  <p className="text-sm">Mohon maaf, pendaftaran Anda <strong>DITOLAK</strong>. Silakan hubungi panitia untuk informasi lebih lanjut.</p>
              )}
          </div>
      </div>

      {/* CALL TO ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tombol Daftar */}
        {!userData.status && (
            <div onClick={onRegisterClick} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <h2 className="text-2xl font-bold mb-2">1. Isi Formulir</h2>
                <p className="text-blue-100 mb-4">Lengkapi biodata diri.</p>
                <button className="bg-white text-blue-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><UserPlus size={18} /> Daftar Sekarang</button>
            </div>
        )}

        {/* Tombol Upload */}
        {userData.status === 'Menunggu' && !userData.buktiBayar && (
            <div onClick={onUploadClick} className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <h2 className="text-2xl font-bold mb-2">2. Upload Bukti</h2>
                <p className="text-orange-100 mb-4">Kirim foto bukti transfer.</p>
                <button className="bg-white text-orange-600 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Upload size={18} /> Upload Sekarang</button>
            </div>
        )}

        {/* Tombol Chat Panitia (Muncul jika sudah upload) */}
        {userData.status === 'Menunggu' && userData.buktiBayar && (
             <div onClick={() => window.open('https://wa.me/6281234567890?text=Halo+Panitia,+saya+sudah+upload+bukti+bayar.+Mohon+dicek.', '_blank')} className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform md:col-span-2">
                <h2 className="text-2xl font-bold mb-2">3. Konfirmasi Panitia</h2>
                <p className="text-green-100 mb-4">Chat admin untuk verifikasi (Fast Response).</p>
                <button className="bg-white text-green-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><MessageCircle size={18} /> Chat WhatsApp</button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- 4. MAIN COMPONENT (USER DASHBOARD) ---
const UserDashboard = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  
  // STATE USER DATA
  const [userData, setUserData] = useState({
    nama: user?.username || "Siswa",
    email: user?.email || "", 
    status: null, 
    asalSekolah: "-", 
    buktiBayar: null, 
    noUjian: "-"
  });

  // --- FETCH DATA USER DARI API ---
  const fetchUserStatus = useCallback(async () => {
    if (!user?.email) return;

    try {
        const response = await fetch(`http://10.5.46.195:5000/api/user-status?email=${user.email}`);
        const data = await response.json();

        if (data.registered) {
            setUserData(prev => ({
                ...prev,
                nama: data.nama,               
                email: data.email || user.email, 
                status: data.status,           
                asalSekolah: data.asalSekolah, 
                noUjian: data.noUjian,
                buktiBayar: data.bukti_pembayaran || null 
            }));
        } else {
            setUserData(prev => ({ 
                ...prev, 
                nama: user.username, 
                email: user.email,
                status: null,
                asalSekolah: "-",
                buktiBayar: null
            }));
        }
    } catch (error) {
        console.error("Gagal ambil status:", error);
    }
  }, [user]);

  // --- AUTO REFRESH ---
  useEffect(() => {
    fetchUserStatus(); 
    const intervalId = setInterval(() => {
        fetchUserStatus(); 
    }, 5000);
    return () => clearInterval(intervalId);
  }, [fetchUserStatus]);

  // --- HANDLERS ---
  const handleDataRefreshOnly = () => {
    fetchUserStatus(); 
  };
  
  const handleUploadSuccess = () => {
      fetchUserStatus();
      // Tetap di halaman upload untuk melihat pesan "Sedang Diverifikasi"
      // Atau pindah ke home, tergantung selera Anda. 
      // setCurrentView('home'); 
  }

  const handleBackToHome = () => {
    fetchUserStatus(); 
    setCurrentView('home');
  };

  const handleLogout = () => { window.location.reload(); };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      <Sidebar isOpen={sidebarOpen} activeMenu={currentView} onMenuClick={setCurrentView} onLogout={handleLogout} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="bg-white h-20 px-8 flex items-center justify-between sticky top-0 z-40 border-b border-slate-100/50 backdrop-blur-sm bg-white/80 print:hidden">
          <div className="flex flex-col"><h2 className="text-xl font-bold text-slate-800">Selamat Pagi, {userData.nama} 👋</h2><p className="text-sm text-slate-500">Siap untuk memulai masa depanmu?</p></div>
          <div className="flex items-center gap-4"><button className="p-2.5 text-slate-400 hover:bg-blue-50 rounded-full"><Bell size={20} /></button><div className="flex items-center gap-3 pl-6 border-l border-slate-200"><div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-300 rounded-full flex items-center justify-center text-white font-bold shadow-md">{userData.nama.substring(0,2).toUpperCase()}</div><div className="hidden md:block"><p className="text-sm font-semibold text-slate-700">{userData.nama}</p><p className="text-xs text-blue-500 font-medium">Calon Siswa</p></div></div></div>
        </header>

        {currentView === 'home' && (
            <DashboardContent 
                onRegisterClick={() => setCurrentView('pendaftaran')} 
                onUploadClick={() => setCurrentView('upload')}
                userData={userData} 
                onRefresh={fetchUserStatus} 
            />
        )}
        
        {currentView === 'pendaftaran' && (
          <div className="animate-fade-in print:hidden">
            <RegistrationForm 
                onSuccess={() => { handleDataRefreshOnly(); setCurrentView('upload'); }} 
                onGoHome={handleBackToHome}
                userData={userData} 
            />
          </div>
        )}

        {/* --- PEMBAYARAN VIEW (Sudah Terintegrasi) --- */}
        {currentView === 'upload' && (
          <div className="p-8 max-w-2xl mx-auto animate-fade-in print:hidden">
              <button onClick={handleBackToHome} className="mb-4 text-slate-500 hover:text-blue-600 flex items-center gap-2">
                  <ChevronRight className="rotate-180" size={20}/> Kembali
              </button>
              
              {/* PERBAIKAN DISINI: Tambahkan prop 'buktiBayar' */}
              <UploadPayment 
                  userEmail={userData.email} 
                  currentStatus={userData.status} 
                  buktiBayar={userData.buktiBayar}  // <--- TAMBAHAN PENTING
                  onUploadSuccess={handleUploadSuccess} 
              />
          </div>
      )}
        {/* ----------------------------- */}

        {currentView === 'kartu' && <ExamCardView userData={userData} />}
      </main>
    </div>
  );
};

export default UserDashboard;