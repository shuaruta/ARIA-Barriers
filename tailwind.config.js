module.exports = {
  purge: [
    './_includes/**/*.html',
    './_layouts/**/*.html',
    './_posts/*.md',
    './*.html',
    './index.md',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'rouge-bg': '#122b3b',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

