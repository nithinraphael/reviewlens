'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { BMarkdownContent } from '@/components/BMarkdownContent'
import { getUIMessageText } from '@/lib/messages'
import type { BMessageListProps } from '@/types'

const getBubbleClassName = (role: string) =>
  role === 'user'
    ? 'ml-auto border-amber-300/50 bg-[linear-gradient(180deg,#fde68a,#fbbf24)] text-zinc-950'
    : 'mr-auto border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-zinc-100'

export const BMessageList: FC<BMessageListProps> = ({ messages, isStreaming }) => (
  <div className="flex min-h-64 flex-col gap-4">
    <AnimatePresence initial={false}>
      {messages.map((message) => {
        const content = getUIMessageText(message)
        const isUserMessage = message.role === 'user'

        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] rounded-[1.5rem] border px-4 py-3 text-sm leading-7 shadow-[0_12px_40px_rgba(0,0,0,0.18)] ${getBubbleClassName(message.role)}`}
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 16 }}
            key={message.id}
            transition={{ duration: 0.22 }}
            whileHover={{ y: -1 }}
          >
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
        className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-sm leading-7 text-zinc-400"
        initial={{ opacity: 0, y: 16 }}
      >
        Ask for churn signals, recurring complaints, sentiment splits, or an executive summary of business risk and opportunity.
      </motion.div>
    ) : null}
    {isStreaming ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mr-auto flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3 text-sm text-zinc-300"
        initial={{ opacity: 0, y: 16 }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
              className="h-2 w-2 rounded-full bg-amber-300"
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
