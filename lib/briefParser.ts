import { Flip } from '@reachdesign/flip'
import { toFlipError } from '@/lib/flip'
import { stripJsonFences } from '@/lib/json'
import type { ReviewBrief } from '@/types'

const findJsonObjectBounds = (value: string) => {
  let start = -1
  let depth = 0
  let isInString = false
  let isEscaped = false

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (isInString) {
      if (isEscaped) {
        isEscaped = false
        continue
      }

      if (char === '\\') {
        isEscaped = true
        continue
      }

      if (char === '"') isInString = false
      continue
    }

    if (char === '"') {
      isInString = true
      continue
    }

    if (char === '{') {
      if (depth === 0) start = index
      depth += 1
      continue
    }

    if (char !== '}') continue

    depth -= 1
    if (depth === 0 && start >= 0) {
      return value.slice(start, index + 1)
    }
  }

  return value
}

export const parseReviewBriefJson = async (value: string): Promise<Flip.R<ReviewBrief, Error>> =>
  Promise.resolve(stripJsonFences(value).trim())
    .then(findJsonObjectBounds)
    .then((content) => JSON.parse(content) as ReviewBrief)
    .then((brief) => Flip.ok(brief) as Flip.R<ReviewBrief, Error>)
    .catch((error: unknown) => toFlipError<ReviewBrief>(error, 'Invalid brief JSON'))
