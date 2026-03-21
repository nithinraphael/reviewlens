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
    <section className="rounded-[1.9rem] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm text-black/45">Conversation</p>
          <h2 className="mt-1 text-4xl font-semibold tracking-tight text-black">Ask the dataset</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="rounded-xl border border-black/8 bg-[#f5f3eb] px-4 py-2">
            {reviews.length} reviews loaded
          </div>
          <motion.div
            animate={status === 'streaming' || status === 'submitted' ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            className="rounded-xl border border-black/8 bg-[#f5f3eb] px-4 py-2 capitalize"
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
          >
            {reviews.length === 0 ? 'waiting' : status}
          </motion.div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[1.5rem] border border-black/8 bg-[#fbfaf7] p-5">
          <BMessageList isStreaming={status === 'streaming' || status === 'submitted'} messages={messages} />
          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
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
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-black/8 bg-[#f8f6f1] p-5">
            <div className="text-sm text-black/45">Suggested prompts</div>
            <div className="mt-4 space-y-3">
              {[
                'What are the top recurring complaints?',
                'Summarize this for an executive audience.',
                'Which praise themes appear most often?',
                'Are there any legal or safety red flags?',
              ].map((item) => (
                <div className="rounded-[1rem] border border-black/8 bg-white px-4 py-3 text-[15px] text-black/70" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-black/8 bg-[#f8f6f1] p-5">
            <div className="text-sm text-black/45">Mode behavior</div>
            <div className="mt-4 text-[16px] leading-8 text-black/68">
              {mode === 'exec'
                ? 'Executive mode compresses the signal into high-level business implications and decisions.'
                : 'Analyst mode stays closer to evidence, patterns, and review-level observations.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
