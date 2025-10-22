module.exports = {
  friendlyName: 'Transfer team ownership',

  description: 'Transfer ownership of a team to another member.',

  inputs: {
    teamId: {
      type: 'string',
      required: true,
      description: 'The ID of the team to transfer ownership of.'
    },
    newOwnerEmail: {
      type: 'string',
      required: true,
      isEmail: true,
      description: 'Email address of the new owner.'
    },
    confirmationText: {
      type: 'string',
      required: true,
      description: 'Confirmation text that must match the required format.'
    }
  },

  exits: {
    success: {
      responseType: 'inertiaRedirect',
      description: 'Ownership transferred successfully.'
    },
    badRequest: {
      description: 'Invalid input or confirmation text.',
      responseType: 'badRequest'
    },
    notFound: {
      description: 'Team or new owner not found.',
      responseType: 'notFound'
    }
  },

  fn: async function ({ teamId, newOwnerEmail, confirmationText }) {
    const currentUser = await User.findOne({ id: this.req.session.userId })

    const team = await Team.findOne({ id: teamId }).populate('memberships')
    if (!team) {
      throw 'notFound'
    }

    const newOwner = await User.findOne({ email: newOwnerEmail.toLowerCase() })
    if (!newOwner) {
      throw {
        badRequest: {
          problems: [
            { newOwnerEmail: 'No user found with this email address.' }
          ]
        }
      }
    }

    const newOwnerMembership = team.memberships.find(
      (membership) => membership.member === newOwner.id
    )
    if (!newOwnerMembership) {
      throw {
        badRequest: {
          problems: [
            { newOwnerEmail: 'This user is not a member of the team.' }
          ]
        }
      }
    }

    if (newOwnerMembership.role === 'owner') {
      throw {
        badRequest: {
          problems: [{ newOwnerEmail: 'This user is already the team owner.' }]
        }
      }
    }

    const expectedText = `transfer ${team.name}`
    if (confirmationText.toLowerCase().trim() !== expectedText.toLowerCase()) {
      throw {
        badRequest: {
          problems: [
            {
              confirmationText: `Please type "transfer ${team.name}" to confirm.`
            }
          ]
        }
      }
    }

    const currentUserMembership = team.memberships.find(
      (membership) =>
        membership.member === currentUser.id && membership.role === 'owner'
    )

    await sails.getDatastore().transaction(async (db) => {
      await Membership.updateOne({
        id: currentUserMembership.id
      })
        .set({
          role: 'member'
        })
        .usingConnection(db)

      await Membership.updateOne({
        id: newOwnerMembership.id
      })
        .set({
          role: 'owner'
        })
        .usingConnection(db)
    })

    await sails.helpers.mail.send.with({
      to: currentUser.email,
      subject: `Team ownership transferred: ${team.name}`,
      template: 'email-transfer-confirmation-old-owner',
      templateData: {
        teamName: team.name,
        newOwnerName: newOwner.fullName || newOwner.email,
        dashboardUrl: `${sails.config.custom.baseUrl}/dashboard`
      }
    })

    await sails.helpers.mail.send.with({
      to: newOwner.email,
      subject: `You are now the owner of ${team.name}`,
      template: 'email-transfer-confirmation-new-owner',
      templateData: {
        teamName: team.name,
        previousOwnerName: currentUser.fullName || currentUser.email,
        teamSettingsUrl: `${sails.config.custom.baseUrl}/settings/team`
      }
    })

    this.req.flash(
      'success',
      `Ownership of ${team.name} has been transferred to ${newOwnerEmail}`
    )
    return '/settings/team'
  }
}
