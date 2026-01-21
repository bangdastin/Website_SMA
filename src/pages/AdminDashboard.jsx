import React, { useState, useEffect } from 'react';
import { 
  Users, LogOut, Bell, Search, School, RefreshCw, Loader2, Check, X, AlertTriangle, 
  Trophy, Megaphone, Plus, Trash2, Calendar, ImageIcon, Phone, Edit, FileText, Eye, Download
} from 'lucide-react';
import Footer from '../Footer'; 

const LOCAL_URL = "http://localhost:5000";
const PROD_URL = "https://website-sma-y1ls-4vy3hvenx-bangdastins-projects.vercel.app";
const API_BASE_URL = window.location.hostname === 'localhost' ? LOCAL_URL : PROD_URL; 

// --- KOMPONEN REUSABLE: ALERT ---
const CustomAlert = ({ isOpen, type, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;
  const isConfirm = type === 'confirm';
  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : isError ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
          {isSuccess ? <Check size={32} /> : isError ? <X size={32} /> : <AlertTriangle size={32} />}
        </div>
        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-slate-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          {isConfirm && (
            <button onClick={onCancel} disabled={isLoading} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">Batal</button>
          )}
          <button onClick={onConfirm} disabled={isLoading} className={`flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSuccess ? 'bg-green-600 hover:bg-green-700' : isError ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isConfirm ? 'Ya, Lanjutkan' : 'Tutup')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN REUSABLE: IMAGE MODAL (UNTUK BUKTI BAYAR) ---
const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={onClose}>
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
                    <X size={32} />
                </button>
                <img src={imageUrl} alt="Preview Bukti Bayar" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain bg-white" />
            </div>
        </div>
    );
};

// =================================================================
// MANAGER: PRESTASI 
// =================================================================
const PrestasiManager = ({ showAlert }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({ judul: '', deskripsi: '', tanggal: '', penyelenggara: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/prestasi`);
      if (res.ok) setDataList(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (item) => {
    setFormData({ judul: item.judul, deskripsi: item.deskripsi, tanggal: item.tanggal.split('T')[0], penyelenggara: item.penyelenggara });
    setEditId(item.id);
    setIsEditing(true);
    setShowForm(true);
    setImageFile(null);
  };

  const resetForm = () => {
    setFormData({ judul: '', deskripsi: '', tanggal: '', penyelenggara: '' });
    setImageFile(null);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('deskripsi', formData.deskripsi);
    data.append('tanggal', formData.tanggal);
    data.append('penyelenggara', formData.penyelenggara);
    if (imageFile) data.append('gambar', imageFile);

    try {
      let url = isEditing ? `${API_BASE_URL}/api/prestasi/${editId}` : `${API_BASE_URL}/api/prestasi`;
      let method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showAlert('success', 'Berhasil', isEditing ? 'Prestasi diperbarui' : 'Prestasi ditambahkan');
        resetForm();
        fetchData();
      } else {
        showAlert('error', 'Gagal', 'Terjadi kesalahan server');
      }
    } catch (err) { showAlert('error', 'Error', 'Gagal koneksi server'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = (id) => {
    showAlert('confirm', 'Hapus Prestasi?', 'Data akan dihapus permanen.', async () => {
      try {
        await fetch(`${API_BASE_URL}/api/prestasi/${id}`, { method: 'DELETE' });
        showAlert('success', 'Terhapus', 'Data telah dihapus.');
        fetchData();
      } catch (err) { showAlert('error', 'Error', 'Gagal menghapus data.'); }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Trophy className="text-yellow-500" size={24}/> Daftar Prestasi</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
          {showForm ? <X size={18}/> : <Plus size={18}/>} {showForm ? 'Tutup Form' : 'Tambah'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" className="p-2 border rounded-lg" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} placeholder="Judul Prestasi..." />
            <input required type="date" className="p-2 border rounded-lg" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} />
            <input required type="text" className="p-2 border rounded-lg" value={formData.penyelenggara} onChange={e=>setFormData({...formData, penyelenggara: e.target.value})} placeholder="Penyelenggara..." />
            <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files[0])} className="p-2 border rounded-lg bg-white" />
            <textarea required className="md:col-span-2 p-2 border rounded-lg h-24" value={formData.deskripsi} onChange={e=>setFormData({...formData, deskripsi: e.target.value})} placeholder="Deskripsi..."></textarea>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg">Batal</button>
            <button disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-yellow-50 text-yellow-800 font-bold uppercase text-xs">
            <tr><th className="p-4">No</th><th className="p-4">Judul</th><th className="p-4">Tanggal</th><th className="p-4">Gambar</th><th className="p-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="5" className="p-8 text-center">Memuat...</td></tr> : dataList.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">{idx + 1}</td>
                <td className="p-4 font-bold">{item.judul}<div className="text-xs font-normal text-slate-400">{item.penyelenggara}</div></td>
                <td className="p-4">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                <td className="p-4">{item.gambar ? <div className="w-16 h-10 border rounded overflow-hidden"><img src={`${API_BASE_URL}/uploads/${item.gambar}`} className="w-full h-full object-cover" alt="img"/></div> : '-'}</td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =================================================================
// MANAGER: PENGUMUMAN (DIPERBARUI DENGAN VALIDASI 2MB)
// =================================================================
const PengumumanManager = ({ showAlert }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // State Form
  const [formData, setFormData] = useState({ judul: '', isi: '', tanggal: '' });
  const [pdfFile, setPdfFile] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/pengumuman`);
      if (res.ok) setDataList(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (item) => {
    setFormData({ judul: item.judul, isi: item.isi, tanggal: item.tanggal.split('T')[0] });
    setEditId(item.id);
    setIsEditing(true);
    setShowForm(true);
    setPdfFile(null); 
  };

  const resetForm = () => {
    setFormData({ judul: '', isi: '', tanggal: '' });
    setPdfFile(null);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // --- FUNGSI BARU: VALIDASI UKURAN FILE ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // Validasi: 2MB = 2 * 1024 * 1024 bytes
        const maxSize = 2 * 1024 * 1024; 
        
        if (file.size > maxSize) {
            showAlert('error', 'File Terlalu Besar', 'Maksimal ukuran file PDF adalah 2MB.');
            e.target.value = null; // Reset input file
            setPdfFile(null);
            return;
        }
        setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('isi', formData.isi);
    data.append('tanggal', formData.tanggal);
    if (pdfFile) {
        data.append('file_pdf', pdfFile);
    }

    try {
      let url = isEditing ? `${API_BASE_URL}/api/pengumuman/${editId}` : `${API_BASE_URL}/api/pengumuman`;
      let method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, body: data });

      if (res.ok) {
        showAlert('success', 'Berhasil', isEditing ? 'Pengumuman diperbarui' : 'Pengumuman ditambahkan');
        resetForm();
        fetchData();
      } else {
        showAlert('error', 'Gagal', 'Terjadi kesalahan server');
      }
    } catch (err) { showAlert('error', 'Error', 'Gagal koneksi server'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = (id) => {
    showAlert('confirm', 'Hapus Pengumuman?', 'Data akan dihapus permanen.', async () => {
      try {
        await fetch(`${API_BASE_URL}/api/pengumuman/${id}`, { method: 'DELETE' });
        showAlert('success', 'Terhapus', 'Data telah dihapus.');
        fetchData();
      } catch (err) { showAlert('error', 'Error', 'Gagal menghapus data.'); }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Megaphone className="text-blue-500" size={24}/> Daftar Pengumuman</h3>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
          {showForm ? <X size={18}/> : <Plus size={18}/>} {showForm ? 'Tutup' : 'Tambah'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input required type="text" className="p-2 border rounded-lg" value={formData.judul} onChange={e=>setFormData({...formData, judul: e.target.value})} placeholder="Judul Pengumuman..." />
               <input required type="date" className="p-2 border rounded-lg" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} />
            </div>
            
            {/* INPUT FILE DENGAN VALIDASI */}
            <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload File PDF (Opsional)</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange} 
                        className="w-full p-2 border rounded-lg bg-white text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12}/> Maksimal ukuran file: 2MB. Format: .pdf
                </p>
                {isEditing && !pdfFile && (
                    <p className="text-xs text-orange-500 mt-1">*Biarkan kosong jika tidak ingin mengubah file PDF yang sudah ada.</p>
                )}
            </div>

            <textarea required className="p-2 border rounded-lg h-32" value={formData.isi} onChange={e=>setFormData({...formData, isi: e.target.value})} placeholder="Isi pengumuman lengkap..."></textarea>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded-lg">Batal</button>
            <button disabled={isSubmitting} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? <p className="text-center text-slate-400">Memuat data...</p> : dataList.length === 0 ? <p className="text-center text-slate-400">Belum ada pengumuman.</p> : 
          dataList.map(item => (
            <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-blue-200 transition-colors flex justify-between items-start group">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg">{item.judul}</h4>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Calendar size={10}/> {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.isi}</p>
                    
                    {item.file_pdf && (
                        <div className="mt-3">
                            <a 
                                href={`${API_BASE_URL}/uploads/${item.file_pdf}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <FileText size={16} className="text-red-500"/>
                                <span className="font-medium">Lihat Lampiran PDF</span>
                                <Download size={14} className="ml-1 opacity-50"/>
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg"><Trash2 size={16}/></button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// =================================================================
// SIDEBAR & HEADER
// =================================================================
const Sidebar = ({ isOpen, activeMenu, setActiveMenu, handleLogout }) => {
  const menus = [
    { id: 'pendaftar', name: "Data Pendaftar", icon: Users },
    { id: 'prestasi', name: "Prestasi", icon: Trophy },
    { id: 'pengumuman', name: "Pengumuman", icon: Megaphone },
  ];
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-blue-100 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'} hidden md:block`}>
      <div className="flex items-center justify-center h-16 border-b border-blue-50">
        <div className="bg-blue-600 p-2 rounded-lg"><School className="text-white w-6 h-6" /></div>
        {isOpen && <span className="ml-3 font-bold text-xl text-blue-900">Admin PPDB</span>}
      </div>
      <nav className="p-4 space-y-2">
        {menus.map((menu) => (
          <button key={menu.id} onClick={() => setActiveMenu(menu.id)} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeMenu === menu.id ? 'bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <menu.icon size={20} />{isOpen && <span className="ml-3">{menu.name}</span>}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-blue-50">
        <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-500 hover:bg-red-50 rounded-lg"><LogOut size={20} />{isOpen && <span className="ml-3">Keluar</span>}</button>
      </div>
    </aside>
  );
};

const Header = ({ searchTerm, setSearchTerm, userCount }) => (
  <header className="bg-white h-16 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
    <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full w-96">
      <Search size={18} className="text-blue-400" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari data..." className="bg-transparent border-none outline-none ml-2 text-sm w-full" />
    </div>
    <div className="flex items-center gap-6">
      <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500"><Bell size={20} />{userCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}</button>
      <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
        <div className="text-right hidden md:block"><p className="text-sm font-semibold text-slate-700">Admin</p><p className="text-xs text-slate-500">Panitia</p></div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">AS</div>
      </div>
    </div>
  </header>
);

// =================================================================
// MAIN COMPONENT
// =================================================================
const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('pendaftar'); 
  const [pendaftar, setPendaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertState, setAlertState] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });
  
  // STATE BARU: PREVIEW IMAGE MODAL
  const [previewImage, setPreviewImage] = useState(null);

  const showAlert = (type, title, message, onConfirm = null) => {
    setAlertState({ isOpen: true, type, title, message, onConfirm: () => { if(onConfirm) onConfirm(); setAlertState(prev => ({...prev, isOpen: false})); }});
  };

  const closeAlert = () => setAlertState(prev => ({...prev, isOpen: false}));

  const fetchPendaftar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (res.ok) setPendaftar(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if(activeMenu === 'pendaftar') fetchPendaftar(); }, [activeMenu]);

  const handleStatusChange = (user, status) => {
    showAlert('confirm', 'Konfirmasi', `Ubah status ${user.nama_lengkap} menjadi ${status}?`, async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setPendaftar(prev => prev.map(u => u.id === user.id ? { ...u, status_pendaftaran: status } : u));
                showAlert('success', 'Berhasil', `Status diubah ke ${status}`);
            }
        } catch (error) { showAlert('error', 'Error', "Gagal koneksi server"); }
    });
  };

  const filteredPendaftar = pendaftar.filter(item => {
    const term = searchTerm.toLowerCase();
    return (item.nama_lengkap || '').toLowerCase().includes(term) || (item.asal_sekolah || '').toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      
      {/* GLOBAL MODALS */}
      <CustomAlert {...alertState} onCancel={closeAlert} />
      <ImageModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />

      <Sidebar isOpen={true} activeMenu={activeMenu} setActiveMenu={setActiveMenu} handleLogout={() => { localStorage.removeItem('userApp'); window.location.href='/'; }} />
      <main className="flex-1 flex flex-col md:ml-64 transition-all">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} userCount={pendaftar.length} />
        <div className="p-8 flex-1">
          {activeMenu === 'pendaftar' && (
            <>
                <div className="mb-8 flex justify-between items-center">
                    <div><h1 className="text-2xl font-bold text-slate-800">Data Pendaftar</h1><p className="text-slate-500">Total: <span className="font-bold text-blue-600">{pendaftar.length}</span> Siswa</p></div>
                    <button onClick={fetchPendaftar} className="bg-white border hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2"><RefreshCw size={16} /> Refresh</button>
                </div>
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-blue-50 text-blue-900 font-semibold"><tr><th className="p-4">No</th><th className="p-4">Nama</th><th className="p-4">Asal Sekolah</th><th className="p-4 text-center">Bukti Bayar</th><th className="p-4 text-center">Status</th><th className="p-4 text-center">Aksi</th></tr></thead>
                        <tbody className="divide-y">
                            {loading ? <tr><td colSpan="6" className="p-8 text-center">Memuat...</td></tr> : filteredPendaftar.map((item, i) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-4">{i + 1}</td>
                                <td className="p-4 font-bold">{item.nama_lengkap || item.username}<div className="text-xs font-normal text-slate-400 flex items-center gap-1"><Phone size={10}/> {item.no_telepon || '-'}</div></td>
                                <td className="p-4">{item.asal_sekolah || '-'}</td>
                                
                                {/* KOLOM BUKTI BAYAR - IMAGE THUMBNAIL */}
                                <td className="p-4 text-center">
                                    {item.bukti_pembayaran ? (
                                        <div className="flex justify-center">
                                            <div 
                                                className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all relative group"
                                                onClick={() => setPreviewImage(`${API_BASE_URL}/uploads/${item.bukti_pembayaran}`)}
                                            >
                                                <img 
                                                    src={`${API_BASE_URL}/uploads/${item.bukti_pembayaran}`} 
                                                    alt="Bukti" 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                    <Eye size={16} className="text-white opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded">Belum Upload</span>
                                    )}
                                </td>

                                <td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-xs border ${item.status_pendaftaran === 'Diterima' ? 'bg-green-50 text-green-700 border-green-200' : item.status_pendaftaran === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{item.status_pendaftaran || 'Menunggu'}</span></td>
                                <td className="p-4 text-center flex justify-center gap-2">
                                    <button onClick={() => handleStatusChange(item, 'Diterima')} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Terima"><Check size={16}/></button>
                                    <button onClick={() => handleStatusChange(item, 'Ditolak')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Tolak"><X size={16}/></button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </>
          )}
          {activeMenu === 'prestasi' && <PrestasiManager showAlert={showAlert} />}
          {activeMenu === 'pengumuman' && <PengumumanManager showAlert={showAlert} />}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AdminDashboard;