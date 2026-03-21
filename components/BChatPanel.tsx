'use client'

import { motion } from 'framer-motion'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { BMessageInput } from '@/components/BMessageInput'
import { BMessageList } from '@/components/BMessageList'
import { normalizeErrorMessage } from '@/lib/errorMessages'
import { useReviewStore } from '@/store/reviewStore'

export const BChatPanel: FC = () => {
  const mode = useReviewStore((state) => state.mode)
  const reviews = useReviewStore((state) => state.reviews)
  const setChatMessages = useReviewStore((state) => state.setChatMessages)
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  useEffect(() => {
    setChatMessages(messages)
  }, [messages, setChatMessages])

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

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <motion.section
      className="relative overflow-hidden rounded-[38px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8"
      transition={{ duration: 0.28, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_40%)] opacity-70" />
      <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-black/35">Conversation</p>
          <h2 className="mt-1 text-4xl font-semibold tracking-tight text-black">Ask the dataset</h2>
          <div className="mt-4 h-px w-48 bg-[radial-gradient(circle,_rgba(18,18,18,0.18)_1px,_transparent_1.5px)] bg-[length:10px_1px] bg-repeat-x" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <motion.div className="rounded-[20px] border border-black/8 bg-[#f5f3eb] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" whileHover={{ y: -1 }}>
            {reviews.length} reviews loaded
          </motion.div>
          <motion.div
            animate={status === 'streaming' || status === 'submitted' ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            className="rounded-[20px] border border-black/8 bg-[#f5f3eb] px-4 py-2 capitalize shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
            whileHover={{ y: -1 }}
          >
            {reviews.length === 0 ? 'waiting' : status}
          </motion.div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <motion.div
          className="relative overflow-hidden rounded-[32px] border border-black/8 bg-[#fbfaf7] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
          transition={{ duration: 0.24, ease: 'easeOut' }}
          whileHover={{ y: -1 }}
        >
          <div className="absolute inset-y-5 right-5 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:1px_10px] bg-repeat-y opacity-75" />
          <BMessageList isStreaming={status === 'streaming' || status === 'submitted'} messages={messages} />
          {error ? (
            <p className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
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
        </motion.div>

        <div className="space-y-4">
          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-black/8 bg-[#f8f6f1] p-5 shadow-[0_10px_28px_rgba(18,18,18,0.04)]"
            transition={{ duration: 0.24, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
            <div className="text-sm uppercase tracking-[0.24em] text-black/38">Suggested prompts</div>
            <div className="mt-4 space-y-3">
              {[
                'What are the top recurring complaints?',
                'Summarize this for an executive audience.',
                'Which praise themes appear most often?',
                'Are there any legal or safety red flags?',
              ].map((item) => (
                <motion.button
                  className="relative w-full rounded-[24px] border border-black/8 bg-white px-4 py-3 text-left text-[15px] text-black/70 shadow-[0_8px_22px_rgba(18,18,18,0.04)] transition hover:border-black/18 hover:bg-[#fbfaf7]"
                  key={item}
                  onClick={() => handlePromptClick(item)}
                  type="button"
                  whileHover={{ x: 4, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className="absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.1)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-75" />
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-black/8 bg-[#f8f6f1] p-5 shadow-[0_10px_28px_rgba(18,18,18,0.04)]"
            transition={{ duration: 0.24, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
            <div className="text-sm uppercase tracking-[0.24em] text-black/38">Mode behavior</div>
            <div className="mt-4 text-[16px] leading-8 text-black/68">
              {mode === 'exec'
                ? 'Executive mode compresses the signal into high-level business implications and decisions.'
                : 'Analyst mode stays closer to evidence, patterns, and review-level observations.'}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
