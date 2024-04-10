module.exports = function getActionName(pageName) {
  if (!pageName.includes('/')) return 'view-' + pageName
  const [firstPart] = pageName.split('/')
  const actionName = 'view-' + firstPart
  const singularizedFirsPart = firstPart.replace(/s$/, '')
  return `${singularizedFirsPart}/${actionName}`
}
