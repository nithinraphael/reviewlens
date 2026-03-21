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
      className="rounded-[1rem] border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-white disabled:text-black/30"
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
