'use client'

'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import type { AnalystMode, BModeToggleProps } from '@/types'

const kModes: readonly AnalystMode[] = ['analyst', 'exec']

export const BModeToggle: FC<BModeToggleProps> = ({ mode, onChange }) => (
  <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
    {kModes.map((option) => {
      const isActive = mode === option

      return (
        <button
          className={`relative rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
            isActive ? 'text-zinc-950' : 'text-zinc-300 hover:text-zinc-100'
          }`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {isActive ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-zinc-100"
              layoutId="mode-toggle-pill"
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            />
          ) : null}
          <span className="relative">{option}</span>
        </button>
      )
    })}
  </div>
)
