const { test } = require('@japa/runner')

test.group('/signup', (group) => {
  test('should display a functional signup page', async ({ visit, route }) => {
    const page = await visit(route('auth/view-signup'))
    await page.assertPath('/signup')
    await page.assertTitle('Sign up')

    await page.assertExists('input[id="fullName"]')
    await page.assertExists('input[id="email"]')
    await page.assertExists('input[id="password"]')

    await page.assertDisabled('button[type="submit"]')
  })
  test('password toggle feature works properly', async ({
    visit,
    route,
    assert
  }) => {
    const page = await visit(route('auth/view-signup'))

    const passwordInput = await page.getByPlaceholder('Your password')
    const passwordVisibilityToggle =
      'button[aria-label="Toggle Password Visibility"]'

    assert.strictEqual(
      await passwordInput.getAttribute('type'),
      'password',
      'Password is hidden by default'
    )

    await page.assertExists('svg[aria-label="Password is not visible"]')
    await page.assertNotExists('svg[aria-label="Password is visible"]')

    await page.click(passwordVisibilityToggle)
    assert.strictEqual(
      await passwordInput.getAttribute('type'),
      'text',
      'Password is visible'
    )
    await page.assertNotExists('svg[aria-label="Password is not visible"]')
    await page.assertExists('svg[aria-label="Password is visible"]')

    await page.click(passwordVisibilityToggle)
    assert.strictEqual(
      await passwordInput.getAttribute('type'),
      'password',
      'Password is hidden again'
    )
    await page.assertExists('svg[aria-label="Password is not visible"]')
    await page.assertNotExists('svg[aria-label="Password is visible"]')
  })
  test('user can signup with valid data', async ({ visit, route }) => {
    const page = await visit(route('auth/view-signup'))
    await page.getByLabel('Name').fill('Kelvin Omereshone')
    await page.getByLabel('Email').fill('tests@example.com')
    await page.getByPlaceholder('Your password').fill('Kelvin1234585&')
    await page.getByRole('button', { name: 'Sign up' }).click()

    await page.waitForURL(route('auth/view-check-email'))
    await page.assertPath('/check-email')
    await page.assertVisible(page.getByText('tests@example.com'))
  })
})
