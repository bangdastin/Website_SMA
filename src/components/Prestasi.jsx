import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Calendar, User, ImageIcon, X, Award } from 'lucide-react';

const Prestasi = () => {
  const [prestasiList, setPrestasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Detail
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
    const fetchPrestasi = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/prestasi`);
        if (response.ok) {
          const data = await response.json();
          // Ambil 3 prestasi terbaru saja untuk ditampilkan di Home
          setPrestasiList(data.slice(0, 3)); 
        }
      } catch (error) {
        console.error("Gagal mengambil data prestasi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestasi();
  }, []);

  // Fungsi Format Tanggal Indonesia (20 Januari 2026)
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Handler menutup modal jika klik overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedItem(null);
    }
  };

  return (
    <section id="prestasi" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Prestasi Siswa</h2>
            <p className="text-slate-500 mt-2">Bukti nyata dedikasi dan kerja keras siswa kami.</p>
          </div>
          <button className="hidden md:flex text-blue-600 font-bold items-center gap-2 hover:gap-3 transition-all">
            Lihat Semua <ArrowRight size={16}/>
          </button>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
           <div className="text-center py-20 text-slate-400 animate-pulse">Memuat data prestasi...</div>
        ) : prestasiList.length === 0 ? (
           <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
              Belum ada data prestasi yang diinput.
           </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {prestasiList.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)} // KLIK MEMBUKA MODAL
                className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
              >
                
                {/* --- BAGIAN GAMBAR / IMAGE --- */}
                <div className="h-52 bg-slate-200 relative overflow-hidden">
                  {item.gambar ? (
                    <img 
                      src={`${API_BASE_URL}/uploads/${item.gambar}`} 
                      alt={item.judul} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400?text=No+Image"; }} 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                      <Trophy size={64} className="opacity-50" />
                    </div>
                  )}
                  
                  {/* Badge Tanggal */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                    <Calendar size={12} className="text-blue-600"/>
                    {formatDate(item.tanggal)}
                  </div>
                </div>

                {/* --- BAGIAN KONTEN TEKS --- */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {item.penyelenggara || 'Sekolah'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {item.judul}
                  </h3>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow">
                    {item.deskripsi}
                  </p>

                  <div className="pt-4 border-t border-slate-50 mt-auto">
                    <button className="text-sm font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                      Baca Selengkapnya <ArrowRight size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* MODAL / POPUP DETAIL PRESTASI */}
      {/* ======================================================= */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleOverlayClick}
        >
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Tombol Close */}
            <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            >
                <X size={20} />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto">
                
                {/* Header Gambar Besar */}
                <div className="h-64 sm:h-80 w-full bg-slate-100 relative">
                    {selectedItem.gambar ? (
                        <img 
                            src={`${API_BASE_URL}/uploads/${selectedItem.gambar}`} 
                            alt={selectedItem.judul} 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                            <Trophy size={80} className="mb-2 opacity-50"/>
                            <span className="text-sm font-medium">Tidak ada gambar</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                        <span className="inline-block bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                            PRESTASI MEMBANGGAKAN
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight shadow-sm">
                            {selectedItem.judul}
                        </h3>
                    </div>
                </div>

                {/* Detail Content */}
                <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                            <Calendar size={16} className="text-blue-500"/>
                            <span>Tanggal: <span className="font-semibold text-slate-800">{formatDate(selectedItem.tanggal)}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                            <Award size={16} className="text-yellow-500"/>
                            <span>Penyelenggara: <span className="font-semibold text-slate-800">{selectedItem.penyelenggara || '-'}</span></span>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                        <p>{selectedItem.deskripsi}</p>
                    </div>
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

export default Prestasi;