export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback

export const getNumber = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

export const getBoolean = (value: unknown, fallback = false) =>
  typeof value === 'boolean' ? value : fallback
