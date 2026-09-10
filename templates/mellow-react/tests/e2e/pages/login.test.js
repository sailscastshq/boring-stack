const { test } = require('sounding')
test(
  'login fields preserve values and password visibility',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/login')
    const password = page.getByLabel('Password', { exact: true })
    await page.getByLabel('Email', { exact: true }).fill('reader@example.com')
    await password.fill('correct-horse-battery-staple')
    await expect(
      page.getByRole('button', { name: 'Login', exact: true })
    ).toBeEnabled()
    await expect(password).toHaveAttribute('type', 'password')
    const reveal = page.getByRole('button', {
      name: 'Show password',
      exact: true
    })
    await reveal.focus()
    await page.keyboard.press('Enter')
    await expect(password).toHaveAttribute('type', 'text')
    await expect(password).toHaveValue('correct-horse-battery-staple')
    await page
      .getByRole('button', { name: 'Hide password', exact: true })
      .click()
    await expect(password).toHaveAttribute('type', 'password')
    await expect(page).toHaveURL(/\/login$/)
  }
)

test(
  'email validation stays associated with its field',
  { browser: true },
  async ({ page, expect }) => {
    await page.goto('/forgot-password')
    const email = page.getByLabel('Email', { exact: true })
    await email.fill('invalid-address')
    await email.press('Tab')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toHaveAttribute('aria-describedby', 'email-error')
    await expect(page.locator('#email-error')).toBeVisible()
    await email.fill('reader@example.com')
    await email.press('Tab')
    await expect(email).not.toHaveAttribute('aria-invalid', 'true')
  }
)
