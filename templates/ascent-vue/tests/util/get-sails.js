const Sails = require('sails').constructor

// Singleton instance - initialized once, never torn down (process exits after tests)
let sailsInstance = null
let initPromise = null

async function getSails() {
  if (sailsInstance) {
    return sailsInstance
  }

  // Prevent multiple concurrent initializations
  if (initPromise) {
    return initPromise
  }

  initPromise = new Promise((resolve, reject) => {
    const sailsApp = new Sails()
    sailsApp.load(
      {
        environment: 'test',
        hooks: {
          // Disable non-essential hooks for faster helper unit tests
          shipwright: false,
          orm: false,
          sockets: false,
          pubsub: false,
          views: false,
          http: false,
          session: false,
          grunt: false,
          i18n: false,
          flash: false,
          content: false
        },
        log: { level: 'error' }
      },
      (err, sails) => {
        if (err) {
          return reject(err)
        }
        sailsInstance = sails
        resolve(sails)
      }
    )
  })

  return initPromise
}

module.exports = { getSails }
