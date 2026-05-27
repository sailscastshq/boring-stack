const { test } = require('sounding')

test('health endpoint reports ok', async ({ get, expect }) => {
  const response = await get('/health')

  expect(response).toHaveStatus(200)
  expect(response).toHaveJsonPath('status', 'ok')
})
