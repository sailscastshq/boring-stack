const { test } = require('sounding')

async function createUser(email) {
  return User.create({
    fullName: 'Mellow Tester',
    email,
    emailStatus: 'verified'
  }).fetch()
}

test('forgot password checks the submitted email instead of the session email', async ({
  request,
  mailbox,
  expect
}) => {
  await createUser('stale-password-reset@example.com')

  mailbox.clear()

  const response = await request
    .withSession({
      userEmail: 'stale-password-reset@example.com'
    })
    .post('/forgot-password', {
      email: 'fresh-password-reset@example.com'
    })

  expect(response).toHaveStatus(302)
  expect(response).toRedirectTo('/check-email')
  expect(mailbox.latest()).toBe(undefined)
})
