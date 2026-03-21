'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { BMarkdownContent } from '@/components/BMarkdownContent'
import { getUIMessageText } from '@/lib/messages'
import type { BMessageListProps } from '@/types'

const getBubbleClassName = (role: string) =>
  role === 'user'
    ? 'ml-auto border-black bg-black text-white'
    : 'mr-auto border-black/8 bg-white text-black'

export const BMessageList: FC<BMessageListProps> = ({ messages, isStreaming }) => (
  <div className="flex min-h-64 flex-col gap-4">
    <AnimatePresence initial={false}>
      {messages.map((message) => {
        const content = getUIMessageText(message)
        const isUserMessage = message.role === 'user'

        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`relative max-w-[85%] overflow-hidden rounded-[28px] border px-4 py-3 text-sm leading-7 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ${getBubbleClassName(message.role)}`}
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 16 }}
            key={message.id}
            transition={{ duration: 0.22 }}
            whileHover={{ y: -2, scale: 1.01 }}
          >
            <div
              className={`absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(255,255,255,0.3)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x ${
                isUserMessage ? 'opacity-70' : 'opacity-0'
              }`}
            />
            <div
              className={`absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x ${
                isUserMessage ? 'opacity-0' : 'opacity-80'
              }`}
            />
            <div className="mb-2 text-[10px] uppercase tracking-[0.25em] opacity-65">
              {isUserMessage ? 'You' : 'ReviewLens'}
            </div>
            <BMarkdownContent content={content} isUserMessage={isUserMessage} />
          </motion.div>
        )
      })}
    </AnimatePresence>
    {messages.length === 0 ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-dashed border-black/10 bg-white px-5 py-8 text-sm leading-7 text-black/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
        initial={{ opacity: 0, y: 16 }}
      >
        Ask for churn signals, recurring complaints, sentiment splits, or an executive summary of business risk and opportunity.
      </motion.div>
    ) : null}
    {isStreaming ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mr-auto flex items-center gap-3 rounded-[24px] border border-black/8 bg-white px-4 py-3 text-sm text-black/55 shadow-[0_10px_24px_rgba(18,18,18,0.06)]"
        initial={{ opacity: 0, y: 16 }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
              className="h-2 w-2 rounded-full bg-[#d9e94d]"
              key={dot}
              transition={{ duration: 0.8, delay: dot * 0.12, repeat: Number.POSITIVE_INFINITY }}
            />
          ))}
        </div>
        Streaming insight...
      </motion.div>
    ) : null}
  </div>
)
