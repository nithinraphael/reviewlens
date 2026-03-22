'use client'

import { motion } from 'framer-motion'
import type { ChangeEvent, FC, KeyboardEvent } from 'react'
import type { BMessageInputProps } from '@/types'

export const BMessageInput: FC<BMessageInputProps> = ({
  input,
  isDisabled,
  onChange,
  onSubmit,
  isMinimal = false,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    onSubmit()
  }

  const sharedTextarea = (minH: string, placeholder: string) => (
    <textarea
      className={`${minH} w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-7 text-black outline-none placeholder:text-black/30`}
      disabled={isDisabled}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      value={input}
    />
  )

  const sharedSendButton = (compact: boolean) => (
    <motion.button
      className={`flex shrink-0 items-center justify-center rounded-full border border-black bg-[#141414] font-semibold text-white shadow-[0_8px_20px_rgba(18,18,18,0.22)] transition hover:bg-black disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/12 disabled:text-black/30 disabled:shadow-none ${
        compact ? 'mb-1 mr-1 h-11 w-11 text-lg' : 'h-10 px-5 text-[14px]'
      }`}
      disabled={isDisabled}
      onClick={onSubmit}
      type="button"
      whileHover={isDisabled ? undefined : { y: -2, scale: 1.04 }}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
    >
      {compact ? '↑' : 'Send'}
    </motion.button>
  )

  if (isMinimal) {
    return (
      <div className="overflow-hidden rounded-[26px] border border-black/[0.08] bg-white shadow-[0_4px_20px_rgba(18,18,18,0.07)]">
        <div className="flex items-end gap-2 p-2">
          {sharedTextarea('min-h-[80px]', 'Ask about trends, risks, praise themes, or executive implications...')}
          {sharedSendButton(true)}
        </div>
        <div className="border-t border-black/[0.05] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-black/25">
          Enter to send · Shift + Enter for newline
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-black/[0.08] bg-white shadow-[0_4px_20px_rgba(18,18,18,0.07)]">
      {sharedTextarea('min-h-[96px]', 'Ask about top issues, trends, risk signals, or executive implications...')}
      <div className="flex items-center justify-between border-t border-black/[0.05] px-4 py-2.5">
        <p className="text-[12px] text-black/30">Enter to send · Shift + Enter for newline</p>
        {sharedSendButton(false)}
      </div>
    </div>
  )
}
