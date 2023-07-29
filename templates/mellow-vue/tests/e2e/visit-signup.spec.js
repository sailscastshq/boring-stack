const { test } = require('@japa/runner')

test('has signup page', async ({ visit, route }) => {
  const page = await visit(route('auth/view-signup'))
  await page.assertTextContains('body', 'Create your account')
})
