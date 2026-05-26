const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const resolvePageProps = require('../../lib/props/resolve-page-props')
const DeferProp = require('../../lib/props/defer-prop')

describe('resolvePageProps', function () {
  it('keeps the existing resolved props return shape', async function () {
    const props = await resolvePageProps({
      user: () => ({ id: 1 }),
      count: 3
    })

    assert.deepEqual(props, {
      user: { id: 1 },
      count: 3
    })
  })

  it('rescues opt-in deferred prop failures', async function () {
    const result = await resolvePageProps.withMetadata({
      user: { id: 1 },
      analytics: new DeferProp(async () => {
        throw new Error('Analytics service unavailable')
      }).rescue()
    })

    assert.deepEqual(result.props, {
      user: { id: 1 }
    })
    assert.deepEqual(result.rescuedProps, ['analytics'])
  })

  it('rescues deferred props configured with rescue option', async function () {
    const result = await resolvePageProps.withMetadata({
      permissions: new DeferProp(
        async () => {
          throw new Error('Permissions service unavailable')
        },
        { rescue: true }
      )
    })

    assert.deepEqual(result.props, {})
    assert.deepEqual(result.rescuedProps, ['permissions'])
  })

  it('throws deferred prop failures unless rescue is enabled', async function () {
    await assert.rejects(
      () =>
        resolvePageProps.withMetadata({
          analytics: new DeferProp(async () => {
            throw new Error('Analytics service unavailable')
          })
        }),
      /Analytics service unavailable/
    )
  })

  it('throws normal prop callback failures', async function () {
    await assert.rejects(
      () =>
        resolvePageProps.withMetadata({
          analytics: async () => {
            throw new Error('Analytics service unavailable')
          }
        }),
      /Analytics service unavailable/
    )
  })
})
