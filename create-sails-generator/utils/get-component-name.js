module.exports = function getComponentName(str) {
  const words = str.split(/-|\//)

  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('')
}
