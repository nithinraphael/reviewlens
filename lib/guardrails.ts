import { Flip } from '@reachdesign/flip'

const kBlockedPhrases = [
  'ignore previous instructions',
  'you are now',
  'jailbreak',
  'disregard your',
  'pretend you are',
] as const

const kBlockedProfanity = ['fuck', 'shit', 'bitch', 'asshole'] as const

const kPiiPatterns = [
  /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
] as const

export const checkGuardrails = (message: string): Flip.R<true, string> => {
  const lower = message.toLowerCase()

  for (const phrase of kBlockedPhrases) {
    if (lower.includes(phrase)) return Flip.err('blocked_phrase')
  }

  for (const phrase of kBlockedProfanity) {
    if (lower.includes(phrase)) return Flip.err('profanity_detected')
  }

  for (const pattern of kPiiPatterns) {
    if (pattern.test(message)) return Flip.err('pii_detected')
  }

  return Flip.ok(true)
}
