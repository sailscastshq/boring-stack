const fs = require('fs')
const { postOrderDirectoryTraverse } = require('./directory-traverse')


module.exports = function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return
  }

  postOrderDirectoryTraverse(
    dir,
    (dir) => fs.rmdirSync(dir),
    (file) => fs.unlinkSync(file)
  )
}
