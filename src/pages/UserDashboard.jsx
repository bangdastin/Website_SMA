import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, UserPlus, LogOut, Bell, CheckCircle2, 
  Printer, FileBadge, AlertTriangle, XCircle, RefreshCw, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

import RegistrationForm from '../components/RegistrationForm'; 

// DEFINISI URL SERVER
const LOCAL_URL = "http://localhost:5000";
const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
const API_BASE_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PROD_URL; 

// --- 1. SIDEBAR COMPONENT ---
const Sidebar = ({ isOpen, activeMenu, onMenuClick, onLogout }) => {
  const menus = [
    { name: "Home", id: "home", icon: Home },
    { name: "Pendaftaran", id: "pendaftaran", icon: UserPlus },
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-fade-in font-sans">
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
        <div className="p-4 md:p-8 flex flex-col items-center animate-fade-in bg-slate-50 min-h-screen">
            <div className="w-full max-w-[21cm] flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800 font-sans">Pratinjau Kartu</h2>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-lg flex items-center gap-2 font-sans transition-all">
                    <Printer size={18} /> Cetak Kartu (PDF)
                </button>
            </div>

            <div id="print-area" className="bg-white w-full max-w-[21cm] p-8 md:p-12 shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 text-black font-serif relative">
                <div className="flex items-center justify-center border-b-[3px] border-black pb-4 mb-2 gap-4">
                    <div className="w-[80px] h-auto flex-shrink-0">
                        <img src="../src/assets/Coat_of_arms_of_North_Sumatra.svg" alt="Logo Sumut" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center flex-1 leading-tight">
                        <h3 className="text-[14px] font-medium tracking-wide">PEMERINTAH PROVINSI SUMATERA UTARA</h3>
                        <h2 className="text-[18px] font-bold">DINAS PENDIDIKAN</h2>
                        <h1 className="text-[22px] font-black tracking-wider my-1">SMA NEGERI 2 LINTONGNIHUTA</h1>
                        <p className="text-[11px] font-normal">Jalan Letjend. TB. Simatupang, Desa Siponjot – Silaban, Kec. Lintongnihuta,</p>
                        <p className="text-[11px] font-normal">Kab. Humbang Hasundutan, Cabdisdik Wil. IX Kode Pos 22475</p>
                        <p className="text-[11px] text-blue-800 underline">Pos-el sman2lintongnihuta@gmail.com Laman : www.sman2lintongnihuta.sch.id</p>
                    </div>
                </div>
                <div className="border-t border-black mb-6 w-full h-1"></div>

                <div className="text-center mb-8">
                    <h2 className="text-[16px] font-bold uppercase tracking-wide">KARTU PENDAFTARAN SELEKSI PENERIMAAN PESERTA DIDIK BARU</h2>
                    <h3 className="text-[16px] font-bold uppercase">SMA NEGERI 2 LINTONGNIHUTA</h3>
                    <h3 className="text-[16px] font-bold">TAHUN PELAJARAN 2026/2027</h3>
                </div>

                <div className="pl-4 mb-6 text-[14px]">
                    <table className="w-full">
                        <tbody>
                            <tr><td className="w-[180px] py-1">NOMOR PESERTA</td><td className="py-1 font-bold">: {userData.no_ujian || '26-02-00001'}</td></tr>
                            <tr><td className="py-1">NAMA</td><td className="py-1 uppercase">: {userData.nama_lengkap}</td></tr>
                            <tr><td className="py-1">ASAL SEKOLAH</td><td className="py-1 uppercase">: {userData.asal_sekolah}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="pl-4 mb-10 text-[14px]">
                    <h4 className="font-bold underline mb-2">CATATAN:</h4>
                    <ul className="list-none space-y-1">
                        <li className="flex items-start gap-3"><span>□</span><div>Perlengkapan yang harus dibawa pada saat ujian:<ul className="list-disc ml-5 mt-1"><li>Kartu Ujian</li><li>Pensil 2B secukupnya, karet penghapus, raut pensil</li><li>Papan Ujian</li></ul></div></li>
                        <li className="flex items-start gap-3"><span>□</span> <span>Peserta wajib memakai seragam SMP (lengkap) selama mengikuti proses ujian.</span></li>
                        <li className="flex items-start gap-3"><span>□</span> <span>Peserta wajib hadir 30 (tiga puluh) menit sebelum ujian dimulai.</span></li>
                    </ul>
                </div>

                <div className="flex justify-between items-end px-4 mb-12">
                    <div className="w-32 h-40 border-2 border-black flex flex-col items-center justify-center text-center overflow-hidden">
                        {userData.pas_foto ? (
                            <img src={`${API_BASE_URL}/uploads/${userData.pas_foto}`} alt="Pas Foto" className="w-full h-full object-cover" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/113x151?text=No+Img';}} />
                        ) : (<><span className="font-bold text-lg block">Pas</span><span className="font-bold text-lg block">Foto</span><span className="text-sm mt-2 text-gray-500">3 x 4</span></>)}
                    </div>
                    <div className="w-64 text-left relative">
                        <div className="mb-1">Lintongnihuta, <span className="border-b border-dotted border-black min-w-[80px] inline-block text-center">Maret 2026</span></div>
                        <div className="mb-20 font-bold">Kepala SMA Negeri 2 Lintongnihuta</div>
                        <div className="font-bold underline">SAHALA SINAGA, M.Pd.</div>
                        <div className="">NIP. 19741106 200604 1 008</div>
                    </div>
                </div>

                 <div className="pt-6 border-t border-dashed border-slate-400 text-[13px] font-mono">
                    <h4 className="font-bold underline mb-2">Catatan:</h4>
                    <div className="grid gap-1">
                         <div className="flex"><span className="w-32">No Peserta</span>: {userData.no_ujian || '26-02-00001'}</div>
                    </div>
                 </div>
            </div>
        </div>
    );
}

// --- 3. DASHBOARD CONTENT (HOME) ---
const DashboardContent = ({ onRegisterClick, userData, onRefresh }) => {
  const getStatusColor = (status) => {
    if (status === 'Diterima') return 'bg-green-50 border-green-200';
    if (status === 'Ditolak') return 'bg-red-50 border-red-200';
    if (status === 'Menunggu') return 'bg-blue-50 border-blue-200';
    return 'bg-white border-slate-200';
  };

  const getProgressWidth = () => {
      if (userData.status === 'Diterima') return 'w-full'; 
      if (userData.status === 'Ditolak') return 'w-3/4'; 
      if (userData.status === 'Menunggu') return 'w-2/4'; 
      if (userData.status) return 'w-1/4'; 
      return 'w-[5%]'; 
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in print:hidden">
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Progres Pendaftaran</h3>
            <button onClick={onRefresh} className="text-slate-400 hover:text-blue-600 transition-colors" title="Refresh Status"><RefreshCw size={20} /></button>
        </div>
        <div className="relative flex justify-between items-center px-2 md:px-6">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className={`absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-1000 ${getProgressWidth()}`}></div>
          {['Akun', 'Formulir', 'Verifikasi', 'Kartu'].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center z-10 transition-colors ${idx === 0 || userData.status ? 'bg-blue-600 text-white' : 'bg-white border-4 border-slate-200 text-slate-400'}`}><CheckCircle2 size={18}/></div>
                  <p className="text-xs md:text-sm font-semibold text-slate-600">{step}</p>
              </div>
          ))}
        </div>
      </div>

      <div className={`border rounded-xl p-6 flex items-start gap-4 mb-8 transition-colors duration-500 ${getStatusColor(userData.status)}`}>
          <div className="p-2 rounded-full bg-white/60">
              {userData.status === 'Ditolak' ? <XCircle size={24} className="text-red-500"/> : <Lock size={24} className="text-blue-500"/>}
          </div>
          <div>
              <h4 className="font-bold mb-1 text-slate-800">Halo, {userData.nama_lengkap || userData.username}!</h4>
              {!userData.status && <p className="text-sm text-slate-600">Anda belum melakukan pendaftaran. Silakan klik tombol di bawah untuk mengisi formulir.</p>}
              {userData.status === 'Menunggu' && <div><p className="text-sm font-bold mb-1 text-blue-700">Formulir Terkirim.</p><p className="text-sm text-slate-600">Data Anda sudah masuk dan sedang diverifikasi oleh panitia.</p></div>}
              {userData.status === 'Diterima' && <p className="text-sm text-green-700">Selamat! Pendaftaran Anda <strong>DITERIMA</strong>. Silakan unduh Kartu Ujian Anda pada menu di samping.</p>}
              {userData.status === 'Ditolak' && <div><p className="text-sm font-bold text-red-700 mb-1">Mohon Maaf, Pendaftaran Ditolak.</p><p className="text-sm text-red-600">Silakan perbaiki data pada formulir.</p></div>}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!userData.status || userData.status === 'Belum' || userData.status === 'Ditolak') && (
            <div onClick={onRegisterClick} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <h2 className="text-2xl font-bold mb-2">{userData.status === 'Ditolak' ? 'Perbaiki Formulir' : '1. Isi Formulir'}</h2>
                <p className="text-blue-100 mb-4">{userData.status === 'Ditolak' ? 'Klik disini untuk memperbaiki data Anda.' : 'Lengkapi biodata diri.'}</p>
                <button className="bg-white text-blue-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><UserPlus size={18} /> {userData.status === 'Ditolak' ? 'Perbaiki Sekarang' : 'Daftar Sekarang'}</button>
            </div>
        )}
      </div>
    </div>
  );
};

// --- 4. MAIN COMPONENT (USER DASHBOARD) ---
const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  
  // State untuk menyimpan FULL DATA profil user
  const [userData, setUserData] = useState({
    id: null,
    username: "",
    email: "", 
    status: null, 
  });

  const fetchUserStatus = useCallback(async () => {
    const storedUser = JSON.parse(localStorage.getItem('userApp'));
    if (!storedUser || !storedUser.id) { navigate('/auth'); return; }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${storedUser.id}`);
        if (response.ok) {
            const freshData = await response.json();
            // Simpan SEMUA data dari DB ke state agar bisa dilempar ke RegistrationForm
            setUserData({
                ...freshData, // Spread semua field
                status: freshData.status_pendaftaran, // Mapping status
            });
            localStorage.setItem('userApp', JSON.stringify({ ...storedUser, ...freshData }));
        } else if (response.status === 404) {
            localStorage.removeItem('userApp');
            navigate('/auth');
        }
    } catch (error) { console.error("Gagal koneksi:", error); }
  }, [navigate]);

  useEffect(() => { fetchUserStatus(); }, [fetchUserStatus]);

  const handleDataRefreshOnly = () => { fetchUserStatus(); };
  const handleBackToHome = () => { fetchUserStatus(); setCurrentView('home'); };
  const handleLogout = () => { localStorage.removeItem('userApp'); navigate('/'); };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      <Sidebar isOpen={sidebarOpen} activeMenu={currentView} onMenuClick={setCurrentView} onLogout={handleLogout} />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <header className="bg-white h-20 px-8 flex items-center justify-between sticky top-0 z-40 border-b border-slate-100/50 backdrop-blur-sm bg-white/80 print:hidden">
          <div className="flex flex-col"><h2 className="text-xl font-bold text-slate-800">Selamat Pagi, {userData.nama_lengkap || userData.username} 👋</h2><p className="text-sm text-slate-500">Siap untuk memulai masa depanmu?</p></div>
          <div className="flex items-center gap-4"><button className="p-2.5 text-slate-400 hover:bg-blue-50 rounded-full"><Bell size={20} /></button><div className="flex items-center gap-3 pl-6 border-l border-slate-200"><div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-300 rounded-full flex items-center justify-center text-white font-bold shadow-md">{(userData.nama_lengkap || "User").substring(0,2).toUpperCase()}</div><div className="hidden md:block"><p className="text-sm font-semibold text-slate-700">{userData.nama_lengkap || userData.username}</p><p className="text-xs text-blue-500 font-medium">Calon Siswa</p></div></div></div>
        </header>

        {currentView === 'home' && <DashboardContent onRegisterClick={() => setCurrentView('pendaftaran')} userData={userData} onRefresh={fetchUserStatus} />}
        
        {currentView === 'pendaftaran' && (
          <div className="animate-fade-in print:hidden">
            {/* Logic: Jika Status SUDAH Menunggu/Diterima, Tampilkan Lock Screen. Jika Ditolak, Tampilkan Form Lagi untuk Edit */}
            {userData.status && userData.status !== 'Belum' && userData.status !== 'Ditolak' ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white m-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-yellow-100 text-yellow-600"><Lock size={40} /></div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Anda Sudah Terdaftar</h2>
                    <p className="text-slate-500 max-w-md mb-6">Data Anda sedang dalam proses verifikasi. Tidak perlu mengisi formulir lagi.</p>
                    <div className="inline-flex px-4 py-2 bg-slate-100 rounded-lg text-slate-600 font-medium text-sm">Status: <span className="ml-1 font-bold text-blue-600">{userData.status}</span></div>
                    <button onClick={() => setCurrentView('home')} className="mt-8 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">Kembali ke Dashboard</button>
                </div>
            ) : (
                <RegistrationForm onSuccess={() => { handleDataRefreshOnly(); handleBackToHome(); }} onGoHome={handleBackToHome} userData={userData} />
            )}
          </div>
        )}
        {currentView === 'kartu' && <ExamCardView userData={userData} />}
      </main>
    </div>
  );
};

export default UserDashboard;