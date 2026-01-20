import React from 'react';
import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCap className="text-blue-500" />
          <span className="text-xl font-bold text-white">SMA Unggulan</span>
        </div>
        <p className="text-sm opacity-50">&copy; 2026 SMA Unggulan. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;