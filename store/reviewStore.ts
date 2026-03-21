import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReviewStore } from '@/types'

const kStorageKey = 'review-analysis-store'

const kInitialState = {
  url: '',
  reviews: [],
  brief: null,
  chatMessages: [],
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
      setChatMessages: (chatMessages) => set({ chatMessages }),
      setMode: (mode) => set({ mode }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          url: '',
          reviews: [],
          brief: null,
          chatMessages: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: kStorageKey,
      partialize: ({ url, reviews, brief, chatMessages, mode }) => ({
        url,
        reviews,
        brief,
        chatMessages,
        mode,
      }),
    },
  ),
)
