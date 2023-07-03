interface Sails {
  log: Log
}

interface Log {
  info
  error
}
declare const sails: Sails

export = sails
