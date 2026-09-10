const { test } = require('sounding')

test('only enabled team invitation links render the invitation page', async ({
  sails,
  visit,
  expect
}) => {
  const team = await sails.models.team
    .create({ name: 'Invitation Team', inviteLinkEnabled: true })
    .fetch()
  const enabled = await visit(`/team/${team.inviteToken}`)
  expect(enabled).toHaveStatus(200)
  expect(enabled).toBeInertiaPage('team/invite')
  await sails.models.team
    .updateOne({ id: team.id })
    .set({ inviteLinkEnabled: false })
  const disabled = await visit(`/team/${team.inviteToken}`)
  expect(disabled).toHaveStatus(404)
})
