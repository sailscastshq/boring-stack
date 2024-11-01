module.exports = function getFileExtensionForUI(uiFramework) {
  const extensions = {
    vue: '.vue',
    react: '.jsx',
    svelte: '.svelte'
  }

  return extensions[uiFramework]
}
