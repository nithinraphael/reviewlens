'use client'

'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import type { AnalystMode, BModeToggleProps } from '@/types'

const kModes: readonly AnalystMode[] = ['analyst', 'exec']

export const BModeToggle: FC<BModeToggleProps> = ({ mode, onChange }) => (
  <div className="inline-flex rounded-[1.05rem] border border-black/8 bg-[#f5f3eb] p-1">
    {kModes.map((option) => {
      const isActive = mode === option

      return (
        <button
          className={`relative rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
            isActive ? 'text-black' : 'text-black/55 hover:text-black'
          }`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {isActive ? (
            <motion.span
              className="absolute inset-0 rounded-[0.8rem] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
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
