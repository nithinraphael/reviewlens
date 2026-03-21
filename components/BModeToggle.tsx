'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import type { AnalystMode, BModeToggleProps } from '@/types'

const kModes: readonly AnalystMode[] = ['analyst', 'exec']

export const BModeToggle: FC<BModeToggleProps> = ({ mode, onChange }) => (
  <div className="inline-flex rounded-[26px] border border-black/8 bg-[#f5f3eb] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
    {kModes.map((option) => {
      const isActive = mode === option

      return (
        <motion.button
          className={`relative rounded-[20px] px-5 py-2.5 text-sm font-medium capitalize transition ${
            isActive ? 'text-black' : 'text-black/55 hover:text-black'
          }`}
          key={option}
          onClick={() => onChange(option)}
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          {isActive ? (
            <motion.span
              className="absolute inset-0 rounded-[20px] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              layoutId="mode-toggle-pill"
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            />
          ) : null}
          <span className="relative">{option}</span>
        </motion.button>
      )
    })}
  </div>
)
