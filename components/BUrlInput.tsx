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
    <form className="w-full max-w-2xl" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black/35">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>
          <input
            className="h-14 w-full rounded-[1.2rem] border border-black/8 bg-[#f3f0ea] pl-14 pr-5 text-[17px] text-black outline-none placeholder:text-black/38 focus:border-black/20"
            onChange={handleChange}
            placeholder="Search or paste a Trustpilot review URL"
            value={url}
          />
        </div>
        <motion.button
          className="h-14 rounded-[1.1rem] border border-black/8 bg-white px-5 text-[15px] font-medium text-black shadow-[0_4px_14px_rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isLoading}
          type="submit"
          whileHover={isLoading ? undefined : { y: -1 }}
          whileTap={isLoading ? undefined : { scale: 0.985 }}
        >
          {isLoading ? 'Loading...' : 'Run analysis'}
        </motion.button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </form>
  )
}
