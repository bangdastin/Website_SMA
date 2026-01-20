import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Bell, X, Clock } from 'lucide-react';

const Pengumuman = () => {
  const [pengumumanList, setPengumumanList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk menyimpan pengumuman yang sedang dibuka (Modal)
  const [selectedItem, setSelectedItem] = useState(null);

  // =================================================================
  // 1. KONFIGURASI URL SERVER
  // =================================================================
  const LOCAL_URL = "http://localhost:5000";
  const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? LOCAL_URL 
    : PROD_URL; 

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/pengumuman`);
        if (response.ok) {
          const data = await response.json();
          setPengumumanList(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Gagal mengambil data pengumuman:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPengumuman();
  }, []);

  // Fungsi Format Tanggal untuk Badge (JAN 25)
  const formatDateBadge = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    const day = date.getDate();
    return { month, day };
  };

  // Fungsi Format Tanggal Lengkap untuk Modal (Senin, 25 Januari 2026)
  const formatDateFull = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Handler untuk menutup modal jika klik di luar box
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
    }
  };

  return (
    <section id="pengumuman" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4 animate-bounce">
            <Bell size={24} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Pengumuman Terbaru</h2>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
            Klik pada salah satu pengumuman untuk melihat detail lengkapnya.
          </p>
        </div>

        {/* Content List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          
          {loading ? (
            <div className="text-center py-12 text-slate-400">
                <p className="animate-pulse">Sedang memuat pengumuman...</p>
            </div>
          ) : pengumumanList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                Belum ada pengumuman terbaru.
            </div>
          ) : (
            pengumumanList.map((item) => {
              const { month, day } = formatDateBadge(item.tanggal);
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)} // KLIK DISINI MEMBUKA MODAL
                  className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start sm:items-center transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* Tanggal Badge */}
                  <div className="flex-shrink-0 bg-blue-50 text-blue-600 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <span className="text-xs font-bold uppercase tracking-wider">{month}</span>
                    <span className="text-2xl font-extrabold">{day}</span>
                  </div>

                  {/* Isi Konten Preview */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.judul}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {item.isi}
                    </p>
                  </div>

                  {/* Tombol Panah */}
                  <button className="flex-shrink-0 text-slate-400 hover:text-blue-600 transition-colors self-end sm:self-center p-2 rounded-full hover:bg-blue-50">
                    <ArrowRight size={20} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        {!loading && pengumumanList.length > 0 && (
            <div className="text-center mt-10">
                <button className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                    Lihat Arsip Pengumuman <ArrowRight size={16}/>
                </button>
            </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* MODAL / POPUP DETAIL PENGUMUMAN */}
      {/* ======================================================= */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleOverlayClick}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-blue-600 p-6 relative">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-3">
                <Calendar size={16} />
                <span>Pengumuman Sekolah</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {selectedItem.judul}
              </h3>
            </div>

            {/* Body Modal (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 border-b border-slate-100 pb-4">
                <Clock size={16} className="text-blue-500" />
                <span>Diposting pada: <span className="font-semibold text-slate-700">{formatDateFull(selectedItem.tanggal)}</span></span>
              </div>

              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedItem.isi}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default Pengumuman;