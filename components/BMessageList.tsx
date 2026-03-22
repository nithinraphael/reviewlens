'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { BMarkdownContent } from '@/components/BMarkdownContent'
import { getUIMessageText } from '@/lib/messages'
import type { BMessageListProps } from '@/types'

const getBubbleStyle = (role: string, tone: 'default' | 'sidebar') => {
  if (role === 'user') {
    return tone === 'sidebar'
      ? 'ml-auto bg-[#141414] text-white border-transparent shadow-[0_8px_24px_rgba(18,18,18,0.18)]'
      : 'ml-auto bg-[#141414] text-white border-transparent shadow-[0_10px_32px_rgba(18,18,18,0.20)]'
  }
  return tone === 'sidebar'
    ? 'mr-auto bg-white text-black border-black/[0.07] shadow-[0_4px_16px_rgba(18,18,18,0.06)]'
    : 'mr-auto bg-white text-black border-black/[0.07] shadow-[0_6px_20px_rgba(18,18,18,0.06)]'
}

export const BMessageList: FC<BMessageListProps> = ({
  messages,
  isStreaming,
  isCompact = false,
  tone = 'default',
}) => (
  <div className={`flex flex-col gap-3 ${isCompact ? 'min-h-0' : 'min-h-64'}`}>
    <AnimatePresence initial={false}>
      {messages.map((message) => {
        const content = getUIMessageText(message)
        const isUser = message.role === 'user'
        const bubbleStyle = getBubbleStyle(message.role, tone)

        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 14 }}
            key={message.id}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className={`relative max-w-[84%] overflow-hidden rounded-[24px] border px-4 py-3.5 text-[14px] leading-[1.7] ${
                isUser ? 'rounded-br-[8px]' : 'rounded-bl-[8px]'
              } ${bubbleStyle}`}
            >
              {/* Top sheen for user bubble */}
              {isUser && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[35%] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
              )}
              <div className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] ${isUser ? 'text-white/45' : 'text-black/35'}`}>
                {isUser ? 'You' : 'ReviewLens'}
              </div>
              <BMarkdownContent content={content} isUserMessage={isUser} />
            </div>
          </motion.div>
        )
      })}
    </AnimatePresence>

    {messages.length === 0 ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-dashed border-black/10 bg-[#fafaf8] px-6 py-10 text-[14px] leading-[1.75] text-black/40"
        initial={{ opacity: 0, y: 14 }}
      >
        Ask for churn signals, recurring complaints, sentiment splits, or an executive summary of business risk and opportunity.
      </motion.div>
    ) : null}

    {isStreaming ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mr-auto flex items-center gap-2.5 rounded-[20px] rounded-bl-[6px] border border-black/[0.07] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(18,18,18,0.06)]"
        initial={{ opacity: 0, y: 12 }}
      >
        {[0, 1, 2].map((dot) => (
          <motion.span
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            className="h-2 w-2 rounded-full bg-[#c8d940]"
            key={dot}
            transition={{ duration: 0.75, delay: dot * 0.13, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          />
        ))}
        <span className="text-[12px] font-medium text-black/40 tracking-wide">Thinking</span>
      </motion.div>
    ) : null}
  </div>
)
