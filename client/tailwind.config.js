/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#feebd6',
          200: '#fdd4ad',
          300: '#fab679',
          400: '#f68e43',
          500: '#f37220',
          600: '#e45915',
          700: '#bc4112',
          800: '#963617',
          900: '#792e15',
        },
        secondary: {
          50: '#f0f9f6',
          100: '#ddf1e8',
          200: '#bde3d4',
          300: '#8fcfb9',
          400: '#5bb498',
          500: '#3d9a7c',
          600: '#2e7c64',
          700: '#276352',
          800: '#235043',
          900: '#1f4238',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}