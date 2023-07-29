const { test } = require('@japa/runner')

test.group('/signup', (group) => {
  test('should display a functional signup page', async ({ visit, route }) => {
    page = await visit(route('auth/view-signup'))
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
    page = await visit(route('auth/view-signup'))

    const passwordInput = await page.locator('input[id="password"]')
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
})
