import type { UIMessage } from 'ai'
import { isRecord } from '@/lib/object'

interface TextPart {
  readonly type: 'text'
  readonly text: string
}

const isTextPart = (value: unknown): value is TextPart =>
  isRecord(value) && value.type === 'text' && typeof value.text === 'string'

const getPartsText = (value: unknown) =>
  Array.isArray(value) ? value.filter(isTextPart).map(({ text }) => text).join('') : ''

export const getUIMessageText = (message: UIMessage) => {
  const partsText = getPartsText(message.parts)
  if (partsText) return partsText

  const content = (message as UIMessage & { readonly content?: string }).content
  return typeof content === 'string' ? content : ''
}

export const getMessagesText = (messages: readonly UIMessage[]) =>
  messages.map(getUIMessageText).join('\n')
