'use client'

'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import generatePDF from 'react-to-pdf'
import type { BExportButtonProps } from '@/types'

const getFileName = () => `review-analysis-${new Date().toISOString().slice(0, 10)}.pdf`

export const BExportButton: FC<BExportButtonProps> = ({ targetRef, isDisabled }) => {
  const handleClick = () => {
    void generatePDF(targetRef, { filename: getFileName(), method: 'save' })
  }

  return (
    <motion.button
      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isDisabled}
      onClick={handleClick}
      type="button"
      whileHover={isDisabled ? undefined : { y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.985 }}
    >
      Export PDF
    </motion.button>
  )
}
