'use client'

import { motion } from 'framer-motion'
import type { ChangeEvent, FC, KeyboardEvent } from 'react'
import type { BMessageInputProps } from '@/types'

export const BMessageInput: FC<BMessageInputProps> = ({
  input,
  isDisabled,
  onChange,
  onSubmit,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    onSubmit()
  }

  return (
    <motion.div
      className="rounded-[32px] border border-black/8 bg-white p-3 shadow-[0_12px_32px_rgba(18,18,18,0.05)]"
      transition={{ duration: 0.22, ease: 'easeOut' }}
      whileFocus={{ y: -1 }}
      whileHover={{ y: -1 }}
    >
      <textarea
        className="min-h-28 w-full resize-none rounded-[24px] bg-transparent p-3 text-sm leading-7 text-black outline-none transition-[background-color] duration-200 placeholder:text-black/35 focus:bg-[#fcfbf8]"
        disabled={isDisabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about top issues, trends, risk signals, or executive implications..."
        value={input}
      />
      <div className="flex items-center justify-between gap-3 px-3 pb-1">
        <p className="text-xs text-black/38">Press Enter to send. Shift + Enter for a new line.</p>
        <motion.button
          className="rounded-[20px] border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,18,18,0.16)] transition hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/15 disabled:text-black/35"
          disabled={isDisabled}
          onClick={onSubmit}
          type="button"
          whileHover={isDisabled ? undefined : { y: -2, scale: 1.01 }}
          whileTap={isDisabled ? undefined : { scale: 0.98 }}
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  )
}
