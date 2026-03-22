import type { ReviewBrief, TrustpilotReview } from '@/types'

interface ThemeBucket {
  readonly label: string
  readonly keywords: readonly string[]
}

const kPainThemeBuckets: readonly ThemeBucket[] = [
  { label: 'Slow response times from support', keywords: ['slow response', 'no response', 'waiting', 'waited', 'delay'] },
  { label: 'Inconsistent service quality across orders', keywords: ['inconsistent', 'different each time', 'hit or miss', 'not consistent'] },
  { label: 'Refund and cancellation handling is difficult', keywords: ['refund', 'cancel', 'cancellation', 'money back', 'chargeback'] },
  { label: 'Delivery arrived late or not as promised', keywords: ['late delivery', 'arrived late', 'did not arrive', 'delivery issue'] },
  { label: 'Order outcome did not match expectations', keywords: ['not as described', 'different from', 'expectation', 'misleading'] },
] as const

const kPraiseThemeBuckets: readonly ThemeBucket[] = [
  { label: 'Helpful and professional support team', keywords: ['helpful', 'supportive', 'friendly', 'professional', 'customer service'] },
  { label: 'Fast and smooth ordering process', keywords: ['easy to order', 'smooth process', 'quick checkout', 'simple to use'] },
  { label: 'Reliable and on-time delivery experience', keywords: ['on time', 'arrived on time', 'prompt delivery', 'quick delivery'] },
  { label: 'High product quality and presentation', keywords: ['high quality', 'great quality', 'beautiful', 'fresh', 'well packaged'] },
  { label: 'Good value for money', keywords: ['good value', 'worth the price', 'reasonable price', 'fair price'] },
] as const

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

const toAverageRating = (reviews: readonly TrustpilotReview[]) => {
  if (reviews.length === 0) return 0
  const total = reviews.reduce((sum, { rating }) => sum + rating, 0)
  return Number((total / reviews.length).toFixed(1))
}

const getReviewText = ({ title, body }: TrustpilotReview) => `${title} ${body}`.toLowerCase()

const countBucketMatches = (reviews: readonly TrustpilotReview[], buckets: readonly ThemeBucket[]) =>
  buckets
    .map(({ label, keywords }) => ({
      label,
      count: reviews.filter((review) => keywords.some((keyword) => getReviewText(review).includes(keyword))).length,
    }))
    .filter(({ count }) => count > 0)
    .sort((left, right) => right.count - left.count)
    .map(({ label }) => label)

const pickThemes = (
  reviews: readonly TrustpilotReview[],
  buckets: readonly ThemeBucket[],
  fallback: readonly string[],
) => {
  const ranked = countBucketMatches(reviews, buckets).slice(0, 5)
  return ranked.length > 0 ? ranked : fallback
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
    kPainThemeBuckets,
    ['Slow response times', 'Service inconsistency', 'Expectation mismatch'],
  )
  const praiseThemes = pickThemes(
    reviews.filter(({ rating }) => rating >= 4),
    kPraiseThemeBuckets,
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
