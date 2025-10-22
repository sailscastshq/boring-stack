module.exports = {
  darkMode: 'class',
  content: [
    './views/**/*.ejs',
    './assets/js/**/*.{js,ts,jsx,tsx}',
    './node_modules/primereact/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Ascent brand colors - inspired by growth and ascent
        brand: {
          DEFAULT: '#0EA5E9', // sky-500
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49'
        },
        // Accent teal for success states and highlights
        accent: {
          DEFAULT: '#14B8A6', // teal-500
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E'
        },
        // Success green
        success: {
          DEFAULT: '#10B981', // emerald-500
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22'
        },
        gray: {
          DEFAULT: '#878787',
          50: '#E3E3E3',
          100: '#D9D9D9',
          200: '#C4C4C4',
          300: '#B0B0B0',
          400: '#9B9B9B',
          500: '#878787',
          600: '#6B6B6B',
          700: '#4F4F4F',
          800: '#333333',
          900: '#171717',
          950: '#090909'
        },
        black: {
          DEFAULT: '#333333',
          50: '#8F8F8F',
          100: '#858585',
          200: '#707070',
          300: '#5C5C5C',
          400: '#474747',
          500: '#333333',
          600: '#171717',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          950: '#000000'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
