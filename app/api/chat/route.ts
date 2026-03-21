import { anthropic } from '@ai-sdk/anthropic'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { Flip } from '@reachdesign/flip'
import { NextResponse } from 'next/server'
import { getChatFallbackMessage, normalizeErrorMessage } from '@/lib/errorMessages'
import { checkGuardrails } from '@/lib/guardrails'
import { parseJson } from '@/lib/json'
import { getUIMessageText } from '@/lib/messages'
import { getSystemPrompt } from '@/lib/prompts'
import type { ChatRequestBody } from '@/types'

export const maxDuration = 30

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

export const POST = async (request: Request) => {
  const body = await request.text().then((value) => parseJson<ChatRequestBody>(value))
  if (Flip.isErr(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages, mode, reviews } = Flip.v(body)
  const latestUserMessage = getLatestUserMessage(messages)
  const latestUserText = latestUserMessage ? getUIMessageText(latestUserMessage) : ''
  const guardrailResult = checkGuardrails(latestUserText)

  if (Flip.isErr(guardrailResult)) {
    return NextResponse.json({ error: getBlockedMessage(mode) }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: getChatFallbackMessage() }, { status: 503 })
  }

  const modelMessages = await convertToModelMessages(stripMessageIds(messages))
  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: getSystemPrompt(mode, reviews),
    messages: modelMessages,
    maxOutputTokens: 900,
  })

  return result.toUIMessageStreamResponse({
    onError: (error) =>
      normalizeErrorMessage(error instanceof Error ? error.message : 'AI chat is unavailable'),
  })
}
