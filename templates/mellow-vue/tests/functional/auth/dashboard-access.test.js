const { test } = require('sounding')

const inertiaHeaders = {
  'x-inertia': 'true',
  'x-requested-with': 'XMLHttpRequest',
  accept: 'text/html, application/xhtml+xml'
}

async function createUser() {
  return User.create({
    fullName: 'Mellow Tester',
    email: 'mellow-tester@example.com',
    emailStatus: 'verified'
  }).fetch()
}

test('guest is redirected from dashboard to login', async ({ get, expect }) => {
  const response = await get('/dashboard')

  expect(response).toHaveStatus(302)
  expect(response).toRedirectTo('/login')
})

test('authenticated user can visit dashboard', async ({ sails, expect }) => {
  const user = await createUser()
  const response = await sails.sounding.request
    .as(user)
    .withHeaders(inertiaHeaders)
    .get('/dashboard')

  expect(response).toHaveStatus(200)
  expect(response).toBeInertiaPage('dashboard/index')
})
