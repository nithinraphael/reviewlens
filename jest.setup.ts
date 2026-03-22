import '@testing-library/jest-dom'

import { TransformStream } from 'node:stream/web'

if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = TransformStream as unknown as typeof globalThis.TransformStream
}
