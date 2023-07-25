interface Sails {
  log: LogMethod & LogObject
  models: { [modelName: string]: Model }
  helpers: Helper
  on(event: string, listener: (...args: any[]) => void): void
  off(event: string, listener: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
  lift(cb?: (err: Error, sails: Sails) => void): Sails
  lower(cb?: (err?: Error) => void): void
  load(): Sails
  getVersion(): string
  inertia: Inertia
  hooks: Hook
  config: Config
  req: {
    ip: string
  }
  renderView: (
    relPathToView: string,
    _options: Dictionary,
    optionalCb?: (err: Error | null, compiledHtml: string) => void
  ) => Sails & Promise<string>
  intercept(callback: (err: Error) => Error): Sails & Promise<string>
}

interface Helper {
  passwords: {
    hashPassword: (password: string, strength?: number) => Promise<string>
  }
  strings: {
    random: (style?: 'url-friendly' | 'alphanumeric') => string
  }
  mail: {
    send: {
      with: (params: EmailParams) => Promise<string>
    }
  }
}
interface EmailParams {
  to: string
  subject?: string
  template?: string
  templateData?: object
}

interface Hook {
  inertia: Inertia
}
interface LogMethod {
  (...args: any[]): void
}

interface LogObject {
  info: LogMethod
  warn: LogMethod
  error: LogMethod
  debug: LogMethod
  silly: LogMethod
  verbose: LogMethod
}

interface Config {
  smtp: {
    transport?: 'smtp'
    host?: string
    port?: number
    encryption?: 'tls' | 'ssl'
    username: string
    password: string
  }
  google: {
    clientId: string
    clientSecret: string
    redirect: string
  }
  mail: {
    default: string
    mailers: {
      log: object
      smtp: {
        transport: 'smtp'
        host: string
        port: number
        encryption: 'tls' | 'ssl'
        username?: string
        password?: string
      }
    }
    from: {
      name: string
      address: string
    }
  }
  custom: Custom
}

interface Custom {
  baseUrl: string
  passwordResetTokenTTL: number
  emailProofTokenTTL: number
  rememberMeCookieMaxAge: number
  internalEmail: string
  verifyEmail: boolean
}

interface Inertia {
  share: (key: string, value?: any) => void
  render: (
    component: string,
    props?: Record<string, any>,
    viewData?: Record<string, any>
  ) => any
  flushShared: (key?: string) => void
  viewData: (key: string, value: any) => void
  getViewData: (key: string) => any
  setRootView: (newRootView: string) => void
  getRootView: () => string
}

declare const sails: Sails

declare const User
