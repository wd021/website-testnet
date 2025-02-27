module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        // 'sm': '640px',
        // 'md': '768px',
        tablet: '832px',
        // 'lg': '1024px',
        '2lg': '1152px',
        // 'xl': '1280px',
        '1.5xl': '1440px',
        // '2xl': '1536px',
        '3xl': '1700px',
      },
      borderRadius: {
        plus: '0.3125rem',
      },
      spacing: {
        px3: '0.1875rem',
        4.5: '1.125rem',
      },
      inset: {
        5.5: '88px',
      },
      minHeight: {
        section: '43rem',
        'card-sm': '51rem',
        'card-md': '46rem',
      },
      maxWidth: {
        section: '52.5rem',
        menu: '70rem',
      },
      minWidth: {
        6: '1.5rem',
        'card-sm': '24rem',
        'card-md': '30rem',
        'card-lg': '40rem',
      },
      padding: {
        13: '3.125rem',
      },
      boxShadow: {
        navbar: '0px 4px 12px rgba(0, 0, 0, 0.12)',
      },
      transitionProperty: {
        height: 'height',
        width: 'width',
        font: 'font-size',
        padding: 'padding',
        transform: 'transform',
      },
      transitionDuration: {
        fast: '0.3s',
      },
      colors: {
        alertyellow: {
          DEFAULT: '#FFF18A',
        },
        alertred: {
          DEFAULT: '#F15929',
        },
        ifbeige: {
          DEFAULT: '#FFF4E0',
        },
        iflightblue: {
          DEFAULT: '#033CE0',
        },
        ifblue: {
          DEFAULT: '#1D0070',
        },
        ifotherblue: {
          DEFAULT: '#2C72FF',
        },
        ifsubtextgray: {
          DEFAULT: '#AFAFAF',
        },
        iflightgray: {
          DEFAULT: '#ECECEC',
        },
        ifgray: {
          DEFAULT: '#6A737D',
        },
        ifbackgroundgray: {
          DEFAULT: '#F3F3F4',
        },
        iflightorange: {
          DEFAULT: '#FFCD85',
        },
        iforange: {
          DEFAULT: '#FFA542',
        },
        ifpink: {
          DEFAULT: '#FFC2EB',
          subtext: '#D089B9',
        },
        ifyellow: {
          DEFAULT: '#FFEC1F',
        },
        ifmauve: {
          DEFAULT: '#9B6288',
        },
        ifcubepink: {
          DEFAULT: '#FF94DB',
        },
        iflightbeige: {
          DEFAULT: '#FFEFD7',
        },
      },
      fontFamily: {
        favorit: ['favorit-regular', 'sans-serif'],
        extended: ['extended-regular', 'sans-serif'],
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['hover'],
    },
  },
  plugins: [],
}
