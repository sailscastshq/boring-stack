module.exports = {
  port: 3333,
  hooks: {
    // Uncomment if you have the apianalytics hook and you don't want to see logs
    // from it during testing
    // apianalytics: false
  },
  log: {
    level: 'error'
  },
  models: {
    migrate: 'drop'
  },
  datastores: {
    default: {
      adapter: 'sails-disk'
    }
  },
  mail: {
    default: 'log',
    mailers: {
      log: {
        transport: 'log'
      }
    }
  }
}
