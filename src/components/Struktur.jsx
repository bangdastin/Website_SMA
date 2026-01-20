import React from 'react';
import { User, Users, BookOpen, Settings, Briefcase, GraduationCap, Phone } from 'lucide-react';

// --- KOMPONEN KARTU ---
const OrgCard = ({ title, subtitle, type = 'standard', icon: Icon, width = "w-48", children }) => {
  // Style berdasarkan tipe
  // PENTING: Semua kartu diberi z-20 agar berada DI ATAS garis
  const styles = {
    head: "bg-blue-900 text-white border-blue-900 shadow-xl z-20", 
    wakasek: "bg-white text-slate-800 border-l-4 border-blue-600 shadow-md hover:shadow-lg z-20", 
    dashed: "bg-white text-slate-700 border-2 border-dashed border-slate-500 shadow-sm z-20", 
    list: "bg-white text-slate-800 border border-slate-300 shadow-md text-left z-20", 
    standard: "bg-white text-slate-700 border border-slate-300 shadow-sm hover:shadow-md z-20" 
  };

  const currentStyle = styles[type] || styles.standard;

  if (type === 'list') {
    return (
      <div className={`relative flex flex-col ${width} rounded-lg overflow-hidden ${currentStyle}`}>
        <div className="bg-slate-200 text-slate-700 py-1.5 px-3 text-xs font-bold uppercase text-center border-b border-slate-300">
          {title}
        </div>
        <div className="p-3 text-[11px] font-medium space-y-1">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all ${width} ${currentStyle} min-h-[60px]`}>
      {Icon && type === 'head' && <Icon size={20} className="mb-1 text-blue-200" />}
      <h4 className="text-xs md:text-sm font-bold uppercase text-center leading-tight">
        {title}
      </h4>
      {subtitle && <p className="text-[10px] mt-1 font-medium opacity-80">{subtitle}</p>}
    </div>
  );
};

// --- GARIS PENGHUBUNG ---
const VLine = ({ h = "h-8", border = "border-l-2 border-slate-800" }) => <div className={`mx-auto w-0 ${h} ${border}`}></div>;

const Struktur = () => {
  return (
    <section id="struktur" className="py-16 bg-slate-50 font-sans">
      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase">Struktur Organisasi SMA Negeri 2 Lintongnihuta</h2>
          <p className="text-blue-700 font-bold text-lg mt-1">T.P. 2021/2022</p>
        </div>

        {/* --- BAGAN UTAMA --- */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 overflow-x-auto custom-scrollbar">
          
          <div className="min-w-[1100px] relative flex flex-col items-center pb-12">

            {/* === LEVEL 1: KEPALA SEKOLAH & KOMITE === */}
            <div className="flex justify-between w-full max-w-4xl relative mb-8">
              
              {/* Box Komite (Kiri) */}
              <div className="relative">
                <OrgCard title="Pengurus Komite Sekolah" type="dashed" width="w-48" />
                
                {/* GARIS 1: Komite ke Kasek (Horizontal) - PUTUS-PUTUS */}
                <div className="absolute top-1/2 left-full w-[calc(100%_+_12rem)] h-0 border-t-2 border-dashed border-slate-800 z-0"></div>
                
                {/* GARIS KE SISWA SUDAH DIHAPUS DISINI */}
              </div>

              {/* Box Kepala Sekolah (Tengah/Kanan) */}
              <div className="relative z-20">
                <OrgCard title="Kepala SMA Negeri 2 Lintongnihuta" type="head" width="w-72" />
                {/* Garis Komando Vertikal Utama (Solid) */}
                <div className="absolute top-full left-1/2 w-0 h-8 border-l-2 border-slate-800"></div>
              </div>
            </div>

            {/* === LEVEL 2: WAKASEK LINE === */}
            {/* Garis Horizontal Panjang Wakasek (Solid) */}
            <div className="relative w-[85%] border-t-2 border-slate-800 mb-4">
               {/* Kaki-kaki Garis ke 4 Wakasek */}
               <div className="absolute top-0 left-0 w-0 h-4 border-l-2 border-slate-800"></div> {/* Wakasek 1 */}
               <div className="absolute top-0 left-[33%] w-0 h-4 border-l-2 border-slate-800"></div> {/* Wakasek 2 */}
               <div className="absolute top-0 left-[66%] w-0 h-4 border-l-2 border-slate-800"></div> {/* Wakasek 3 */}
               <div className="absolute top-0 right-0 w-0 h-4 border-l-2 border-slate-800"></div> {/* Wakasek 4 */}
               
               {/* Garis Lurus Terus ke Bawah (Center Spine) */}
               <div className="absolute top-0 left-1/2 w-0 h-[580px] border-l-2 border-slate-800 -translate-x-1/2 z-0"></div>
            </div>

            {/* Grid 4 Wakasek */}
            <div className="grid grid-cols-4 gap-4 w-[90%] relative mb-8">
              
              {/* 1. KURIKULUM */}
              <div className="flex flex-col items-center">
                <OrgCard title="Wakasek Kurikulum" type="wakasek" icon={BookOpen} width="w-full" />
                <VLine h="h-6" />
                {/* Sub-Kurikulum Grid */}
                <div className="w-[120%] -ml-[10%] grid grid-cols-2 gap-2 relative">
                   <div className="absolute top-0 left-1/4 right-1/4 h-0 border-t-2 border-slate-800"></div>
                   <div className="absolute top-0 left-1/4 w-0 h-3 border-l-2 border-slate-800"></div>
                   <div className="absolute top-0 right-1/4 w-0 h-3 border-l-2 border-slate-800"></div>

                   <div className="col-span-1 mt-3">
                     <OrgCard title="Staf Wakasek" width="w-full" />
                   </div>
                   <div className="col-span-1 mt-3">
                     <OrgCard title="Wali Kelas" subtitle="Bimbingan Akademik" width="w-full" />
                   </div>
                   <div className="col-span-2 mt-2 flex justify-center">
                     <OrgCard title="Ka. LAB" type="list" width="w-[90%]">
                       <ol className="list-decimal pl-4 space-y-0.5">
                         <li>KIMIA</li>
                         <li>FISIKA</li>
                         <li>BIOLOGI</li>
                         <li>BAHASA</li>
                         <li>KOMPUTER</li>
                       </ol>
                     </OrgCard>
                   </div>
                </div>
              </div>

              {/* 2. SARPRAS */}
              <div className="flex flex-col items-center">
                <OrgCard title="Wakasek Sarana/Prasarana" type="wakasek" icon={Settings} width="w-full" />
              </div>

              {/* 3. KESISWAAN */}
              <div className="flex flex-col items-center">
                <OrgCard title="Wakasek Kesiswaan" type="wakasek" icon={GraduationCap} width="w-full" />
                <VLine h="h-6" />
                <OrgCard title="Ka. Perpustakaan" width="w-full" />
              </div>

              {/* 4. HUMAS */}
              <div className="flex flex-col items-center">
                <OrgCard title="Wakasek Humas" type="wakasek" icon={Phone} width="w-full" />
                <VLine h="h-6" />
                <div className="w-full grid grid-cols-2 gap-2 relative">
                   <div className="absolute top-0 left-1/4 right-1/4 h-0 border-t-2 border-slate-800"></div>
                   <div className="absolute top-0 left-1/4 w-0 h-3 border-l-2 border-slate-800"></div>
                   <div className="absolute top-0 right-1/4 w-0 h-3 border-l-2 border-slate-800"></div>

                   <div className="col-span-1 mt-3">
                      <OrgCard title="BP / BK" type="standard" width="w-full" />
                   </div>
                   <div className="col-span-1 mt-3">
                      <OrgCard title="TATA USAHA" type="list" width="w-full">
                        <ol className="list-decimal pl-4 space-y-0.5">
                           <li>KEPALA</li>
                           <li>KEUANGAN/BENDAHARA</li>
                           <li>AKADEMIK</li>
                           <li>KEPEGAWAIAN</li>
                           <li>KESEKRETARISAN</li>
                        </ol>
                      </OrgCard>
                   </div>
                </div>
              </div>

            </div>

            {/* === LEVEL 3: CENTER SPINE (GURU - OSIS - SISWA) === */}
            <div className="flex flex-col gap-6 items-center relative z-10 w-64 mt-4">
              <OrgCard title="GURU / MGMP" width="w-48" icon={Briefcase} />
              <VLine h="h-4" />
              <OrgCard title="PENGURUS OSIS" width="w-48" icon={Users} />
              <VLine h="h-4" />
              
              <div className="relative w-full flex justify-center">
                 <OrgCard title="SISWA" width="w-48" type="head" icon={GraduationCap} />
                 {/* GARIS MASUK KE SISWA SUDAH DIHAPUS DISINI */}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER SUDAH DIHAPUS (Tidak ada TTD & Keterangan) */}

      </div>
    </section>
  );
};

export default Struktur;    