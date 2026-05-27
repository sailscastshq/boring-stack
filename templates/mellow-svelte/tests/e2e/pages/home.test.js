const { test } = require('sounding')

test(
  'home page renders in the browser',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /Simplify Authentication/i })
    ).toBeVisible()
    await expect(
      page.getByText(/Mellow handles user management/i)
    ).toBeVisible()
  }
)
