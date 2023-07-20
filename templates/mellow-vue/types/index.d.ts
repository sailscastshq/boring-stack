interface Sails {
  log: Log
  models: { [modelName: string]: Model }
  helpers: { [helperName: string]: Helper }
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
  custom: Custom
}

interface Hook {
  inertia: Inertia
}
interface Log {
  info(...args: any[]): void
  error(...args: any[]): void
  warn(...args: any[]): void
  debug(...args: any[]): void
  silly(...args: any[]): void
  verbose(...args: any[]): void
}

interface Config {
  google: {
    clientId: string
    clientSecret: string
    redirect: string
  }
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
