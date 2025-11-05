import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('features page loads', async ({ page }) => {
    await page.goto('/features')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.getByRole('form', { name: 'Contact form' })).toBeVisible()
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Message')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Send Message' })
    ).toBeVisible()
  })

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
