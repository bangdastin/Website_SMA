import React from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

// HAPUS IMPORT NAVBAR & FOOTER DARI SINI
// KARENA SUDAH DIURUS OLEH APP.JSX

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- HERO SECTION --- */}
      {/* Saya kurangi padding-top (pt) sedikit karena di Layout App.jsx sudah ada padding */}
      <section id="home" className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
              Penerimaan Siswa Baru 2026/2027
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Wujudkan Masa Depan <span className="text-blue-600">Gemilang</span> Bersama Kami
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              Bergabunglah dengan SMA Unggulan. Kami mencetak generasi berkarakter, berprestasi, dan siap bersaing di era global.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/auth" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 text-center flex justify-center items-center"
              >
                Daftar Sekarang
              </Link>
              
              <Link 
                to="/visi-misi" 
                className="px-8 py-4 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex justify-center items-center"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl text-white h-[500px] flex flex-col justify-center items-center text-center transform rotate-1 hover:rotate-0 transition-all duration-500">
               <GraduationCap size={120} className="mb-6 opacity-90" />
               <h3 className="text-2xl font-bold mb-2">SMA Unggulan</h3>
               <p className="text-blue-100">Mencerdaskan Kehidupan Bangsa</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER JUGA SUDAH DIHAPUS DARI SINI */}
    </div>
  );
};

export default LandingPage;