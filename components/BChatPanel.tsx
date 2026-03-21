'use client'

'use client'

import { motion } from 'framer-motion'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import type { FC } from 'react'
import { useState } from 'react'
import { BMessageInput } from '@/components/BMessageInput'
import { BMessageList } from '@/components/BMessageList'
import { normalizeErrorMessage } from '@/lib/errorMessages'
import { useReviewStore } from '@/store/reviewStore'

export const BChatPanel: FC = () => {
  const mode = useReviewStore((state) => state.mode)
  const reviews = useReviewStore((state) => state.reviews)
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isDisabled = status !== 'ready' || reviews.length === 0

  const handleSubmit = () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isDisabled) return

    void sendMessage(
      { text: trimmedInput },
      {
        body: {
          mode,
          reviews,
        },
      },
    )
    setInput('')
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Chat with the data</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Ask for analysis</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            {reviews.length} reviews loaded
          </div>
          <motion.div
            animate={status === 'streaming' || status === 'submitted' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.65 }}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 capitalize"
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
          >
            {reviews.length === 0 ? 'waiting' : status}
          </motion.div>
        </div>
      </div>
      <BMessageList isStreaming={status === 'streaming' || status === 'submitted'} messages={messages} />
      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm leading-7 text-rose-100">
          {normalizeErrorMessage(error.message)}
        </p>
      ) : null}
      <div className="mt-5">
        <BMessageInput
          input={input}
          isDisabled={isDisabled}
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}
