const { test } = require('sounding')

test(
  'home page renders in the browser',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /Start with the essentials/i })
    ).toBeVisible()
    await expect(
      page.getByText(/Authentication and profiles, ready for your next idea/i)
    ).toBeVisible()
  }
)
