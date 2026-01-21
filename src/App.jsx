import React, { useEffect } from 'react'; // Tambahkan useEffect
import { Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT KOMPONEN UI ---
// Karena Anda bilang file ini ada di folder src (sejajar dengan App.jsx),
// maka importnya pakai './' saja.
import Navbar from './Navbar';
import Footer from './Footer';

// --- IMPORT HALAMAN ---
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

// --- IMPORT BAGIAN (SECTIONS) ---
// Asumsi file ini masih ada di folder components
import VisiMisi from './components/VisiMisi';
import Struktur from './components/Struktur';
import Prestasi from './components/Prestasi';
import Pengumuman from './components/Pengumuman';

// --- IMPORT LOGO UNTUK TAB BROWSER ---
// Ganti 'logo-sekolah.png' sesuai nama file logo asli Anda di folder src/assets
import faviconLogo from './assets/logo sekolah.jpeg'; 

// =================================================================
// 1. LAYOUT PUBLIK (Navbar + Footer)
// =================================================================
const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar akan muncul di atas */}
      <Navbar />
      
      {/* Padding top 80px agar konten tidak tertutup Navbar Fixed */}
      <main className="flex-grow pt-24 bg-slate-50">
        {children}
      </main>
      
      {/* Footer akan muncul di bawah */}
      <Footer />
    </div>
  );
};

// =================================================================
// 2. LAYOUT SEDERHANA (Hanya Footer)
// =================================================================
const SimpleLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// --- WRAPPER UNTUK AUTH PAGE ---
const AuthPageWrapper = () => {
  return <AuthPage />;
};

function App() {

  // =================================================================
  // LOGIKA GANTI ICON TAB & JUDUL WEB
  // =================================================================
  useEffect(() => {
    // 1. Ganti Judul Tab
    document.title = "SMA Negeri 2 Lintongnihuta";

    // 2. Ganti Icon (Favicon)
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    // Set gambar icon ke file yang kita import dari assets
    link.href = faviconLogo;
  }, []);


  return (
    <Routes>
      
      {/* --- KELOMPOK 1: PUBLIK (Pakai Navbar & Footer) --- */}
      <Route path="/" element={
        <PublicLayout>
          <LandingPage />
        </PublicLayout>
      } />

      <Route path="/visi-misi" element={
        <PublicLayout>
          <VisiMisi />
        </PublicLayout>
      } />

      <Route path="/struktur" element={
        <PublicLayout>
          <Struktur />
        </PublicLayout>
      } />

      <Route path="/prestasi" element={
        <PublicLayout>
          <Prestasi />
        </PublicLayout>
      } />

      <Route path="/pengumuman" element={
        <PublicLayout>
          <Pengumuman />
        </PublicLayout>
      } />


      {/* --- KELOMPOK 2: KHUSUS (Tanpa Navbar, Hanya Footer) --- */}
      
      <Route path="/auth" element={
        <SimpleLayout>
          <AuthPageWrapper />
        </SimpleLayout>
      } />

      <Route path="/dashboard" element={
        <SimpleLayout>
          <UserDashboard />
        </SimpleLayout>
      } />

      {/* Admin Dashboard (Tanpa Layout karena sudah punya Sidebar sendiri) */}
      <Route path="/admin" element={<AdminDashboard />} />


      {/* --- REDIRECT 404 --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
      
    </Routes>
  );
}

export default App;