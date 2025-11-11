module.exports = {
  friendlyName: 'Rename passkey',
  description: 'Rename a specific passkey by its credential ID.',
  inputs: {
    credentialId: {
      type: 'string',
      required: true,
      description: 'The credential ID of the passkey to rename.'
    },
    name: {
      type: 'string',
      required: true,
      maxLength: 100,
      description: 'The new name for the passkey.'
    }
  },
  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Passkey renamed successfully.'
    },
    notFound: {
      responseType: 'badRequest',
      description: 'Passkey not found.'
    },
    invalid: {
      responseType: 'badRequest',
      description: 'Invalid input provided.'
    }
  },

  fn: async function ({ credentialId, name }) {
    const userId = this.req.session.userId

    if (!name || !name.trim()) {
      throw {
        invalid: {
          problems: [{ name: 'Passkey name is required.' }]
        }
      }
    }

    const trimmedName = name.trim()

    const user = await User.findOne({ id: userId }).select(['passkeys'])

    if (!user || !user.passkeys || user.passkeys.length === 0) {
      throw {
        notFound: {
          problems: [{ credentialId: 'No passkeys found.' }]
        }
      }
    }

    // Find the passkey to rename
    const passkeyIndex = user.passkeys.findIndex(
      (passkey) => passkey.credentialID === credentialId
    )

    if (passkeyIndex === -1) {
      throw {
        notFound: {
          problems: [{ credentialId: 'Passkey not found.' }]
        }
      }
    }

    // Update the passkey name
    const updatedPasskeys = [...user.passkeys]
    updatedPasskeys[passkeyIndex] = {
      ...updatedPasskeys[passkeyIndex],
      name: trimmedName
    }

    await User.updateOne({ id: userId }).set({
      passkeys: updatedPasskeys
    })

    this.req.flash('success', `Passkey renamed to "${trimmedName}".`)
    return '/settings/security'
  }
}
