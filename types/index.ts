import type { UIMessage } from 'ai'

export interface TrustpilotReview {
  readonly id: string
  readonly author: string
  readonly rating: number
  readonly title: string
  readonly body: string
  readonly date: string
  readonly verified: boolean
}

export interface ReviewBrief {
  readonly painPoints: readonly string[]
  readonly praiseThemes: readonly string[]
  readonly urgentFlags: readonly string[]
  readonly summary: string
  readonly reviewCount: number
  readonly averageRating: number
}

export type AnalystMode = 'analyst' | 'exec'

export interface ReviewStore {
  readonly url: string
  readonly reviews: readonly TrustpilotReview[]
  readonly brief: ReviewBrief | null
  readonly chatMessages: readonly UIMessage[]
  readonly mode: AnalystMode
  readonly isLoading: boolean
  readonly error: string | null
  setUrl: (url: string) => void
  setReviews: (reviews: readonly TrustpilotReview[]) => void
  setBrief: (brief: ReviewBrief) => void
  setChatMessages: (messages: readonly UIMessage[]) => void
  setMode: (mode: AnalystMode) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export interface FirecrawlExtractedReview {
  readonly author?: string
  readonly rating?: number
  readonly title?: string
  readonly body?: string
  readonly date?: string
  readonly verified?: boolean
}

export interface FirecrawlExtractedPayload {
  readonly reviews: readonly FirecrawlExtractedReview[]
  readonly businessName?: string
  readonly averageRating?: number
  readonly totalReviews?: number
}

export interface ReviewsRequestBody {
  readonly url: string
}

export interface ReviewsResponseBody {
  readonly reviews: readonly TrustpilotReview[]
}

export interface BriefRequestBody {
  readonly reviews: readonly TrustpilotReview[]
}

export interface ErrorResponseBody {
  readonly error: string
}

export interface ChatRequestBody {
  readonly messages: readonly UIMessage[]
  readonly mode: AnalystMode
  readonly reviews: readonly TrustpilotReview[]
}

export interface ExportRequestBody {
  readonly brief: ReviewBrief
  readonly reviews: readonly TrustpilotReview[]
  readonly messages: readonly UIMessage[]
  readonly mode: AnalystMode
}

export interface BBriefPanelProps {
  readonly brief: ReviewBrief
  readonly reviews: readonly TrustpilotReview[]
  readonly onSeeAllReviews?: () => void
}

export interface BMessageListProps {
  readonly messages: readonly UIMessage[]
  readonly isStreaming: boolean
}

export interface BMessageInputProps {
  readonly input: string
  readonly isDisabled: boolean
  readonly onChange: (value: string) => void
  readonly onSubmit: () => void
}

export interface BModeToggleProps {
  readonly mode: AnalystMode
  readonly onChange: (mode: AnalystMode) => void
}

export interface BExportButtonProps {
  readonly isDisabled: boolean
  readonly brief: ReviewBrief | null
  readonly reviews: readonly TrustpilotReview[]
  readonly messages: readonly UIMessage[]
  readonly mode: AnalystMode
}

export interface BIngestLoaderProps {
  readonly isVisible: boolean
  readonly hasReviews: boolean
}
