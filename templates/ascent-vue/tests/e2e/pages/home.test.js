const { test } = require('sounding')

test(
  'home page renders in the browser',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /Scale Your Team/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Join the Waitlist/i })
    ).toBeVisible()
  }
)
