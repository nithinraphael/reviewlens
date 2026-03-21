import Firecrawl from '@mendable/firecrawl-js'
import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { toFlipError } from '@/lib/flip'
import { parseJson } from '@/lib/json'
import {
  dedupeReviews,
  getMaxReviews,
  getReviewPageUrl,
  getScrapePayload,
  isTrustpilotReviewUrl,
  kReviewExtractionPrompt,
  kReviewExtractionSchema,
  mapExtractedReviews,
} from '@/lib/reviews'
import type { ReviewsRequestBody, ReviewsResponseBody, TrustpilotReview } from '@/types'

const kFirecrawlError = 'Firecrawl extraction failed'

const scrapePage = async (client: Firecrawl, url: string): Promise<Flip.R<unknown, Error>> =>
  client
    .scrape(url, {
      formats: [
        {
          type: 'json',
          schema: kReviewExtractionSchema,
          prompt: kReviewExtractionPrompt,
        },
      ],
    })
    .then((result) => Flip.ok(result) as Flip.R<unknown, Error>)
    .catch((error: unknown) => toFlipError<unknown>(error, kFirecrawlError))

const scrapeReviews = async (url: string): Promise<Flip.R<readonly TrustpilotReview[], Error>> => {
  if (!isTrustpilotReviewUrl(url)) return Flip.err(new Error('Invalid Trustpilot review URL'))

  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return Flip.err(new Error('Missing FIRECRAWL_API_KEY'))

  const client = new Firecrawl({ apiKey })
  const maxReviews = getMaxReviews()

  let page = 1
  let reviews: readonly TrustpilotReview[] = []

  while (reviews.length < maxReviews) {
    const pageUrl = getReviewPageUrl(url, page)
    const scrapeResult = await scrapePage(client, pageUrl)
    if (Flip.isErr(scrapeResult)) return Flip.err(Flip.e(scrapeResult))

    const payload = getScrapePayload(Flip.v(scrapeResult))
    if (Flip.isErr(payload)) return Flip.err(Flip.e(payload))

    const pageReviews = mapExtractedReviews(Flip.v(payload), reviews.length)
    if (pageReviews.length === 0) break

    reviews = dedupeReviews([...reviews, ...pageReviews]).slice(0, maxReviews)
    page += 1
  }

  return reviews.length > 0 ? Flip.ok(reviews) : Flip.err(new Error('No reviews found'))
}

export const POST = async (request: Request) => {
  const body = await request.text().then((value) => parseJson<ReviewsRequestBody>(value))
  if (Flip.isErr(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url } = Flip.v(body)
  const reviewsResult = await scrapeReviews(url)
  if (Flip.isErr(reviewsResult)) {
    const message = Flip.e(reviewsResult).message
    const status = message.includes('Invalid') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }

  const response: ReviewsResponseBody = { reviews: Flip.v(reviewsResult) }
  return NextResponse.json(response)
}
