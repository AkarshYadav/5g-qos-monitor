
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#2563EB',
          'secondary': '#10B981',
          'background': '#F3F4F6',
        },
        boxShadow: {
          'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }