export const USER_SUBSCRIPTION_PLANS = ['free', 'premium']
export const USER_SUBSCRIPTION_STATUSES = [
  'inactive',
  'trialing',
  'active',
  'past_due',
  'canceled',
]

const PREMIUM_ACCESS_STATUSES = new Set(['trialing', 'active'])
const PREMIUM_GRACE_STATUSES = new Set(['past_due', 'canceled'])

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')

const normalizeDate = (value) => {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export const createDefaultUserSubscription = () => ({
  plan: 'free',
  status: 'inactive',
  provider: '',
  customerId: '',
  subscriptionId: '',
  currentPeriodStart: null,
  currentPeriodEnd: null,
  premiumExpiresAt: null,
})

export const normalizeUserSubscription = (subscription = {}) => {
  const defaultSubscription = createDefaultUserSubscription()
  const normalizedPlan = USER_SUBSCRIPTION_PLANS.includes(subscription?.plan)
    ? subscription.plan
    : defaultSubscription.plan
  const normalizedStatus = USER_SUBSCRIPTION_STATUSES.includes(subscription?.status)
    ? subscription.status
    : defaultSubscription.status

  return {
    plan: normalizedPlan,
    status: normalizedStatus,
    provider: trimString(subscription?.provider),
    customerId: trimString(subscription?.customerId),
    subscriptionId: trimString(subscription?.subscriptionId),
    currentPeriodStart: normalizeDate(subscription?.currentPeriodStart),
    currentPeriodEnd: normalizeDate(subscription?.currentPeriodEnd),
    premiumExpiresAt: normalizeDate(subscription?.premiumExpiresAt),
  }
}

const resolvePremiumExpiry = (subscription) =>
  subscription.premiumExpiresAt || subscription.currentPeriodEnd || null

export const hasPremiumAccess = (subscription, now = new Date()) => {
  const normalizedSubscription = normalizeUserSubscription(subscription)

  if (normalizedSubscription.plan !== 'premium') {
    return false
  }

  if (PREMIUM_ACCESS_STATUSES.has(normalizedSubscription.status)) {
    return true
  }

  if (!PREMIUM_GRACE_STATUSES.has(normalizedSubscription.status)) {
    return false
  }

  const premiumExpiry = resolvePremiumExpiry(normalizedSubscription)

  return Boolean(premiumExpiry && premiumExpiry.getTime() > now.getTime())
}

export const buildPublicSubscription = (subscription) => normalizeUserSubscription(subscription)

export const buildUserEntitlements = (subscription) => {
  const normalizedSubscription = normalizeUserSubscription(subscription)
  const isPremium = hasPremiumAccess(normalizedSubscription)

  return {
    plan: normalizedSubscription.plan,
    isPremium,
    adsEnabled: !isPremium,
    offlineDownloadsEnabled: isPremium,
    maxAudioQuality: isPremium ? 'lossless' : 'standard',
  }
}
