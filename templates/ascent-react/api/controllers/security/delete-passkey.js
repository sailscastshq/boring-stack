module.exports = {
  friendlyName: 'Delete passkey',
  description: 'Delete a specific passkey by its credential ID.',
  inputs: {
    credentialId: {
      type: 'string',
      required: true,
      description: 'The credential ID of the passkey to delete.'
    }
  },
  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Passkey deleted successfully.'
    },
    notFound: {
      responseType: 'badRequest',
      description: 'Passkey not found.'
    },
    lastPasskey: {
      responseType: 'badRequest',
      description: 'Cannot delete the last passkey when no password is set.'
    }
  },

  fn: async function ({ credentialId }) {
    const userId = this.req.session.userId

    const user = await User.findOne({ id: userId }).select([
      'passkeys',
      'password',
      'passkeyEnabled'
    ])

    if (!user || !user.passkeys || user.passkeys.length === 0) {
      throw {
        notFound: {
          problems: [{ credentialId: 'No passkeys found.' }]
        }
      }
    }

    // Find the passkey to delete
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

    const passkeyToDelete = user.passkeys[passkeyIndex]

    // Check if this is the last passkey and user has no password
    if (user.passkeys.length === 1 && !user.password) {
      throw {
        lastPasskey: {
          problems: [
            {
              credentialId:
                'Cannot delete your only passkey without a password set. Set up a password first or disable all passkeys instead.'
            }
          ]
        }
      }
    }

    // Remove the passkey from the array
    const updatedPasskeys = user.passkeys.filter(
      (passkey) => passkey.credentialID !== credentialId
    )

    // If no passkeys remain, disable passkey authentication
    const passkeyEnabled = updatedPasskeys.length > 0

    await User.updateOne({ id: userId }).set({
      passkeys: updatedPasskeys,
      passkeyEnabled: passkeyEnabled,
      // Clear challenge data if passkeys are disabled
      ...(updatedPasskeys.length === 0 && {
        passkeyChallenge: null,
        passkeyChallengeExpiresAt: null
      })
    })

    const message =
      updatedPasskeys.length === 0
        ? 'All passkeys removed. Passkey authentication has been disabled.'
        : `"${passkeyToDelete.name}" has been deleted.`

    this.req.flash('success', message)
    return '/settings/security'
  }
}
