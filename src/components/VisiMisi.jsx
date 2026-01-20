import React from 'react';
import { Target, Flag, BookOpen, Users, Star, Award, CheckCircle2, ArrowRight } from 'lucide-react';

const VisiMisi = () => {
  return (
    <section id="visi-misi" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visi, Misi & Tujuan</h2>
          <div className="w-24 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            Komitmen kami untuk mewujudkan pendidikan berkualitas dan berkarakter.
          </p>
        </div>
        
        {/* --- VISI SECTION (CENTERED) --- */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Target className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold opacity-90 mb-2 uppercase tracking-wider">Visi Sekolah</h3>
            <p className="text-2xl md:text-4xl font-bold leading-tight">
              “Terwujudnya Sekolah Unggul yang Berkarakter dan Berprestasi”
            </p>
          </div>
        </div>

        {/* --- MISI & TUJUAN (SIDE BY SIDE) --- */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          
          {/* MISI CARD */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Flag className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Misi</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Membina warga sekolah yang beriman, berakhlak mulia dan bertanggung jawab",
                "Menyelenggarakan pembelajaran yang bermakna, berkesadaran dan menggembirakan",
                "Meningkatkan kompetensi tenaga pendidik dan tenaga kependidikan",
                "Mengembangkan potensi, bakat dan minat murid baik secara akademik maupun nonakademik",
                "Menjamin hak belajar setiap murid tanpa terkecuali",
                "Menciptakan sekolah aman, nyaman, bebas perundungan serta menerapkan disiplin positif",
                "Menciptakan lingkungan belajar yang sehat secara fisik dan mental",
                "Menghasilkan murid yang berdaya saing global baik nasional maupun Internasional",
                "Membangun kemitraan pembelajaran"
              ].map((item, index) => (
                <li key={index} className="flex gap-3 items-start text-slate-600 text-sm md:text-base">
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TUJUAN CARD */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-200 pb-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Award className="text-indigo-600 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Tujuan</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Terwujud warga sekolah yang beriman, berakhlak mulia dan bertanggung jawab",
                "Terselenggaranya pembelajaran yang bermakna, berkesadaran dan menggembirakan",
                "Terwujudnya tenaga pendidik dan tenaga kependidikan yang kompeten",
                "Terwujudnya pengembang potensi bakat & minat murid baik secara akademik maupun non akademik",
                "Terwujudnya hak belajar setiap murid tanpa terkecuali",
                "Terciptanya sekolah aman, nyaman, bebas bullying serta menerapkan disiplin positif",
                "Tercipta lingkungan belajar yang sehat secara fisik maupun mental",
                "Terwujudnya murid yang berdaya saing global baik nasional maupun internasional",
                "Terselenggaranya kemitraan pembelajaran"
              ].map((item, index) => (
                <li key={index} className="flex gap-3 items-start text-slate-600 text-sm md:text-base">
                  <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- PROGRAM PILIHAN SEKOLAH --- */}
        <div className="mb-12">
           <div className="text-center mb-12">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Unggulan</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Program Pilihan Sekolah</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* PROGRAM 1: KOMUNITAS GURU */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-500 hover:-translate-y-2 transition-transform duration-300 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-blue-500 w-8 h-8" />
                <h3 className="text-xl font-bold text-slate-800">Genotif Community</h3>
              </div>
              <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Komunitas Guru</p>
              
              <div className="space-y-4 text-sm text-slate-600 flex-grow">
                <div>
                  <strong className="text-slate-800 block mb-1">Tujuan:</strong>
                  Meningkatkan kompetensi guru melalui kolaborasi antarguru mapel.
                </div>
                <div>
                  <strong className="text-slate-800 block mb-1">Langkah-langkah:</strong>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li>Perencanaan: Penentuan tema.</li>
                    <li>Pelaksanaan: Pertemuan sebulan sekali.</li>
                    <li>Monev: Kuisioner guru.</li>
                    <li>Refleksi: Evaluasi rapat.</li>
                    <li>Tindak Lanjut: Tema variatif & narasumber luar.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PROGRAM 2: BINTANG */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-yellow-400 hover:-translate-y-2 transition-transform duration-300 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Star className="text-yellow-500 w-8 h-8" />
                <h3 className="text-xl font-bold text-slate-800">BINTANG</h3>
              </div>
              <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Bina Talenta & Bakat Gemilang</p>
              
              <div className="space-y-4 text-sm text-slate-600 flex-grow">
                <div>
                  <strong className="text-slate-800 block mb-1">Tujuan:</strong>
                  Menggali potensi minat dan bakat serta kreativitas murid.
                </div>
                <div>
                  <strong className="text-slate-800 block mb-1">Langkah-langkah:</strong>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li>Perencanaan: Sosialisasi & topik.</li>
                    <li>Pelaksanaan: Partisipasi murid.</li>
                    <li>Monev: Dokumentasi & hasil karya.</li>
                    <li>Refleksi: Asesmen formatif.</li>
                    <li>Tindak Lanjut: Apresiasi prestasi murid.</li>
                  </ul>
                </div>
              </div>
            </div>

             {/* PROGRAM 3: OKSI */}
             <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-500 hover:-translate-y-2 transition-transform duration-300 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-green-500 w-8 h-8" />
                <h3 className="text-xl font-bold text-slate-800">OKSI</h3>
              </div>
              <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Olimpiade & Kreativitas Siswa</p>
              
              <div className="space-y-4 text-sm text-slate-600 flex-grow">
                <div>
                  <strong className="text-slate-800 block mb-1">Tujuan:</strong>
                  Promosi sekolah, menumbuhkan budaya kolaborasi & kompetisi.
                </div>
                <div>
                  <strong className="text-slate-800 block mb-1">Langkah-langkah:</strong>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    <li>Perencanaan: Panitia & sosialisasi.</li>
                    <li>Pelaksanaan: Offline & Online.</li>
                    <li>Monev: Laporan & hadiah.</li>
                    <li>Refleksi: Perkembangan percaya diri.</li>
                    <li>Tindak Lanjut: Peningkatan kerja sama.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default VisiMisi;