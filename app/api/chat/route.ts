import { google } from '@ai-sdk/google'
import { convertToModelMessages, generateText, streamText, type UIMessage } from 'ai'
import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { getChatFallbackMessage, normalizeErrorMessage } from '@/lib/errorMessages'
import { checkGuardrails, isQueryInScope, sanitizeReviewContext } from '@/lib/guardrails'
import { parseJson } from '@/lib/json'
import { createRouteLogger } from '@/lib/logger'
import { getUIMessageText } from '@/lib/messages'
import { getSystemPrompt } from '@/lib/prompts'
import { ensureReviewEmbeddings, retrieveTopKReviews } from '@/lib/rag'
import type { ChatRequestBody, LlmClient } from '@/types'

export const maxDuration = 30
const kModel = 'gemini-3-flash-preview'

const getBlockedMessage = (mode: ChatRequestBody['mode']) =>
  mode === 'exec'
    ? 'I can only assist with executive-level review analysis.'
    : 'I can only assist with analysis of the provided review data.'

const getLatestUserMessage = (messages: readonly UIMessage[]) =>
  [...messages].reverse().find(({ role }) => role === 'user')

const stripMessageIds = (messages: readonly UIMessage[]) =>
  messages.map((message) => {
    const { id, ...rest } = message
    void id
    return rest
  })

const createScopeLlmClient = (): LlmClient => ({
  generate: async ({ system, user, context, temperature }) => {
    const result = await generateText({
      model: google(kModel),
      system,
      prompt: `${context}\n\n${user}`,
      temperature,
      maxOutputTokens: 32,
    })

    return result.text
  },
})

export const POST = async (request: Request) => {
  const requestId = crypto.randomUUID()
  const requestLogger = createRouteLogger('/api/chat', requestId)
  const startedAt = Date.now()

  requestLogger.info({ event: 'request_received' }, 'Incoming chat request')
  const body = await request.text().then((value) => parseJson<ChatRequestBody>(value))
  if (Flip.isErr(body)) {
    requestLogger.warn({ event: 'invalid_request_body' }, 'Chat request body was invalid')
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages, mode, reviews } = Flip.v(body)
  requestLogger.info(
    { event: 'chat_context_ready', mode, messageCount: messages.length, reviewCount: reviews.length },
    'Chat request context prepared',
  )
  const latestUserMessage = getLatestUserMessage(messages)
  const latestUserText = latestUserMessage ? getUIMessageText(latestUserMessage) : ''
  const guardrailResult = checkGuardrails(latestUserText)

  if (Flip.isErr(guardrailResult)) {
    requestLogger.warn(
      { event: 'guardrail_blocked', reason: Flip.e(guardrailResult), durationMs: Date.now() - startedAt },
      'Chat request blocked by guardrails',
    )
    return NextResponse.json({ error: getBlockedMessage(mode) }, { status: 400 })
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    requestLogger.error(
      { event: 'chat_unavailable', reason: 'missing_google_api_key', durationMs: Date.now() - startedAt },
      'Chat request rejected because the Google API key is missing',
    )
    return NextResponse.json({ error: getChatFallbackMessage() }, { status: 503 })
  }

  const scopeResult = await isQueryInScope(latestUserText, sanitizeReviewContext(reviews), createScopeLlmClient())

  if (Flip.isErr(scopeResult)) {
    requestLogger.warn(
      { event: 'scope_blocked', reason: Flip.e(scopeResult), durationMs: Date.now() - startedAt },
      'Scope classifier marked query out-of-scope; continuing with prompt-level guardrails',
    )
  }

  const embeddedReviews = await ensureReviewEmbeddings(reviews)
  if (Flip.isErr(embeddedReviews)) {
    const message = normalizeErrorMessage(Flip.e(embeddedReviews).message)
    requestLogger.error(
      { event: 'embedding_unavailable', error: message, durationMs: Date.now() - startedAt },
      'Chat request failed while ensuring review embeddings',
    )
    return NextResponse.json({ error: message }, { status: 503 })
  }

  const retrievedReviews = await retrieveTopKReviews(latestUserText, Flip.v(embeddedReviews))
  if (Flip.isErr(retrievedReviews)) {
    const message = normalizeErrorMessage(Flip.e(retrievedReviews).message)
    requestLogger.error(
      { event: 'retrieval_failed', error: message, durationMs: Date.now() - startedAt },
      'Chat request failed during vector retrieval',
    )
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const modelMessages = await convertToModelMessages(stripMessageIds(messages))
  requestLogger.info(
    {
      event: 'chat_stream_started',
      model: kModel,
      durationMs: Date.now() - startedAt,
      retrievedReviewCount: Flip.v(retrievedReviews).length,
    },
    'Starting Gemini chat stream',
  )
  const result = streamText({
    model: google(kModel),
    system: getSystemPrompt(mode, Flip.v(retrievedReviews)),
    messages: modelMessages,
    maxOutputTokens: 900,
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      const message = normalizeErrorMessage(error instanceof Error ? error.message : 'AI chat is unavailable')
      requestLogger.error(
        { event: 'chat_stream_error', error: message, durationMs: Date.now() - startedAt },
        'Gemini chat stream failed',
      )
      return message
    },
  })
}
