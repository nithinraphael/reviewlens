import { Flip } from '@reachdesign/flip'

const toError = (error: unknown, fallback: string) =>
  error instanceof Error ? error : new Error(fallback)

export const toFlipError = <T>(error: unknown, fallback: string) =>
  Flip.err(toError(error, fallback)) as Flip.R<T, Error>
