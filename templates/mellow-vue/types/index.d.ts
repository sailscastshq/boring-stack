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
  wish: Wish
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
    checkPassword: (
      passwordAttempt: string,
      hashedPassword: string
    ) => Promise<Sails>
  }
  strings: {
    random: (style?: 'url-friendly' | 'alphanumeric') => string
    uuid: () => string
  }
  mail: {
    send: {
      with: (params: EmailParams) => Promise<string>
    }
  }
  getUserInitials: (fullName: string) => string
  capitalize: (inputString: string) => string
}
interface EmailParams {
  mailer?: string
  to: string
  cc?: string | array<string>
  bcc?: string | array<string>
  subject?: string
  template?: string
  templateData?: object
  attachments?: EmailAttachment[]
}
interface EmailAttachment {
  filename: string
  content?: string | Buffer | NodeJS.ReadableStream
  path?: string
  href?: string
  httpHeaders?: { [key: string]: string }
  contentType?: string
  contentDisposition?: string
  cid?: string
  encoding?: string
  headers?: { [key: string]: string }
  raw?: string
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
interface Wish {
  provider: (provider: string) => Wish
  redirect: () => string
  user: (code: string) => GoogleUser | GitHubUser
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
  location: (path: string) => void
}

interface GoogleUser {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
  locale: string
  accessToken: string
  idToken: string
}

interface LoggedInUser {
  id: string
  fullName: string
  email: string
  initials?: string
  googleAvatarUrl?: string
  value: LoggedInUser
}
declare const sails: Sails

declare const User
