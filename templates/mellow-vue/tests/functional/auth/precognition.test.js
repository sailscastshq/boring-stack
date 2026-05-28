const { test } = require('sounding')

const precognitionHeaders = {
  accept: 'application/json',
  precognition: 'true',
  'precognition-validate-only': 'email'
}

test('forgot password returns Precognition errors for invalid email', async ({
  sails,
  expect
}) => {
  const response = await sails.sounding.request
    .withHeaders(precognitionHeaders)
    .post('/forgot-password', {
      email: 'not-an-email'
    })

  expect(response).toHaveStatus(422)
  expect(response).toHaveHeader('precognition', 'true')
  expect(response).toHaveHeader('vary', 'Precognition')
  expect(response.data.errors.email).toEqual([
    'Please enter a valid email address'
  ])
})

test('forgot password returns Precognition success for valid email', async ({
  sails,
  expect
}) => {
  const response = await sails.sounding.request
    .withHeaders(precognitionHeaders)
    .post('/forgot-password', {
      email: 'person@example.com'
    })

  expect(response).toHaveStatus(204)
  expect(response).toHaveHeader('precognition', 'true')
  expect(response).toHaveHeader('precognition-success', 'true')
  expect(response).toHaveHeader('vary', 'Precognition')
})
