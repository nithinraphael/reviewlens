import { buildRetrievedReviewContext, hasReviewEmbedding, rankReviewsByQueryEmbedding } from '@/lib/rag'
import type { TrustpilotReview } from '@/types'

const kReviews: readonly TrustpilotReview[] = [
  {
    id: 'r1',
    author: 'Alex',
    rating: 5,
    title: 'Fast support',
    body: 'The support team resolved my issue in minutes.',
    date: '2026-03-22T12:00:00.000Z',
    verified: true,
    embedding: [1, 0, 0],
  },
  {
    id: 'r2',
    author: 'Sam',
    rating: 2,
    title: 'Billing delays',
    body: 'Refunds were slow and I had to follow up multiple times.',
    date: '2026-03-21T12:00:00.000Z',
    verified: false,
    embedding: [0, 1, 0],
  },
  {
    id: 'r3',
    author: 'Morgan',
    rating: 4,
    title: 'Decent onboarding',
    body: 'The onboarding was clear but activation took a day.',
    date: '2026-03-20T12:00:00.000Z',
    verified: true,
    embedding: [0.2, 0.8, 0],
  },
] as const

describe('rag helpers', () => {
  it('detects whether a review has an embedding', () => {
    expect(hasReviewEmbedding(kReviews[0])).toBe(true)
    expect(
      hasReviewEmbedding({
        ...kReviews[0],
        embedding: [],
      }),
    ).toBe(false)
  })

  it('ranks the most relevant reviews first', () => {
    const result = rankReviewsByQueryEmbedding([0, 1, 0], kReviews, 2)
    expect(result.map(({ id }) => id)).toEqual(['r2', 'r3'])
  })

  it('builds a compact retrieved-review context for prompting', () => {
    const context = buildRetrievedReviewContext(kReviews.slice(0, 1))
    expect(context).toContain('[review_id=r1]')
    expect(context).toContain('rating=5/5')
    expect(context).toContain('title="Fast support"')
  })
})
