module.exports = {
  plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
  semi: false,
  singleQuote: true,
  trailingComma: 'none'
}
