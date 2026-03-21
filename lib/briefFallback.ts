import type { ReviewBrief, TrustpilotReview } from '@/types'

const kStopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'for',
  'from',
  'had',
  'has',
  'have',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'my',
  'of',
  'on',
  'or',
  'our',
  'so',
  'that',
  'the',
  'their',
  'them',
  'there',
  'they',
  'this',
  'to',
  'very',
  'was',
  'we',
  'were',
  'with',
  'you',
  'your',
])

const kUrgentKeywords = [
  'fraud',
  'scam',
  'unsafe',
  'safety',
  'legal',
  'refund',
  'charged',
  'chargeback',
  'lawsuit',
  'harassment',
  'discrimination',
  'cancelled',
  'stolen',
  'breach',
  'threat',
] as const

const cleanToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const toAverageRating = (reviews: readonly TrustpilotReview[]) => {
  if (reviews.length === 0) return 0
  const total = reviews.reduce((sum, { rating }) => sum + rating, 0)
  return Number((total / reviews.length).toFixed(1))
}

const countThemes = (reviews: readonly TrustpilotReview[]) => {
  const counts = new Map<string, number>()

  reviews.forEach(({ title, body }) => {
    const tokens = `${title} ${body}`
      .split(/\s+/)
      .map(cleanToken)
      .filter((token) => token.length >= 4 && !kStopWords.has(token))

    tokens.forEach((token) => {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    })
  })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([token]) => token)
}

const formatTheme = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const pickThemes = (reviews: readonly TrustpilotReview[], fallback: readonly string[]) => {
  const ranked = countThemes(reviews)
  const themes = ranked.slice(0, 5).map(formatTheme)
  return themes.length > 0 ? themes : fallback
}

const getUrgentFlags = (reviews: readonly TrustpilotReview[]) =>
  reviews
    .filter(({ body, title, rating }) => {
      const text = `${title} ${body}`.toLowerCase()
      return rating <= 2 && kUrgentKeywords.some((keyword) => text.includes(keyword))
    })
    .slice(0, 3)
    .map(({ title, body }) => (title || body).slice(0, 120))

const getSummary = (reviews: readonly TrustpilotReview[], averageRating: number) => {
  const lowReviews = reviews.filter(({ rating }) => rating <= 2).length
  const highReviews = reviews.filter(({ rating }) => rating >= 4).length
  const negativeShare = reviews.length === 0 ? 0 : Math.round((lowReviews / reviews.length) * 100)
  const positiveShare = reviews.length === 0 ? 0 : Math.round((highReviews / reviews.length) * 100)

  if (averageRating >= 4) {
    return `Customer sentiment is broadly positive, with an average rating of ${averageRating.toFixed(1)} and ${positiveShare}% of reviews landing at 4 stars or above. The main opportunity is protecting these strengths while resolving the smaller set of recurring complaints before they spread.`
  }

  if (averageRating >= 3) {
    return `Customer sentiment is mixed, with an average rating of ${averageRating.toFixed(1)} and noticeable divergence between advocates and detractors. Roughly ${negativeShare}% of reviews are 1-2 star experiences, suggesting uneven service delivery or inconsistent expectations.`
  }

  return `Customer sentiment is under pressure, with an average rating of ${averageRating.toFixed(1)} and ${negativeShare}% of reviews in the 1-2 star range. The biggest priority is addressing the recurring failure points that are driving trust erosion and repeat complaints.`
}

export const buildFallbackBrief = (reviews: readonly TrustpilotReview[]): ReviewBrief => {
  const averageRating = toAverageRating(reviews)
  const painPoints = pickThemes(
    reviews.filter(({ rating }) => rating <= 3),
    ['Slow response times', 'Service inconsistency', 'Expectation mismatch'],
  )
  const praiseThemes = pickThemes(
    reviews.filter(({ rating }) => rating >= 4),
    ['Helpful staff', 'Smooth experience', 'Strong product quality'],
  )
  const urgentFlags = getUrgentFlags(reviews)

  return {
    painPoints,
    praiseThemes,
    urgentFlags,
    summary: getSummary(reviews, averageRating),
    reviewCount: reviews.length,
    averageRating,
  }
}
