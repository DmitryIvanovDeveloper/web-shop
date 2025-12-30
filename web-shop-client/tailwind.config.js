/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'grid-cols-2',
    'sm:grid-cols-2',
    'lg:grid-cols-3',
    'xl:grid-cols-4',
    'landscape-max-lg:grid-cols-3',
    'gap-4',
    'landscape-max-lg:gap-x-3',
    'landscape-max-lg:gap-y-4',
    'max-w-[1200px]',
    'mx-auto',
    'bg-black/70',
    'backdrop-blur-md',
    'p-3.5',
    'md:p-8',
  ],
  theme: {
    extend: {
      screens: {
        'landscape-max-lg': {'raw': '(orientation: landscape) and (max-width: 1023px)'},
      },
    },
  },
  plugins: [],
}

