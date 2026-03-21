import Anthropic from '@anthropic-ai/sdk'
import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { buildFallbackBrief } from '@/lib/briefFallback'
import { normalizeErrorMessage } from '@/lib/errorMessages'
import { toFlipError } from '@/lib/flip'
import { parseJson, stripJsonFences } from '@/lib/json'
import { buildBriefPrompt, kBriefSystemPrompt } from '@/lib/prompts'
import type { BriefRequestBody, ReviewBrief } from '@/types'

const kModel = 'claude-sonnet-4-20250514'

const getTextFromMessage = (message: Anthropic.Messages.Message) =>
  message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')

const parseBrief = async (value: string) =>
  Promise.resolve(stripJsonFences(value))
    .then((content) => JSON.parse(content) as ReviewBrief)
    .then((brief) => Flip.ok(brief) as Flip.R<ReviewBrief, Error>)
    .catch((error: unknown) => toFlipError<ReviewBrief>(error, 'Invalid brief JSON'))

const generateBrief = async (
  reviews: BriefRequestBody['reviews'],
): Promise<Flip.R<ReviewBrief, Error>> => {
  if (reviews.length === 0) return Flip.err(new Error('Reviews are required'))
  if (!process.env.ANTHROPIC_API_KEY) return Flip.ok(buildFallbackBrief(reviews))

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const prompt = buildBriefPrompt(reviews)

  const message = await client.messages
    .create({
      model: kModel,
      max_tokens: 1000,
      system: kBriefSystemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })
    .then((result) => Flip.ok(result) as Flip.R<Anthropic.Messages.Message, Error>)
    .catch((error: unknown) => toFlipError<Anthropic.Messages.Message>(error, 'Brief generation failed'))

  if (Flip.isErr(message)) return Flip.ok(buildFallbackBrief(reviews))
  return parseBrief(getTextFromMessage(Flip.v(message)))
}

export const POST = async (request: Request) => {
  const body = await request.text().then((value) => parseJson<BriefRequestBody>(value))
  if (Flip.isErr(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const brief = await generateBrief(Flip.v(body).reviews)
  if (Flip.isErr(brief)) {
    const message = normalizeErrorMessage(Flip.e(brief).message)
    const status = message === 'Reviews are required' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }

  return NextResponse.json(Flip.v(brief))
}
