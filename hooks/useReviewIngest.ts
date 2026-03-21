'use client'

import { Flip } from '@reachdesign/flip'
import { getResponseError } from '@/lib/http'
import { readJsonResponse } from '@/lib/json'
import { useReviewStore } from '@/store/reviewStore'
import type {
  BriefRequestBody,
  ReviewBrief,
  ReviewsRequestBody,
  ReviewsResponseBody,
} from '@/types'

const postJson = async <TRequest>(url: string, body: TRequest): Promise<Flip.R<Response, Error>> =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((response) => Flip.ok(response) as Flip.R<Response, Error>)
    .catch((error: unknown) =>
      Flip.err(
        error instanceof Error ? error : new Error('Network request failed'),
      ) as Flip.R<Response, Error>,
    )

export const useReviewIngest = () => {
  const setUrl = useReviewStore((state) => state.setUrl)
  const setReviews = useReviewStore((state) => state.setReviews)
  const setBrief = useReviewStore((state) => state.setBrief)
  const setLoading = useReviewStore((state) => state.setLoading)
  const setError = useReviewStore((state) => state.setError)
  const isLoading = useReviewStore((state) => state.isLoading)
  const error = useReviewStore((state) => state.error)

  const ingest = async (url: string): Promise<Flip.R<ReviewBrief, string>> => {
    setLoading(true)
    setError(null)
    setUrl(url)

    const reviewsResponse = await postJson<ReviewsRequestBody>('/api/reviews', {
      url,
    })

    if (Flip.isErr(reviewsResponse)) {
      const message = Flip.e(reviewsResponse).message
      setError(message)
      setLoading(false)
      return Flip.err(message)
    }

    const reviewsHttp = Flip.v(reviewsResponse)
    if (!reviewsHttp.ok) {
      const message = await getResponseError(reviewsHttp)
      setError(message)
      setLoading(false)
      return Flip.err(message)
    }

    const reviewsBody = await readJsonResponse<ReviewsResponseBody>(reviewsHttp)
    if (Flip.isErr(reviewsBody)) {
      const message = Flip.e(reviewsBody).message
      setError(message)
      setLoading(false)
      return Flip.err(message)
    }

    const { reviews } = Flip.v(reviewsBody)
    setReviews(reviews)

    const briefResponse = await postJson<BriefRequestBody>('/api/brief', { reviews })
    if (Flip.isErr(briefResponse)) {
      const message = Flip.e(briefResponse).message
      setError(message)
      setLoading(false)
      return Flip.err(message)
    }

    const briefHttp = Flip.v(briefResponse)
    if (!briefHttp.ok) {
      const message = await getResponseError(briefHttp)
      setError(message)
      setLoading(false)
      return Flip.err(message)
    }

    const briefBody = await readJsonResponse<ReviewBrief>(briefHttp)
    if (Flip.isErr(briefBody)) {
      const message = Flip.e(briefBody).message
      setError(message)
      setLoading(false)
      return Flip.err(message)
    }

    const brief = Flip.v(briefBody)
    setBrief(brief)
    setLoading(false)
    return Flip.ok(brief)
  }

  return { ingest, isLoading, error }
}
