/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Mendaftarkan Keyframes (Gerakan animasi)
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        loadingBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      },
      // 2. Mendaftarkan Class Utility (Nama class yang dipakai di HTML/JSX)
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scale-up': 'scaleUp 0.3s ease-out forwards',
        'loading-bar': 'loadingBar 2s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}