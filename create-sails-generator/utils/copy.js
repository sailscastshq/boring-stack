const fs = require('fs')
const path = require('path')

/**
 * Copy file from one place to another.
 *
 * @param {Object} options
 * @param {String} options.rootPath The absolute path of the destination for the copied file.
 * @param {String} options.templatePath The relative path from the generator's `templates/` dir to the source template whose contents will be copied.
 * @param {String} options.templatesDirectory An absolute path to the generator's `templates/` dir.
 * @param {Boolean} [options.force=false] Whether to overwrite existing files.
 * @param {Function} cb Callback function (err)
 */
module.exports = function copyFile(options, cb) {
  try {
    if (
      !options ||
      typeof options !== 'object' ||
      !options.templatePath ||
      !options.templatesDirectory ||
      !options.rootPath
    ) {
      throw new Error(
        'Invalid options. `templatePath`, `templatesDirectory`, and `rootPath` are required.'
      )
    }
    options.force = options.force || false

    const absSrcPath = path.resolve(
      options.templatesDirectory,
      options.templatePath
    )

    fs.mkdir(path.dirname(options.rootPath), { recursive: true }, (err) => {
      if (err) {
        return cb(err)
      }
      // Check if the destination file exists
      fs.access(options.rootPath, fs.constants.F_OK, (err) => {
        if (!err && !options.force) {
          return cb(
            new Error(`File already exists at destination: ${options.rootPath}`)
          )
        }

        // Remove the destination file if it exists and force option is true
        if (options.force) {
          fs.unlink(options.rootPath, (err) => {
            if (err && err.code !== 'ENOENT') {
              return cb(err)
            }
          })
        }
      })

      fs.copyFile(absSrcPath, options.rootPath, (err) => {
        if (err) {
          return cb(err)
        }
        cb()
      })
    })
  } catch (err) {
    cb(err)
  }
}
