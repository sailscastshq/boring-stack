module.exports = function getActionName(pageName) {
  if (!pageName.includes('/')) return `view-${pageName}`

  const [firstPart, secondPart] = pageName.split('/')
  const actionName =
    secondPart === 'index' ? `view-${firstPart}` : `view-${secondPart}`

  return `${firstPart.replace(/s$/, '')}/${actionName}`
}
