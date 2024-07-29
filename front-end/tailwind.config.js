/** @type {import('tailwindcss').Config} */
module.exports = {
  mode : 'jit',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-purple': 'rgb(98 , 0 , 225)'
      },
      rotate: {
        '360' : '360deg',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        'xs': '400px'
      }
    },
  },
  variants: {
    extend: {
      rotate: ['group-hover']
    }
  },
  plugins: [],
};
