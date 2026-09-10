const { test } = require('sounding')
const path = require('node:path')
const fs = require('node:fs')

async function checkLayout(page, expect, route, width) {
  await page.setViewportSize({ width, height: 1000 })
  const response = await page.goto(route)
  expect(response.status()).toBe(
    route === '/this-page-does-not-exist' ? 404 : 200
  )
  expect(new URL(page.url()).pathname).toBe(
    new URL(route, 'http://localhost').pathname
  )
  await page.locator('h1').first().waitFor()
  await expect(page.locator('h1').first()).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    )
  ).toBe(true)
  if (process.env.DESIGN_SCREENSHOTS) {
    const folder = path.resolve(process.env.DESIGN_SCREENSHOTS)
    fs.mkdirSync(folder, { recursive: true })
    await page.waitForLoadState('networkidle')
    await page.locator('h1').first().waitFor({ state: 'visible' })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.screenshot({
      path: path.join(
        folder,
        `${path.basename(process.cwd())}-${
          route.replace(/[^a-z0-9]/gi, '_') || 'home'
        }-${width}.png`
      )
    })
  }
}

test(
  'public pages remain usable on mobile and desktop',
  { browser: true },
  async ({ page, expect }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const route of [
      '/',
      '/login',
      '/signup',
      '/forgot-password',
      '/check-email?type=verification',
      '/check-email?type=magic-link',
      '/check-email?type=password-reset',
      '/this-page-does-not-exist',
      '/features',
      '/pricing',
      '/blog',
      '/contact'
    ]) {
      for (const width of [390, 768, 1440])
        await checkLayout(page, expect, route, width)
    }
    expect(errors).toEqual([])
  }
)

test(
  'account pages remain usable across viewport sizes',
  { browser: true },
  async ({ page, expect, login, sails }) => {
    const user = await sails.models.user
      .create({
        fullName: 'Alex Morgan',
        email: 'alex@example.com',
        emailStatus: 'verified'
      })
      .fetch()
    const team = await sails.models.team
      .create({ name: 'Northstar Studio' })
      .fetch()
    await sails.models.membership.create({
      member: user.id,
      team: team.id,
      role: 'owner',
      status: 'active'
    })
    await login.as(user, page)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const route of [
      '/dashboard',
      '/settings/profile',
      '/settings/security',
      '/settings/team',
      '/settings/billing',
      '/team/create'
    ]) {
      for (const width of [390, 768, 1440])
        await checkLayout(page, expect, route, width)
    }
    await page.evaluate(() =>
      localStorage.setItem('darkModePreference', 'dark')
    )
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await checkLayout(page, expect, '/settings/profile', 1440)
    await expect(page.locator('aside')).toHaveCSS(
      'background-color',
      'rgb(21, 31, 40)'
    )
    await expect(page.locator('header').first()).not.toHaveCSS(
      'background-color',
      'rgba(255, 255, 255, 0.95)'
    )
    if (process.env.DESIGN_SCREENSHOTS)
      await page.screenshot({
        path: path.join(
          path.resolve(process.env.DESIGN_SCREENSHOTS),
          `${path.basename(process.cwd())}-profile-dark.png`
        )
      })
    await page.evaluate(() =>
      localStorage.setItem('darkModePreference', 'light')
    )
    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    expect(errors).toEqual([])
  }
)

test(
  'billing choice survives reload and mobile navigation reaches features',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/pricing')
    await page.getByRole('button', { name: /Yearly/ }).click()
    await expect(page).toHaveURL(/cycle=yearly/)
    await page.reload()
    await expect(page.getByRole('button', { name: /Yearly/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByText('Explore Ascent', { exact: true }).click()
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Features', exact: true })
      .click()
    await expect(page).toHaveURL(/\/features$/)
    await expect(
      page.getByRole('heading', { name: /Good products start/ })
    ).toBeVisible()
  }
)

test(
  'recovery and invitation states fit mobile and desktop',
  { browser: true },
  async ({ page, expect, sails }) => {
    await sails.models.user.create({
      fullName: 'Recovery Tester',
      email: 'recovery@example.com',
      passwordResetToken: 'design-preview-reset',
      passwordResetTokenExpiresAt: Date.now() + 60000
    })
    const team = await sails.models.team
      .create({ name: 'Northstar Studio', inviteLinkEnabled: true })
      .fetch()
    for (const route of [
      '/reset-password?token=design-preview-reset',
      `/team/${team.inviteToken}`
    ]) {
      for (const width of [390, 1440])
        await checkLayout(page, expect, route, width)
    }
  }
)

test(
  'two-factor sign-in remains usable on mobile',
  { browser: true },
  async ({ page, expect, sails }) => {
    await sails.models.user.create({
      fullName: 'Secure User',
      email: 'secure@example.com',
      emailStatus: 'verified',
      password: 'secure-preview-password-212',
      twoFactorEnabled: true,
      totpEnabled: true
    })
    await page.goto('/login?mode=password')
    await page
      .getByLabel('Email Address', { exact: true })
      .fill('secure@example.com')
    await page
      .getByLabel('Password', { exact: true })
      .fill('secure-preview-password-212')
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    await expect(page).toHaveURL(/\/verify-2fa$/)
    await checkLayout(page, expect, '/verify-2fa', 390)
    await checkLayout(page, expect, '/verify-2fa', 1440)
  }
)
