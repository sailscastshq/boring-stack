module.exports = function getPartialData(props, only = []) {
  return Object.assign({}, ...only.map((key) => ({ [key]: props[key] })))
}
