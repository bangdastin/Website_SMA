import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Award, Users, BookOpen, Lightbulb, Target } from 'lucide-react';

// --- 1. IMPORT SLIDER & STYLE ---
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// --- 2. IMPORT GAMBAR UTAMA (SLIDER) ---
import foto1 from '../assets/fotodepan.jpeg';
import foto2 from '../assets/fotolapangan.jpeg';
import foto3 from '../assets/fotoseluruh.jpeg';

// --- 3. IMPORT GAMBAR ABOUT (KEGIATAN SISWA) ---
// Pastikan nama file di folder assets sesuai dengan ekstensi (.jpeg/.jpg/.png)
import siswa1 from '../assets/fotosiswa1.jpeg'; 
import siswa2 from '../assets/fotosiswa2.jpeg';
import siswa3 from '../assets/fotosiswa3.jpeg';
import siswa4 from '../assets/fotosiswa4.jpeg';

const sliderImages = [foto1, foto2, foto3];

const LandingPage = () => {
  // Safe Import Fix untuk React Slick
  // @ts-ignore
  const SlickSlider = Slider.default ? Slider.default : Slider;

  // Konfigurasi Slider
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 1500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
  };

  return (
    <div className="w-full overflow-x-hidden font-sans">
      
      {/* ==================================================================
          BAGIAN 1: HERO SECTION (FULL SCREEN SLIDER)
      ================================================================== */}
      <div className="relative w-full h-screen bg-slate-900">
        
        {/* Layer Slider Background */}
        <div className="absolute inset-0 z-0">
          <SlickSlider {...sliderSettings} className="h-full">
            {sliderImages.map((imgSrc, index) => (
              <div key={index} className="w-full h-screen relative outline-none">
                <img 
                  src={imgSrc} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
              </div>
            ))}
          </SlickSlider>
        </div>

        {/* Layer Konten Teks */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 max-w-6xl mx-auto space-y-8 animate-fade-in-up">
          
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 font-semibold text-sm uppercase tracking-widest shadow-lg">
            <Star size={14} className="text-yellow-400 fill-yellow-400"/>
            Penerimaan Peserta Didik Baru 2026/2027
          </span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight drop-shadow-2xl font-serif tracking-tight">
            Mewujudkan Generasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              Unggul & Berkarakter
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-light">
            SMA Negeri 2 Lintongnihuta hadir sebagai pusat pendidikan yang mengintegrasikan kecerdasan intelektual, kedisiplinan tinggi, dan nilai-nilai luhur budaya untuk mencetak pemimpin masa depan.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-6 w-full sm:w-auto">
            <Link 
              to="/auth" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2"
            >
              Daftar Sekarang <ArrowRight size={20} />
            </Link>
            
            <Link 
              to="/visi-misi" 
              className="px-8 py-4 bg-white/5 hover:bg-white/15 border border-white/40 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              Profil Sekolah
            </Link>
          </div>
        </div>
      </div>


      {/* ==================================================================
          BAGIAN 2: TENTANG SEKOLAH (EXTENDED VERSION)
      ================================================================== */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Hiasan Background Abstrak */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 -skew-x-12 translate-x-32 -z-0"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* --- KOLOM KIRI: TEKS PENJELASAN LENGKAP --- */}
            <div className="space-y-10">
              
              {/* Header Section */}
              <div className="space-y-4">
                <span className="text-blue-600 font-bold tracking-wider uppercase text-sm border-b-2 border-blue-600 pb-1">Tentang Kami</span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Membangun Masa Depan Melalui <span className="text-blue-600">Inovasi & Karakter</span>
                </h2>
              </div>

              {/* Paragraf Utama */}
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed text-justify">
                <p>
                  SMA Negeri 2 Lintongnihuta berdiri dengan visi mulia untuk menjadi lembaga pendidikan terdepan yang tidak hanya fokus pada pencapaian akademis, tetapi juga pada pembentukan karakter siswa yang tangguh, beretika, dan berwawasan global.
                </p>
                <p>
                  Kami menerapkan kurikulum yang adaptif terhadap perkembangan teknologi dan kebutuhan zaman. Dengan dukungan fasilitas yang memadai dan tenaga pendidik yang berdedikasi, kami memastikan setiap siswa mendapatkan ruang untuk mengeksplorasi bakat dan minat mereka secara maksimal.
                </p>
              </div>

              {/* Grid Keunggulan (3 Poin Utama) */}
              <div className="grid gap-6">
                
                {/* Poin 1 */}
                <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Kurikulum Terintegrasi</h4>
                    <p className="text-slate-500 mt-1 text-sm">Menggabungkan kurikulum nasional dengan program pengayaan berbasis keterampilan abad 21.</p>
                  </div>
                </div>

                {/* Poin 2 */}
                <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Fasilitas Modern</h4>
                    <p className="text-slate-500 mt-1 text-sm">Laboratorium lengkap, perpustakaan digital, dan sarana olahraga yang mendukung kreativitas siswa.</p>
                  </div>
                </div>

                {/* Poin 3 */}
                <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Target size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Pengembangan Karakter</h4>
                    <p className="text-slate-500 mt-1 text-sm">Program pembinaan disiplin, kepemimpinan, dan kerohanian yang intensif.</p>
                  </div>
                </div>

              </div>

              <div className="pt-4">
                <Link to="/visi-misi" className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
                  Pelajari Visi & Misi Kami <ArrowRight size={18} />
                </Link>
              </div>

            </div>


            {/* --- KOLOM KANAN: GALERI 4 FOTO (MOSAIC LAYOUT) --- */}
            <div className="relative h-full flex items-center">
              {/* Grid 2x2 untuk 4 Foto */}
              <div className="grid grid-cols-2 gap-4 w-full">
                
                {/* Foto 1 (Atas Kiri) */}
                <div className="space-y-4 translate-y-8">
                   <div className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[3/4]">
                    <img 
                      src={siswa1} 
                      alt="Aktivitas Belajar" 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white font-medium text-sm">Prestasi Siswa</p>
                    </div>
                  </div>
                </div>

                {/* Foto 2 (Atas Kanan) */}
                <div className="space-y-4">
                   <div className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[3/4]">
                    <img 
                      src={siswa2} 
                      alt="Kegiatan Olahraga" 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white font-medium text-sm">Ekstrakurikuler & Olahraga</p>
                    </div>
                  </div>
                </div>

                {/* Foto 3 (Bawah Kiri - Agak naik dikit karena efek staggered) */}
                <div className="space-y-4 translate-y-8">
                   <div className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]">
                    <img 
                      src={siswa3} 
                      alt="Pengukuhan" 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white font-medium text-sm">Pengukuhan</p>
                    </div>
                  </div>
                </div>

                {/* Foto 4 (Bawah Kanan) */}
                <div className="space-y-4">
                   <div className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]">
                    <img 
                      src={siswa4} 
                      alt="Pengukuhan" 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white font-medium text-sm">Pengukuhan</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;