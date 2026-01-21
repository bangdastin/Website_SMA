import React, { useState } from 'react';
import { Menu, X, ArrowRight, GraduationCap, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-800">SMA <span className="text-blue-600">Negeri 2 Lintongnihuta</span></span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex space-x-1 items-center">
            <Link to="/" className="px-4 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            
            {/* Dropdown Tentang */}
            <div className="relative group px-4 py-2">
              <button className="flex items-center gap-1 text-slate-600 group-hover:text-blue-600 font-medium transition-colors">
                Tentang <ChevronDown size={16} />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left">
                  <Link to="/visi-misi" className="block w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-xl">Visi & Misi</Link>
                  <Link to="/struktur" className="block w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 last:rounded-b-xl">Struktur Organisasi</Link>
              </div>
            </div>

            <Link to="/prestasi" className="px-4 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">Prestasi</Link>
            <Link to="/pengumuman" className="px-4 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">Pengumuman</Link>
          </div>

          {/* CTA BUTTON (Desktop) */}
          <div className="hidden md:flex">
            {/* PENTING: Gunakan () => navigate(...) untuk mencegah infinite loop */}
            <button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center gap-2">
              Daftar Siswa Baru <ArrowRight size={18} />
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full h-screen overflow-y-auto pb-20">
          <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-blue-50 rounded-lg">Home</Link>
            <Link to="/visi-misi" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-blue-50 rounded-lg">Visi Misi</Link>
            <Link to="/struktur" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-blue-50 rounded-lg">Struktur</Link>
            <Link to="/prestasi" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-blue-50 rounded-lg">Prestasi</Link>
            <Link to="/pengumuman" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-blue-50 rounded-lg">Pengumuman</Link>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button onClick={() => {navigate('/auth'); setIsMobileMenuOpen(false);}} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                Daftar Sekarang <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;