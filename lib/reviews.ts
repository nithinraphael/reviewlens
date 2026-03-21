import { Flip } from '@reachdesign/flip'
import { getBoolean, getNumber, getString, isRecord } from '@/lib/object'
import type {
  FirecrawlExtractedPayload,
  FirecrawlExtractedReview,
  TrustpilotReview,
} from '@/types'

export const kReviewExtractionSchema = {
  type: 'object',
  properties: {
    reviews: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          author: { type: 'string' },
          rating: { type: 'number' },
          title: { type: 'string' },
          body: { type: 'string' },
          date: { type: 'string' },
          verified: { type: 'boolean' },
        },
        required: ['author', 'rating', 'body', 'date'],
      },
    },
    businessName: { type: 'string' },
    averageRating: { type: 'number' },
    totalReviews: { type: 'number' },
  },
  required: ['reviews'],
} as const

export const kReviewExtractionPrompt =
  'Extract all customer reviews including author name, star rating (1-5), review title, review body text, date posted, and whether it is a verified purchase.'

const kDefaultMaxReviews = 100
const kMaxScrapePages = 3

const toReviewKey = ({ author, body, date }: TrustpilotReview) => `${author}:${date}:${body}`

export const getMaxReviews = () => {
  const rawValue = process.env.MAX_REVIEWS
  if (!rawValue) return kDefaultMaxReviews

  const parsedValue = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : kDefaultMaxReviews
}

export const getMaxScrapePages = () => kMaxScrapePages

export const isTrustpilotReviewUrl = (value: string) => {
  if (!URL.canParse(value)) return false

  const url = new URL(value)
  return url.hostname.includes('trustpilot.com') && url.pathname.includes('/review/')
}

export const getReviewPageUrl = (value: string, page: number) => {
  const url = new URL(value)
  if (page <= 1) {
    url.searchParams.delete('page')
    return url.toString()
  }

  url.searchParams.set('page', String(page))
  return url.toString()
}

const isFirecrawlExtractedReview = (value: unknown): value is FirecrawlExtractedReview =>
  isRecord(value)

const isFirecrawlPayload = (value: unknown): value is FirecrawlExtractedPayload =>
  isRecord(value) && Array.isArray(value.reviews)

export const getScrapePayload = (value: unknown): Flip.R<FirecrawlExtractedPayload, Error> => {
  if (!isRecord(value)) return Flip.err(new Error('Firecrawl extraction failed'))

  const directJson = value.json
  if (isFirecrawlPayload(directJson)) return Flip.ok(directJson)

  const data = value.data
  if (!isRecord(data)) return Flip.err(new Error('Firecrawl extraction failed'))

  const nestedJson = data.json
  return isFirecrawlPayload(nestedJson)
    ? Flip.ok(nestedJson)
    : Flip.err(new Error('Firecrawl extraction failed'))
}

export const mapExtractedReviews = (
  payload: FirecrawlExtractedPayload,
  startingIndex = 0,
): readonly TrustpilotReview[] =>
  payload.reviews
    .filter(isFirecrawlExtractedReview)
    .map((review, index) => ({
      id: String(startingIndex + index),
      author: getString(review.author, 'Anonymous'),
      rating: getNumber(review.rating),
      title: getString(review.title),
      body: getString(review.body),
      date: getString(review.date, new Date().toISOString()),
      verified: getBoolean(review.verified),
    }))
    .filter(({ body, rating }) => body.length > 0 && rating > 0)

export const dedupeReviews = (reviews: readonly TrustpilotReview[]) => {
  const seen = new Set<string>()

  return reviews.filter((review) => {
    const reviewKey = toReviewKey(review)
    if (seen.has(reviewKey)) return false
    seen.add(reviewKey)
    return true
  })
}

export const summarizeReviewSnippet = ({ rating, title, body, verified }: TrustpilotReview) => ({
  rating,
  title,
  verified,
  body: body.slice(0, 100),
})
