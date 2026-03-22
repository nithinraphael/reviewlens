import { google } from '@ai-sdk/google'
import { embed, embedMany } from 'ai'
import { Flip } from '@reachdesign/flip'
import { toFlipError } from '@/lib/flip'
import type { TrustpilotReview } from '@/types'

const kEmbeddingModel = 'text-embedding-004'
const kDefaultTopKReviews = 5
const kMaxReviewContextChars = 600

const toFiniteEmbedding = (value: readonly number[] | undefined) =>
  Array.isArray(value) && value.length > 0 && value.every(Number.isFinite) ? value : null

const createReviewEmbeddingText = ({
  author,
  rating,
  title,
  body,
  date,
  verified,
}: TrustpilotReview) =>
  [
    `author: ${author}`,
    `rating: ${rating}/5`,
    title ? `title: ${title}` : '',
    `body: ${body}`,
    `date: ${date}`,
    `verified: ${verified ? 'yes' : 'no'}`,
  ]
    .filter(Boolean)
    .join('\n')

const createEmbeddedReviews = (
  reviews: readonly TrustpilotReview[],
  embeddings: readonly (readonly number[])[],
): readonly TrustpilotReview[] =>
  reviews.map((review, index) => ({
    ...review,
    embedding: embeddings[index],
  }))

const mergeEmbeddedReviews = (
  reviews: readonly TrustpilotReview[],
  embeddingsById: ReadonlyMap<string, readonly number[]>,
): readonly TrustpilotReview[] =>
  reviews.map((review) => ({
    ...review,
    embedding: embeddingsById.get(review.id) ?? review.embedding,
  }))

const createEmbeddingModel = () => google.embedding(kEmbeddingModel)

const getTopKReviews = () => {
  const rawValue = process.env.TOP_K_REVIEWS
  if (!rawValue) return kDefaultTopKReviews

  const parsedValue = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : kDefaultTopKReviews
}

const cosineSimilarity = (left: readonly number[], right: readonly number[]) => {
  if (left.length === 0 || left.length !== right.length) return -1

  let dot = 0
  let leftNorm = 0
  let rightNorm = 0

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0
    const rightValue = right[index] ?? 0
    dot += leftValue * rightValue
    leftNorm += leftValue * leftValue
    rightNorm += rightValue * rightValue
  }

  if (leftNorm === 0 || rightNorm === 0) return -1
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm))
}

export const hasReviewEmbedding = (review: TrustpilotReview) => toFiniteEmbedding(review.embedding) !== null

export const ensureReviewEmbeddings = async (
  reviews: readonly TrustpilotReview[],
): Promise<Flip.R<readonly TrustpilotReview[], Error>> => {
  if (reviews.length === 0) return Flip.ok(reviews)
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return Flip.err(new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY'))

  const reviewsMissingEmbeddings = reviews.filter((review) => !hasReviewEmbedding(review))
  if (reviewsMissingEmbeddings.length === 0) return Flip.ok(reviews)

  const embeddingResult = await embedMany({
    model: createEmbeddingModel(),
    values: reviewsMissingEmbeddings.map(createReviewEmbeddingText),
  })
    .then((result) => Flip.ok(result.embeddings as readonly (readonly number[])[]) as Flip.R<readonly (readonly number[])[], Error>)
    .catch((error: unknown) => toFlipError<readonly (readonly number[])[]>(error, 'Review embedding failed'))

  if (Flip.isErr(embeddingResult)) return embeddingResult

  const embeddingsById = new Map(
    reviewsMissingEmbeddings.map((review, index) => [review.id, Flip.v(embeddingResult)[index] ?? []] as const),
  )

  return Flip.ok(mergeEmbeddedReviews(reviews, embeddingsById))
}

export const embedReviews = async (
  reviews: readonly TrustpilotReview[],
): Promise<Flip.R<readonly TrustpilotReview[], Error>> => {
  if (reviews.length === 0) return Flip.ok(reviews)
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return Flip.err(new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY'))

  const embeddingResult = await embedMany({
    model: createEmbeddingModel(),
    values: reviews.map(createReviewEmbeddingText),
  })
    .then((result) => Flip.ok(result.embeddings as readonly (readonly number[])[]) as Flip.R<readonly (readonly number[])[], Error>)
    .catch((error: unknown) => toFlipError<readonly (readonly number[])[]>(error, 'Review embedding failed'))

  if (Flip.isErr(embeddingResult)) return embeddingResult

  return Flip.ok(createEmbeddedReviews(reviews, Flip.v(embeddingResult)))
}

export const embedQuery = async (query: string): Promise<Flip.R<readonly number[], Error>> =>
  embed({
    model: createEmbeddingModel(),
    value: query,
  })
    .then((result) => Flip.ok(result.embedding as readonly number[]) as Flip.R<readonly number[], Error>)
    .catch((error: unknown) => toFlipError<readonly number[]>(error, 'Query embedding failed'))

export const rankReviewsByQueryEmbedding = (
  queryEmbedding: readonly number[],
  reviews: readonly TrustpilotReview[],
  topK = getTopKReviews(),
) =>
  reviews
    .map((review) => {
      const embedding = toFiniteEmbedding(review.embedding)
      return embedding ? { review, score: cosineSimilarity(queryEmbedding, embedding) } : null
    })
    .filter((value): value is { readonly review: TrustpilotReview; readonly score: number } => value !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
    .map(({ review }) => review)

export const retrieveTopKReviews = async (
  query: string,
  reviews: readonly TrustpilotReview[],
  topK = getTopKReviews(),
): Promise<Flip.R<readonly TrustpilotReview[], Error>> => {
  if (!query.trim()) return Flip.err(new Error('A search query is required'))
  if (reviews.length === 0) return Flip.err(new Error('Reviews are required'))

  const embeddedReviews = await ensureReviewEmbeddings(reviews)
  if (Flip.isErr(embeddedReviews)) return embeddedReviews

  const queryEmbedding = await embedQuery(query)
  if (Flip.isErr(queryEmbedding)) return queryEmbedding

  const topReviews = rankReviewsByQueryEmbedding(Flip.v(queryEmbedding), Flip.v(embeddedReviews), topK)
  return topReviews.length > 0 ? Flip.ok(topReviews) : Flip.err(new Error('No retrievable reviews found'))
}

export const buildRetrievedReviewContext = (reviews: readonly TrustpilotReview[]) =>
  reviews
    .map(
      ({ id, rating, title, body, verified, date }) =>
        [
          `[review_id=${id}]`,
          `rating=${rating}/5`,
          `verified=${verified ? 'yes' : 'no'}`,
          `date=${date}`,
          title ? `title="${title}"` : '',
          `body="${body.slice(0, kMaxReviewContextChars)}"`,
        ]
          .filter(Boolean)
          .join(' '),
    )
    .join('\n')
