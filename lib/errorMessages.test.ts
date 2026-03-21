import { normalizeErrorMessage } from '@/lib/errorMessages'

describe('normalizeErrorMessage', () => {
  it('maps anthropic billing payloads to a friendly message', () => {
    const message = normalizeErrorMessage(
      '{"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."}}',
    )

    expect(message).toContain('out of credits')
  })

  it('falls back to the original string for generic errors', () => {
    expect(normalizeErrorMessage('Something custom happened')).toBe('Something custom happened')
  })
})
