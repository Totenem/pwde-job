/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: ["./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        'primary': '#ECE0D1',
      },
      textColor:{
        'tcolor': '#424242',
      },
      backgroundColor:{
        'button': '#2C3E50BF',
        'inputField': '#00897B'
      },
      fontFamily:{
        'lexend':['Lexend-Regular'],
        'lexend-bold':['Lexend-Bold'],
        'lexend-medium':['Lexend-Medium'],
        'lexend-semibold':['Lexend-SemiBold']
      }
    },
  },
  plugins: [],
}