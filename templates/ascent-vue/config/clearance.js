/**
 * Clearance configuration
 *
 * Role-based access control (RBAC) with numeric clearance levels
 * for team-based permissions
 */

module.exports.clearance = {
  // Define roles with numeric clearance levels
  roles: {
    member: 0, // Team members
    admin: 1, // Team admins (can invite, manage members)
    owner: 2, // Team owners (full team control)
    superadmin: 3 // Platform super administrators
  },

  // Define permissions for different routes/actions
  permissions: {
    // Team management - admins and owners can invite
    'team/send-email-invite': { level: 1 },

    // Team settings - only owners for sensitive operations
    'team/toggle-invite-link': { level: 2 },
    'team/set-domain-restrictions': { level: 2 },
    'team/remove-domain-restriction': { level: 2 },
    'team/reset-invite-token': { level: 2 },
    'team/update-team': { level: 2 },
    'team/delete-team': { level: 2 },

    // Member management
    'team/remove-member': { level: 1 }, // Admins and owners can remove members
    'team/update-role': { level: 2 }, // Only owners can change roles
    'team/leave-team': { level: 0 }, // Any member can leave (except owners)
    'team/switch-team': { level: 0 }, // Any member can switch teams

    // Platform admin routes (for future use)
    'admin/*': { level: 3 }
  }
}
