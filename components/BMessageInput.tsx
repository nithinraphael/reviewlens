'use client'

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
    <div className="rounded-[1.5rem] border border-black/8 bg-white p-3">
      <textarea
        className="min-h-28 w-full resize-none bg-transparent p-3 text-sm leading-7 text-black outline-none placeholder:text-black/35"
        disabled={isDisabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about top issues, trends, risk signals, or executive implications..."
        value={input}
      />
      <div className="flex items-center justify-between gap-3 px-3 pb-1">
        <p className="text-xs text-black/38">Press Enter to send. Shift + Enter for a new line.</p>
        <motion.button
          className="rounded-[1rem] border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/15 disabled:text-black/35"
          disabled={isDisabled}
          onClick={onSubmit}
          type="button"
          whileHover={isDisabled ? undefined : { y: -1 }}
          whileTap={isDisabled ? undefined : { scale: 0.985 }}
        >
          Send
        </motion.button>
      </div>
    </div>
  )
}
