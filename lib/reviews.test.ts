import { Flip } from '@reachdesign/flip'
import { dedupeReviews, getReviewPageUrl, getScrapePayload, isTrustpilotReviewUrl, mapExtractedReviews } from '@/lib/reviews'

describe('reviews helpers', () => {
  it('validates Trustpilot review URLs', () => {
    expect(isTrustpilotReviewUrl('https://www.trustpilot.com/review/example.com')).toBe(true)
    expect(isTrustpilotReviewUrl('https://example.com')).toBe(false)
  })

  it('adds page params for pagination', () => {
    expect(getReviewPageUrl('https://www.trustpilot.com/review/example.com', 1)).toBe(
      'https://www.trustpilot.com/review/example.com',
    )
    expect(getReviewPageUrl('https://www.trustpilot.com/review/example.com', 2)).toContain(
      'page=2',
    )
  })

  it('extracts and maps Firecrawl payloads', () => {
    const payload = getScrapePayload({
      success: true,
      data: {
        json: {
          reviews: [
            {
              author: 'Taylor',
              rating: 5,
              title: 'Fast service',
              body: 'Everything was handled quickly.',
              date: '2025-01-01T00:00:00.000Z',
              verified: true,
            },
          ],
        },
      },
    })

    expect(Flip.isOk(payload)).toBe(true)
    if (Flip.isErr(payload)) return

    expect(
      mapExtractedReviews(Flip.v(payload)).at(0),
    ).toMatchObject({
      author: 'Taylor',
      rating: 5,
      verified: true,
    })
  })

  it('dedupes repeated reviews', () => {
    const reviews = dedupeReviews([
      {
        id: '1',
        author: 'Taylor',
        rating: 5,
        title: '',
        body: 'Repeated',
        date: '2025-01-01T00:00:00.000Z',
        verified: false,
      },
      {
        id: '2',
        author: 'Taylor',
        rating: 5,
        title: '',
        body: 'Repeated',
        date: '2025-01-01T00:00:00.000Z',
        verified: false,
      },
    ])

    expect(reviews).toHaveLength(1)
  })
})
