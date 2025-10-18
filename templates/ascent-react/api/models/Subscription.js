module.exports = {
  tableName: 'subscriptions',

  attributes: {
    subscriptionId: {
      type: 'string',
      description: 'Lemon Squeezy subscription ID',
      unique: true,
      required: true,
      columnName: 'subscription_id'
    },
    status: {
      type: 'string',
      isIn: ['active', 'cancelled', 'expired', 'past_due', 'unpaid'],
      defaultsTo: 'active',
      description: 'Current subscription status'
    },
    planName: {
      type: 'string',
      isIn: ['starter', 'pro'],
      required: true,
      description: 'Plan tier name',
      columnName: 'plan_name'
    },
    billingCycle: {
      type: 'string',
      isIn: ['monthly', 'yearly'],
      required: true,
      description: 'Billing frequency',
      columnName: 'billing_cycle'
    },
    currentPeriodStart: {
      type: 'string',
      description: 'Current billing period start date (ISO string)',
      columnName: 'current_period_start'
    },
    currentPeriodEnd: {
      type: 'string',
      description: 'Current billing period end date (ISO string)',
      columnName: 'current_period_end'
    },
    nextBillingDate: {
      type: 'string',
      description: 'Next billing date (ISO string)',
      columnName: 'next_billing_date'
    },
    team: {
      model: 'Team',
      required: true,
      description: 'Team this subscription belongs to'
    }
  },

  customToJSON: function () {
    return {
      id: this.id,
      lemonSqueezyId: this.lemonSqueezyId,
      status: this.status,
      planName: this.planName,
      billingCycle: this.billingCycle,
      currentPeriodStart: this.currentPeriodStart,
      currentPeriodEnd: this.currentPeriodEnd,
      nextBillingDate: this.nextBillingDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
