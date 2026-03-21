'use client'

'use client'

import { motion } from 'framer-motion'
import type { ChangeEvent, FC, FormEvent } from 'react'
import { useState } from 'react'
import { useReviewIngest } from '@/hooks/useReviewIngest'
import { useReviewStore } from '@/store/reviewStore'

const isUrlValid = (value: string) => value.includes('trustpilot.com/review/')

export const BUrlInput: FC = () => {
  const storedUrl = useReviewStore((state) => state.url)
  const [url, setUrl] = useState(storedUrl)
  const { ingest, isLoading, error } = useReviewIngest()
  const isReady = isUrlValid(url.trim())

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedUrl = url.trim()
    if (!isUrlValid(trimmedUrl)) {
      useReviewStore.getState().setError('Enter a Trustpilot business review URL')
      return
    }

    void ingest(trimmedUrl)
  }

  return (
    <form
      className="relative flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur xl:flex-row xl:items-center"
      onSubmit={handleSubmit}
    >
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.26em] text-zinc-400">Source URL</p>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`rounded-full px-2.5 py-1 ${
                isReady
                  ? 'border border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                  : 'border border-white/8 bg-white/[0.04] text-zinc-400'
              }`}
            >
              {isReady ? 'Valid Trustpilot page' : 'Waiting for a valid review URL'}
            </span>
          </div>
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-r from-amber-300/10 via-transparent to-cyan-300/10 opacity-0 blur-xl transition duration-500 group-focus-within:opacity-100" />
          <input
            className="relative h-15 w-full rounded-[1.35rem] border border-white/10 bg-zinc-950/80 px-5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-amber-300/45"
            onChange={handleChange}
            placeholder="https://www.trustpilot.com/review/example.com"
            value={url}
          />
        </div>
      </div>
      <motion.button
        className="relative h-15 overflow-hidden rounded-[1.35rem] bg-amber-300 px-6 text-sm font-semibold text-zinc-950 shadow-[0_12px_40px_rgba(251,191,36,0.2)] transition disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300 disabled:shadow-none"
        disabled={isLoading}
        type="submit"
        whileHover={isLoading ? undefined : { y: -1, scale: 1.01 }}
        whileTap={isLoading ? undefined : { scale: 0.985 }}
      >
        <motion.span
          animate={isLoading ? { x: ['-120%', '120%'] } : { x: '-120%' }}
          className="absolute inset-y-0 left-0 w-14 bg-white/30 blur-md"
          transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <span className="relative flex items-center gap-3">
          {isLoading ? (
            <motion.span
              animate={{ rotate: 360 }}
              className="h-4 w-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950"
              transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
          ) : null}
          {isLoading ? 'Building brief...' : 'Fetch reviews'}
        </span>
      </motion.button>
      {error ? <p className="text-sm text-rose-300 xl:basis-full">{error}</p> : null}
    </form>
  )
}
