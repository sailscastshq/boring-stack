import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Ascent/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Guest Protection', () => {
  test('dashboard redirects unauthenticated users to login', async ({
    page
  }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })

  test('settings redirects unauthenticated users to login', async ({
    page
  }) => {
    await page.goto('/settings/profile')
    await expect(page).toHaveURL(/login/)
  })

  test('security settings redirects unauthenticated users to login', async ({
    page
  }) => {
    await page.goto('/settings/security')
    await expect(page).toHaveURL(/login/)
  })

  test('team page redirects unauthenticated users to login', async ({
    page
  }) => {
    await page.goto('/settings/team')
    await expect(page).toHaveURL(/login/)
  })
})
