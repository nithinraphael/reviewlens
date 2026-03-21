import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReviewStore } from '@/types'

const kStorageKey = 'review-analysis-store'

const kInitialState = {
  url: '',
  reviews: [],
  brief: null,
  mode: 'analyst',
  isLoading: false,
  error: null,
} as const

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set) => ({
      ...kInitialState,
      setUrl: (url) => set({ url }),
      setReviews: (reviews) => set({ reviews }),
      setBrief: (brief) => set({ brief }),
      setMode: (mode) => set({ mode }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          url: '',
          reviews: [],
          brief: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: kStorageKey,
      partialize: ({ url, reviews, brief, mode }) => ({
        url,
        reviews,
        brief,
        mode,
      }),
    },
  ),
)
