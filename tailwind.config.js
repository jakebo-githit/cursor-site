/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6EBF5',
          100: '#C2CFEA',
          200: '#9AAFDE',
          300: '#718FD2',
          400: '#4F77C7',
          500: '#2D5FBC',
          600: '#244B96',
          700: '#1B3871',
          800: '#13264B',
          900: '#0A1326',
          950: '#050A13',
          DEFAULT: '#0A2463'
        },
        secondary: {
          50: '#E6F5FB',
          100: '#C2E8F5',
          200: '#99D7EE',
          300: '#71C6E7',
          400: '#48B5E0',
          500: '#247BA0',
          600: '#1D6280',
          700: '#164A60',
          800: '#0E3140',
          900: '#071820',
          950: '#030C10',
          DEFAULT: '#247BA0'
        },
        accent: {
          50: '#FCEFE6',
          100: '#F9D8C2',
          200: '#F5BE99',
          300: '#F1A471',
          400: '#EE8A48',
          500: '#EA7020',
          600: '#BB5A19',
          700: '#8C4313',
          800: '#5D2D0D',
          900: '#2E1606',
          950: '#170B03',
          DEFAULT: '#EA7020'
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
      },
      fontSize: {
        'base-plus': '1.0625rem', // 17px
        'lg-plus': '1.1875rem',   // 19px
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(10, 36, 99, 0.1), 0 2px 4px -2px rgba(10, 36, 99, 0.05)',
        'medium': '0 10px 15px -3px rgba(10, 36, 99, 0.1), 0 4px 6px -4px rgba(10, 36, 99, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};