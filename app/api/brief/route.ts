import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { buildFallbackBrief } from '@/lib/briefFallback'
import { parseReviewBriefJson } from '@/lib/briefParser'
import { normalizeErrorMessage } from '@/lib/errorMessages'
import { toFlipError } from '@/lib/flip'
import { parseJson } from '@/lib/json'
import { createRouteLogger } from '@/lib/logger'
import { buildBriefPrompt, kBriefSystemPrompt } from '@/lib/prompts'
import type { BriefRequestBody, ReviewBrief } from '@/types'

const kModel = 'gemini-3-flash-preview'

const generateBrief = async (
  reviews: BriefRequestBody['reviews'],
  requestLogger: ReturnType<typeof createRouteLogger>,
): Promise<Flip.R<ReviewBrief, Error>> => {
  if (reviews.length === 0) return Flip.err(new Error('Reviews are required'))
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    requestLogger.warn({ event: 'brief_fallback', reason: 'missing_google_api_key' }, 'Using fallback brief')
    return Flip.ok(buildFallbackBrief(reviews))
  }
  const prompt = buildBriefPrompt(reviews)
  requestLogger.info({ event: 'brief_generation_started', reviewCount: reviews.length }, 'Generating AI brief')

  const message = await generateText({
    model: google(kModel),
    system: kBriefSystemPrompt,
    prompt,
    maxOutputTokens: 1000,
  })
    .then((result) => Flip.ok(result.text) as Flip.R<string, Error>)
    .catch((error: unknown) => toFlipError<string>(error, 'Brief generation failed'))

  if (Flip.isErr(message)) {
    requestLogger.error(
      { event: 'brief_fallback', reason: 'provider_error', error: Flip.e(message).message },
      'AI brief failed, using fallback brief',
    )
    return Flip.ok(buildFallbackBrief(reviews))
  }

  const parsedBrief = await parseReviewBriefJson(Flip.v(message))
  if (Flip.isErr(parsedBrief)) {
    requestLogger.error(
      {
        event: 'brief_fallback',
        reason: 'invalid_json',
        error: Flip.e(parsedBrief).message,
        preview: Flip.v(message).slice(0, 200),
      },
      'AI brief returned invalid JSON, using fallback brief',
    )
    return Flip.ok(buildFallbackBrief(reviews))
  }

  return parsedBrief
}

export const POST = async (request: Request) => {
  const requestId = crypto.randomUUID()
  const requestLogger = createRouteLogger('/api/brief', requestId)
  const startedAt = Date.now()

  requestLogger.info({ event: 'request_received' }, 'Incoming brief request')
  const body = await request.text().then((value) => parseJson<BriefRequestBody>(value))
  if (Flip.isErr(body)) {
    requestLogger.warn({ event: 'invalid_request_body' }, 'Brief request body was invalid')
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const reviewCount = Flip.v(body).reviews.length
  const brief = await generateBrief(Flip.v(body).reviews, requestLogger)
  if (Flip.isErr(brief)) {
    const message = normalizeErrorMessage(Flip.e(brief).message)
    const status = message === 'Reviews are required' ? 400 : 500
    requestLogger.error(
      { event: 'request_failed', reviewCount, status, error: message, durationMs: Date.now() - startedAt },
      'Brief request failed',
    )
    return NextResponse.json({ error: message }, { status })
  }

  requestLogger.info(
    { event: 'request_completed', reviewCount, durationMs: Date.now() - startedAt },
    'Brief request completed',
  )
  return NextResponse.json(Flip.v(brief))
}
