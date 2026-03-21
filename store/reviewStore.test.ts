import { useReviewStore } from '@/store/reviewStore'

describe('useReviewStore', () => {
  afterEach(() => {
    useReviewStore.getState().reset()
    useReviewStore.getState().setMode('analyst')
  })

  it('updates review data through setters', () => {
    useReviewStore.getState().setUrl('https://www.trustpilot.com/review/example.com')
    useReviewStore.getState().setReviews([
      {
        id: '1',
        author: 'Alex',
        rating: 4,
        title: 'Solid',
        body: 'Good overall experience.',
        date: '2025-01-01T00:00:00.000Z',
        verified: true,
      },
    ])

    const state = useReviewStore.getState()
    expect(state.url).toContain('trustpilot.com')
    expect(state.reviews).toHaveLength(1)
  })

  it('preserves mode on reset', () => {
    useReviewStore.getState().setMode('exec')
    useReviewStore.getState().reset()

    expect(useReviewStore.getState().mode).toBe('exec')
    expect(useReviewStore.getState().reviews).toHaveLength(0)
  })
})
