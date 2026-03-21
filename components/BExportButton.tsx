'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import { useState } from 'react'
import { normalizeErrorMessage } from '@/lib/errorMessages'
import type { BExportButtonProps, ExportRequestBody } from '@/types'

const getFileName = () => `review-analysis-${new Date().toISOString().slice(0, 10)}.pdf`

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const BExportButton: FC<BExportButtonProps> = ({
  brief,
  isDisabled,
  messages,
  mode,
  reviews,
}) => {
  const [isExporting, setIsExporting] = useState(false)

  const handleClick = async () => {
    if (!brief) return

    setIsExporting(true)

    try {
      const body: ExportRequestBody = {
        brief,
        reviews,
        messages,
        mode,
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Export failed')
      }

      const blob = await response.blob()
      downloadBlob(blob, getFileName())
    } catch (error: unknown) {
      const message = normalizeErrorMessage(
        error instanceof Error ? error.message : 'Export failed',
      )
      window.alert(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.button
      className="rounded-[18px] border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-white disabled:text-black/30"
      disabled={isDisabled || isExporting}
      onClick={handleClick}
      type="button"
      whileHover={isDisabled || isExporting ? undefined : { y: -1 }}
      whileTap={isDisabled || isExporting ? undefined : { scale: 0.985 }}
    >
      {isExporting ? 'Exporting...' : 'Export PDF'}
    </motion.button>
  )
}
