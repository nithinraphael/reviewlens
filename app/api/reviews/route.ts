import Firecrawl from '@mendable/firecrawl-js'
import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { toFlipError } from '@/lib/flip'
import { parseJson } from '@/lib/json'
import { createRouteLogger } from '@/lib/logger'
import { embedReviews } from '@/lib/rag'
import {
  dedupeReviews,
  getMaxReviews,
  getMaxScrapePages,
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

const scrapeReviews = async (
  url: string,
  requestLogger: ReturnType<typeof createRouteLogger>,
): Promise<Flip.R<readonly TrustpilotReview[], Error>> => {
  if (!isTrustpilotReviewUrl(url)) return Flip.err(new Error('Invalid Trustpilot review URL'))

  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return Flip.err(new Error('Missing FIRECRAWL_API_KEY'))

  const client = new Firecrawl({ apiKey })
  const maxReviews = getMaxReviews()
  const maxPages = getMaxScrapePages()

  let page = 1
  let reviews: readonly TrustpilotReview[] = []

  while (reviews.length < maxReviews && page <= maxPages) {
    const pageUrl = getReviewPageUrl(url, page)
    requestLogger.debug({ event: 'scrape_page_started', page, pageUrl }, 'Scraping Trustpilot page')
    const scrapeResult = await scrapePage(client, pageUrl)
    if (Flip.isErr(scrapeResult)) return Flip.err(Flip.e(scrapeResult))

    const payload = getScrapePayload(Flip.v(scrapeResult))
    if (Flip.isErr(payload)) return Flip.err(Flip.e(payload))

    const pageReviews = mapExtractedReviews(Flip.v(payload), reviews.length)
    requestLogger.debug(
      { event: 'scrape_page_completed', page, extractedReviews: pageReviews.length },
      'Trustpilot page scraped',
    )
    if (pageReviews.length === 0) break

    reviews = dedupeReviews([...reviews, ...pageReviews]).slice(0, maxReviews)
    page += 1
  }

  requestLogger.info(
    { event: 'scrape_limit_reached', pagesScraped: page - 1, maxPages },
    'Stopped scraping after the configured page limit',
  )

  return reviews.length > 0 ? Flip.ok(reviews) : Flip.err(new Error('No reviews found'))
}

export const POST = async (request: Request) => {
  const requestId = crypto.randomUUID()
  const requestLogger = createRouteLogger('/api/reviews', requestId)
  const startedAt = Date.now()

  requestLogger.info({ event: 'request_received' }, 'Incoming reviews request')
  const body = await request.text().then((value) => parseJson<ReviewsRequestBody>(value))
  if (Flip.isErr(body)) {
    requestLogger.warn({ event: 'invalid_request_body' }, 'Reviews request body was invalid')
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url } = Flip.v(body)
  requestLogger.info({ event: 'scrape_started', url }, 'Starting Trustpilot scrape')
  const reviewsResult = await scrapeReviews(url, requestLogger)
  if (Flip.isErr(reviewsResult)) {
    const message = Flip.e(reviewsResult).message
    const status = message.includes('Invalid') ? 400 : 500
    requestLogger.error(
      { event: 'request_failed', status, error: message, durationMs: Date.now() - startedAt },
      'Reviews request failed',
    )
    return NextResponse.json({ error: message }, { status })
  }

  const embeddedReviews = await embedReviews(Flip.v(reviewsResult))
  if (Flip.isErr(embeddedReviews)) {
    const message = Flip.e(embeddedReviews).message
    requestLogger.error(
      { event: 'embedding_failed', error: message, durationMs: Date.now() - startedAt },
      'Review embedding failed',
    )
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const response: ReviewsResponseBody = { reviews: Flip.v(embeddedReviews) }
  requestLogger.info(
    {
      event: 'request_completed',
      reviewCount: response.reviews.length,
      durationMs: Date.now() - startedAt,
    },
    'Reviews request completed',
  )
  return NextResponse.json(response)
}
