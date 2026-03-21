import { isRecord } from '@/lib/object'

const kAnthropicCreditMessage =
  'AI-generated analysis is temporarily unavailable because the Anthropic account is out of credits. ReviewLens will keep working with the built-in brief, but chat needs billing to be restored.'

const kAnthropicUnavailableMessage =
  'AI-generated analysis is temporarily unavailable right now. Please try again shortly.'

const kRequestFallback = 'Something went wrong while processing the request.'

const parseNestedMessage = (value: unknown): string | null => {
  if (!isRecord(value)) return null

  const error = value.error
  if (!isRecord(error)) return null

  const message = error.message
  return typeof message === 'string' ? message : null
}

const parseJsonMessage = (value: string) => {
  try {
    const parsed = JSON.parse(value) as unknown
    return parseNestedMessage(parsed)
  } catch {
    return null
  }
}

export const normalizeErrorMessage = (value: string) => {
  const message = parseJsonMessage(value) ?? value
  const lower = message.toLowerCase()

  if (
    lower.includes('credit balance is too low') ||
    lower.includes('purchase credits') ||
    lower.includes('plans & billing')
  ) {
    return kAnthropicCreditMessage
  }

  if (
    lower.includes('anthropic') ||
    lower.includes('overloaded') ||
    lower.includes('rate limit') ||
    lower.includes('invalid_request_error')
  ) {
    return kAnthropicUnavailableMessage
  }

  return message || kRequestFallback
}

export const getChatFallbackMessage = () => kAnthropicCreditMessage
