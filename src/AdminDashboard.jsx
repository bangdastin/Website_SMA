import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, LogOut, Bell, Search, FileText, School, Phone, RefreshCw, Loader2, Check, X, AlertTriangle, Image as ImageIcon
} from 'lucide-react';

// --- KONFIGURASI IP (PENTING) ---
// Pastikan ini sama dengan yang ada di server.js dan UploadPayment.jsx
//const API_BASE_URL = "http://10.5.46.195:5000"; 
// 1. Link Vercel Anda
const VERCEL_BACKEND_URL = "https:/website-sma-bangdastins-projects.vercel.app"

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? VERCEL_BACKEND_URL // <--- Jika di Laptop, tembak langsung ke Online
  : "";
// --- 1. SIDEBAR ---
const Sidebar = ({ isOpen }) => {
  const menus = [
    { name: "Data Pendaftar", icon: Users, active: true },
    { name: "Laporan", icon: FileText, active: false },
    { name: "Pengaturan", icon: Settings, active: false },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-blue-100 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'} hidden md:block`}>
      <div className="flex items-center justify-center h-16 border-b border-blue-50">
        <div className="bg-blue-600 p-2 rounded-lg">
          <School className="text-white w-6 h-6" />
        </div>
        {isOpen && <span className="ml-3 font-bold text-xl text-blue-900">Admin PPDB</span>}
      </div>
      <nav className="p-4 space-y-2">
        {menus.map((menu, index) => (
          <button key={index} className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${menu.active ? 'bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}>
            <menu.icon size={20} />
            {isOpen && <span className="ml-3">{menu.name}</span>}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-blue-50">
        <button className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
          {isOpen && <span className="ml-3 font-medium">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

// --- 2. HEADER ---
const Header = ({ searchTerm, setSearchTerm, userCount }) => (
  <header className="bg-white h-16 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
    <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full w-96">
      <Search size={18} className="text-blue-400" />
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cari nama, username, atau sekolah..." 
        className="bg-transparent border-none outline-none ml-2 text-sm text-slate-600 w-full placeholder-blue-300"
      />
    </div>
    <div className="flex items-center gap-6">
      <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500">
        <Bell size={20} />
        {userCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
      </button>
      <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-700">Admin Sekolah</p>
          <p className="text-xs text-slate-500">Panitia PPDB</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">AS</div>
      </div>
    </div>
  </header>
);

// --- 3. MODAL KONFIRMASI ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, type, userName, isProcessing }) => {
  if (!isOpen) return null;
  const isApprove = type === 'Diterima';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all scale-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${isApprove ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isApprove ? <Check size={28} /> : <AlertTriangle size={28} />}
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{isApprove ? 'Terima Pendaftaran?' : 'Tolak Pendaftaran?'}</h3>
        <p className="text-slate-500 text-center text-sm mb-6">
          Ubah status <strong>{userName}</strong> menjadi <span className={`font-bold ml-1 ${isApprove ? 'text-green-600' : 'text-red-600'}`}>{isApprove ? 'DITERIMA' : 'DITOLAK'}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">Batal</button>
          <button onClick={onConfirm} disabled={isProcessing} className={`flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 ${isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Ya, Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. MAIN COMPONENT ---
const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState({ id: null, name: '', status: '' });
  const [processingId, setProcessingId] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data Admin:", data); // Debugging

      if (Array.isArray(data)) {
        setPendaftar(data);
      } else {
        setPendaftar([]);
      }
    } catch (error) { 
      console.error("Error fetching data:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLER MODAL ---
  const handleOpenModal = (user, status) => {
    // Gunakan nama_lengkap, jika kosong pakai username
    const displayName = user.nama_lengkap || user.username || "Siswa";
    setSelectedAction({ id: user.id, name: displayName, status: status });
    setModalOpen(true);
  };

  // --- EKSEKUSI UPDATE STATUS ---
  const executeUpdateStatus = async () => {
    const { id, status } = selectedAction;
    setProcessingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status }),
      });
      if (response.ok) {
        // Update UI Lokal tanpa fetch ulang biar cepat
        setPendaftar(prev => prev.map(user => user.id === id ? { ...user, status_pendaftaran: status } : user));
        setModalOpen(false);
      } else { 
        alert("Gagal mengubah status di server."); 
      }
    } catch (error) { 
      alert("Terjadi kesalahan koneksi."); 
    } finally { 
      setProcessingId(null); 
    }
  };

  // --- FILTER SEARCH (ANTI ERROR NULL) ---
  const filteredData = pendaftar.filter(item => {
    const nama = item.nama_lengkap || item.username || "";
    const sekolah = item.asal_sekolah || "";
    const search = searchTerm.toLowerCase();
    
    return nama.toLowerCase().includes(search) || sekolah.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      
      <ConfirmationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={executeUpdateStatus} 
        type={selectedAction.status} 
        userName={selectedAction.name} 
        isProcessing={processingId !== null} 
      />

      <Sidebar isOpen={sidebarOpen} />
      
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} userCount={pendaftar.length} />
        
        <div className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Data Pendaftar Masuk</h1>
                <p className="text-slate-500 mt-1">Total siswa terdaftar: <span className="font-bold text-blue-600">{pendaftar.length}</span> Siswa</p>
            </div>
            <button onClick={fetchData} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <RefreshCw size={16} /> Refresh Data
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Daftar Siswa Baru</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">Export Excel</button>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={30} className="animate-spin text-blue-500 mb-2"/>
                    <p>Memuat data...</p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-10 text-center text-slate-400">Data tidak ditemukan / Server belum terhubung.</div>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-blue-50 text-blue-900 font-semibold">
                    <tr>
                      <th className="p-4">No</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Asal Sekolah</th>
                      <th className="p-4 text-center">Bukti Bayar</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium">{index + 1}</td>
                        
                        {/* KOLOM NAMA (Handle jika kosong) */}
                        <td className="p-4">
                          <div className="font-bold text-slate-700">
                              {item.nama_lengkap || item.username} 
                              {!item.nama_lengkap && <span className="ml-2 text-[10px] bg-gray-200 px-1 rounded text-gray-500">Akun Baru</span>}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <Phone size={10}/> {item.no_telepon || "-"}
                          </div>
                        </td>

                        {/* KOLOM SEKOLAH */}
                        <td className="p-4">
                            <div className="flex items-center gap-2">
                                <School size={14} className="text-blue-400" />
                                {item.asal_sekolah || <span className="text-slate-300 italic">Belum diisi</span>}
                            </div>
                        </td>
                        
                        {/* KOLOM BUKTI BAYAR */}
                        <td className="p-4 text-center">
                            {item.bukti_pembayaran ? (
                                <a href={`${API_BASE_URL}/uploads/${item.bukti_pembayaran}`} target="_blank" rel="noreferrer" className="inline-block border rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all">
                                    <img 
                                        src={`${API_BASE_URL}/uploads/${item.bukti_pembayaran}`} 
                                        alt="Bukti" 
                                        className="w-12 h-12 object-cover"
                                        onError={(e) => {e.target.style.display='none'}} // Sembunyikan jika error load
                                    />
                                </a>
                            ) : (
                                <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-1 rounded">Belum Upload</span>
                            )}
                        </td>

                        {/* KOLOM STATUS */}
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border 
                            ${item.status_pendaftaran === 'Diterima' ? 'bg-green-50 text-green-700 border-green-200' : 
                              item.status_pendaftaran === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {item.status_pendaftaran || 'Menunggu'}
                          </span>
                        </td>

                        {/* KOLOM AKSI */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleOpenModal(item, 'Diterima')} className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors" title="Terima"><Check size={16} /></button>
                            <button onClick={() => handleOpenModal(item, 'Ditolak')} className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors" title="Tolak"><X size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;