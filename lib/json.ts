import { Flip } from '@reachdesign/flip'
import { toFlipError } from '@/lib/flip'

export const parseJson = async <T>(value: string): Promise<Flip.R<T, Error>> =>
  Promise.resolve(value)
    .then((content) => JSON.parse(content) as T)
    .then((data) => Flip.ok(data) as Flip.R<T, Error>)
    .catch((error: unknown) => toFlipError<T>(error, 'Failed to parse JSON'))

export const readJsonResponse = async <T>(
  response: Response,
): Promise<Flip.R<T, Error>> => response.text().then((value) => parseJson<T>(value))

export const stripJsonFences = (value: string) =>
  value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
