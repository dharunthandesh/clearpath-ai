/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',
          50: '#EFF3FB',
          100: '#D1DCF5',
          200: '#A3BAE9',
          300: '#7598DD',
          400: '#4776D1',
          500: '#1E3A8A',
          600: '#182E6B',
          700: '#12234F',
          800: '#0C1734',
          900: '#060C1A',
        },
        teal: {
          DEFAULT: '#14B8A6',
          50: '#ECFDF9',
          100: '#D0F7F2',
          200: '#A1EFE5',
          300: '#72E7D8',
          400: '#43DFCB',
          500: '#14B8A6',
          600: '#0F9285',
          700: '#0B6D63',
          800: '#074842',
          900: '#032421',
        },
        orange: {
          DEFAULT: '#F97316',
          alert: '#F97316',
        },
        bglight: '#F8FAFC',
        textdark: '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(30,58,138,0.08)',
        'card-hover': '0 8px 32px rgba(30,58,138,0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
