import { Flip } from '@reachdesign/flip'
import { normalizeErrorMessage } from '@/lib/errorMessages'
import { readJsonResponse } from '@/lib/json'
import type { ErrorResponseBody } from '@/types'

export const getResponseError = async (response: Response) => {
  const parsedBody = await readJsonResponse<ErrorResponseBody>(response)
  if (Flip.isErr(parsedBody)) return normalizeErrorMessage(`Request failed with ${response.status}`)

  const { error } = Flip.v(parsedBody)
  return normalizeErrorMessage(error || `Request failed with ${response.status}`)
}
