/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0051D5',
          blueDark: '#4D7DFF',
          navy: '#131B2E',
          ink: '#0B1C30',
          paper: '#F8F9FF',
          mint: '#85F8C4',
        },
        dark: {
          bg: '#070B14',
          card: '#101827',
          cardHigh: '#172235',
          line: '#2C3A52',
          text: '#F4F7FB',
          muted: '#A8B3C7',
        },
      },
      fontFamily: {
        jakarta: ['PlusJakartaSans_400Regular'],
        jakartaMedium: ['PlusJakartaSans_500Medium'],
        jakartaSemi: ['PlusJakartaSans_600SemiBold'],
        jakartaBold: ['PlusJakartaSans_700Bold'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};

