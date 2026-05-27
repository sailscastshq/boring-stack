const { test } = require('sounding')

const inertiaHeaders = {
  'x-inertia': 'true',
  'x-requested-with': 'XMLHttpRequest',
  accept: 'text/html, application/xhtml+xml'
}

async function createTeamOwner() {
  const user = await User.create({
    fullName: 'Ascent Tester',
    email: 'ascent-tester@example.com',
    emailStatus: 'verified'
  }).fetch()

  const team = await Team.create({ name: 'Acme Team' }).fetch()

  await Membership.create({
    member: user.id,
    team: team.id,
    role: 'owner',
    status: 'active'
  })

  return { id: user.id, team: team.id }
}

test('guest is redirected from dashboard to login', async ({ get, expect }) => {
  const response = await get('/dashboard')

  expect(response).toHaveStatus(302)
  expect(response).toRedirectTo('/login')
})

test('authenticated team owner can visit dashboard', async ({
  sails,
  expect
}) => {
  const owner = await createTeamOwner()
  const response = await sails.sounding.request
    .as(owner)
    .withHeaders(inertiaHeaders)
    .get('/dashboard')

  expect(response).toHaveStatus(200)
  expect(response).toBeInertiaPage('dashboard/index')
})
