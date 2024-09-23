module.exports = {
  plugins: [
    require('prettier-plugin-tailwindcss'),
    require('prettier-plugin-svelte')
  ],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
  semi: false,
  singleQuote: true,
  trailingComma: 'none'
}
