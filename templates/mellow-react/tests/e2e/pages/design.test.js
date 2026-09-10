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
      '/check-email',
      '/link-expired',
      '/verify-email/success',
      '/reset-password/success',
      '/this-page-does-not-exist'
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
  async ({ page, expect, sails }) => {
    const user = await sails.models.user
      .create({
        fullName: 'Alex Morgan',
        email: 'alex@example.com',
        emailStatus: 'verified',
        password: 'preview-password-212'
      })
      .fetch()

    await page.goto('/login')
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page
      .getByLabel('Password', { exact: true })
      .fill('preview-password-212')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const route of ['/dashboard', '/profile']) {
      for (const width of [390, 768, 1440])
        await checkLayout(page, expect, route, width)
    }

    expect(errors).toEqual([])
  }
)

test(
  'password recovery renders a valid reset link',
  { browser: true },
  async ({ page, expect, sails }) => {
    await sails.models.user.create({
      fullName: 'Recovery Tester',
      email: 'recovery@example.com',
      passwordResetToken: 'design-preview-reset',
      passwordResetTokenExpiresAt: Date.now() + 60000
    })
    await checkLayout(
      page,
      expect,
      '/reset-password?token=design-preview-reset',
      390
    )
    await checkLayout(
      page,
      expect,
      '/reset-password?token=design-preview-reset',
      1440
    )
  }
)
