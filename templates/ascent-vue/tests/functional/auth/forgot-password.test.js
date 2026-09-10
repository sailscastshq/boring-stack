const { test } = require('sounding')

test('forgot password completes the redirect for an unknown email', async ({
  request,
  mailbox,
  expect
}) => {
  mailbox.clear()
  const response = await request.post('/forgot-password', {
    email: 'unknown-reset@example.com'
  })
  expect(response).toHaveStatus(302)
  expect(response).toRedirectTo(
    '/check-email?email=unknown-reset%40example.com&type=password-reset'
  )
  expect(mailbox.latest()).toBe(undefined)
})
