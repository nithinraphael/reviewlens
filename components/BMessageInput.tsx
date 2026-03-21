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
    <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,9,11,0.9),rgba(9,9,11,0.78))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <textarea
        className="min-h-28 w-full resize-none bg-transparent p-3 text-sm leading-7 text-zinc-100 outline-none placeholder:text-zinc-500"
        disabled={isDisabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about top issues, trends, risk signals, or executive implications..."
        value={input}
      />
      <div className="flex items-center justify-between gap-3 px-3 pb-1">
        <p className="text-xs text-zinc-500">Press Enter to send. Shift + Enter for a new line.</p>
        <motion.button
          className="rounded-[1rem] bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
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
