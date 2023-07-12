module.exports = {
  content: ['./views/**/*.ejs', './assets/js/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C25C1',
          50: '#CCAEEF',
          100: '#C19DEC',
          200: '#AB7BE6',
          300: '#9659DF',
          400: '#8036D9',
          500: '#6C25C1',
          600: '#521C92',
          700: '#371363',
          800: '#1D0A34',
          900: '#030105',
          950: '#000000'
        },
        green: {
          DEFAULT: '#49D489',
          50: '#DEF7E9',
          100: '#CDF3DF',
          200: '#ACEBC9',
          300: '#8BE4B4',
          400: '#6ADC9E',
          500: '#49D489',
          600: '#2CB96D',
          700: '#218C52',
          800: '#165E37',
          900: '#0C311D',
          950: '#061A0F'
        }
      }
    }
  },
  plugins: []
}
