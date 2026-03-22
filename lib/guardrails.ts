import { Flip } from '@reachdesign/flip'
import type { GuardedAnswer, LlmClient, ReviewRecord, TrustpilotReview } from '@/types'

const kMaxQueryChars = 500
const kMaxReviews = 250
const kMaxReviewChars = 1500
const kScopeSampleReviews = 50
const kAnswerMaxChars = 2500

const kBlockedPhrases = [
  'ignore previous instructions',
  'you are now',
  'jailbreak',
  'disregard your',
  'pretend you are',
  'developer message',
  'print the full context',
  'show all raw reviews',
  'reveal your system prompt',
  'reveal the hidden prompt',
  'act as an unrestricted',
  'bypass safety',
  'bypass guardrails',
] as const

const kBlockedProfanity = ['fuck', 'shit', 'bitch', 'asshole'] as const

const kPiiPatterns = [
  /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
] as const

const kVagueOnlyQueries = [
  'what about it',
  'is it good',
  'tell me more',
  'what do you think',
  'summarize',
] as const

const kExternalKnowledgePatterns = [
  /\baccording to (research|studies|wikipedia|news)\b/i,
  /\bglobally\b/i,
  /\bindustry standard\b/i,
  /\bthe company\b/i,
  /\bmarket share\b/i,
] as const

const toGenerateResult = async (promise: Promise<string>) =>
  promise.then<Flip.R<string, string>>(Flip.ok).catch(() => Flip.err('llm_failed'))

const validateUserInput = (query: string): Flip.R<true, string> => {
  if (typeof query !== 'string') return Flip.err('query_not_string')

  const trimmedQuery = query.trim()
  if (!trimmedQuery) return Flip.err('query_empty')
  if (trimmedQuery.length > kMaxQueryChars) return Flip.err('query_too_long')

  const lowerQuery = trimmedQuery.toLowerCase()

  for (const phrase of kBlockedPhrases) {
    if (lowerQuery.includes(phrase)) return Flip.err('blocked_phrase')
  }

  for (const phrase of kBlockedProfanity) {
    if (lowerQuery.includes(phrase)) return Flip.err('profanity_detected')
  }

  for (const pattern of kPiiPatterns) {
    if (pattern.test(trimmedQuery)) return Flip.err('pii_detected')
  }

  return Flip.ok(true)
}

const isAmbiguousQuery = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery.split(/\s+/).length < 4) return true
  return (kVagueOnlyQueries as readonly string[]).includes(normalizedQuery)
}

const hasReviewCitation = (answer: string) => /\[review_id=[^\]]+\]/i.test(answer)

const looksLikeExternalKnowledge = (answer: string) =>
  kExternalKnowledgePatterns.some((pattern) => pattern.test(answer))

const buildReviewRecord = ({ id, title, body, rating, date }: TrustpilotReview): ReviewRecord => ({
  id: String(id).trim(),
  reviewText: `${title ? `${title}. ` : ''}${body}`.trim().slice(0, kMaxReviewChars),
  rating,
  createdAt: date ? String(date).trim().slice(0, 40) : undefined,
})

const createReviewSample = (dataset: readonly ReviewRecord[]) =>
  dataset
    .slice(0, kScopeSampleReviews)
    .map(({ id, reviewText }) => `[review_id=${id}] ${reviewText}`)
    .join('\n')

const createReviewContext = (dataset: readonly ReviewRecord[]) =>
  dataset
    .map(
      ({ id, product, rating, reviewText }) =>
        `[review_id=${id}] product=${product ?? 'na'} rating=${rating ?? 'na'} text="${reviewText}"`,
    )
    .join('\n')

export const sanitizeContext = (dataset: readonly ReviewRecord[]) => {
  if (!Array.isArray(dataset)) return [] as readonly ReviewRecord[]

  return dataset
    .slice(0, kMaxReviews)
    .map(({ id, reviewText, rating, product, createdAt }) => ({
      id: String(id ?? '').trim(),
      reviewText: String(reviewText ?? '').trim().slice(0, kMaxReviewChars),
      rating: typeof rating === 'number' ? rating : undefined,
      product: product ? String(product).trim().slice(0, 120) : undefined,
      createdAt: createdAt ? String(createdAt).trim().slice(0, 40) : undefined,
    }))
    .filter(({ id, reviewText }) => id.length > 0 && reviewText.length > 0)
}

export const sanitizeReviewContext = (reviews: readonly TrustpilotReview[]) =>
  sanitizeContext(reviews.map(buildReviewRecord))

export const generateRefusalResponse = (): GuardedAnswer => ({
  status: 'refused',
  reason: 'OUT_OF_SCOPE_OR_UNSAFE',
  answer:
    'I can only answer questions strictly based on the provided review dataset. Please ask about review content, ratings, sentiment, themes, or products present in those reviews.',
})

export const checkGuardrails = (message: string): Flip.R<true, string> => {
  const inputCheck = validateUserInput(message)
  if (Flip.isErr(inputCheck)) return inputCheck
  if (isAmbiguousQuery(message)) return Flip.err('query_ambiguous')
  return Flip.ok(true)
}

export const isQueryInScope = async (
  query: string,
  dataset: readonly ReviewRecord[],
  llm: LlmClient,
): Promise<Flip.R<true, string>> => {
  const inputCheck = validateUserInput(query)
  if (Flip.isErr(inputCheck)) return inputCheck
  if (isAmbiguousQuery(query)) return Flip.err('query_ambiguous')

  const cleanDataset = sanitizeContext(dataset)
  if (cleanDataset.length === 0) return Flip.err('empty_context')

  const reviewSample = createReviewSample(cleanDataset)
  const system = [
    'You are a strict binary classifier for a review-grounded QA system.',
    'Task: decide if the QUERY can be answered ONLY from the provided REVIEWS.',
    'Return exactly one token: IN_SCOPE or OUT_OF_SCOPE.',
    'If ambiguous, underspecified, or requires outside knowledge, return OUT_OF_SCOPE.',
    'Do not output anything else.',
  ].join(' ')
  const user = `QUERY:\n${query}\n\nREVIEWS:\n${reviewSample}`
  const result = await toGenerateResult(
    llm.generate({
      system,
      user,
      context: reviewSample,
      temperature: 0,
    }),
  )

  if (Flip.isErr(result)) return Flip.err('scope_check_failed')
  return Flip.v(result).trim().toUpperCase() === 'IN_SCOPE' ? Flip.ok(true) : Flip.err('out_of_scope')
}

export const guardedQuery = async (
  query: string,
  dataset: readonly ReviewRecord[],
  llm: LlmClient,
): Promise<GuardedAnswer> => {
  const inputCheck = validateUserInput(query)
  if (Flip.isErr(inputCheck) || isAmbiguousQuery(query)) return generateRefusalResponse()

  const scopeResult = await isQueryInScope(query, dataset, llm)
  if (Flip.isErr(scopeResult)) return generateRefusalResponse()

  const cleanDataset = sanitizeContext(dataset)
  if (cleanDataset.length === 0) return generateRefusalResponse()

  const result = await toGenerateResult(
    llm.generate({
      system: [
        'You are a review-grounded assistant.',
        'Answer ONLY from the provided review dataset.',
        'If evidence is missing in reviews, say: "I cannot determine this from the provided reviews."',
        'Do not use external knowledge.',
        'Cite supporting reviews inline as [review_id=...].',
        'If question is outside review content, refuse.',
      ].join(' '),
      user: `Question: ${query}`,
      context: createReviewContext(cleanDataset),
      temperature: 0.1,
    }),
  )

  if (Flip.isErr(result)) return generateRefusalResponse()

  const answer = String(Flip.v(result) ?? '').trim().slice(0, kAnswerMaxChars)
  if (!answer) return generateRefusalResponse()
  if (!hasReviewCitation(answer)) return generateRefusalResponse()
  if (looksLikeExternalKnowledge(answer) && !hasReviewCitation(answer)) return generateRefusalResponse()
  if (/ignore (instructions|rules)|cannot comply with policy/i.test(answer)) return generateRefusalResponse()

  return { status: 'ok', answer }
}
