'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import type { BIngestLoaderProps } from '@/types'

const kSteps = [
  'Connecting to the Trustpilot page',
  'Collecting recent customer feedback',
  'Composing the analyst brief',
] as const

const kBackgroundTransition = { duration: 0.35, ease: 'easeOut' } as const

export const BIngestLoader: FC<BIngestLoaderProps> = ({ isVisible, hasReviews }) => {
  return (
    <AnimatePresence>
      {isVisible ? <BIngestLoaderCard hasReviews={hasReviews} /> : null}
    </AnimatePresence>
  )
}

const BIngestLoaderCard: FC<Pick<BIngestLoaderProps, 'hasReviews'>> = ({ hasReviews }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsed((current) => current + 1)
    }, 1100)

    return () => window.clearInterval(intervalId)
  }, [])

  const activeStep = hasReviews ? 2 : Math.min(1, elapsed)

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(232,242,85,0.18),_transparent_35%),rgba(246,244,239,0.82)] px-4 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={kBackgroundTransition}
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[40px] border border-black/10 bg-[#fbfaf7] p-8 shadow-[0_28px_80px_rgba(30,25,17,0.12)]"
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={kBackgroundTransition}
      >
        <div className="absolute inset-x-8 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
        <div className="absolute bottom-8 left-8 top-8 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.5px)] bg-[length:1px_10px] bg-repeat-y opacity-65" />
        <div className="flex items-center gap-6">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute inset-0 rounded-full border border-[#d4d063]"
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              className="absolute inset-2 rounded-full border border-dashed border-black/15"
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.65, 1, 0.65] }}
              className="h-8 w-8 rounded-full bg-[#efcc32] shadow-[0_0_35px_rgba(239,204,50,0.28)]"
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-[#9c9150]">Analyzing</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-black">
              Building your review intelligence brief
            </h2>
            <p className="mt-3 max-w-xl text-[17px] leading-8 text-black/62">
              We&apos;re pulling structured signals out of the source page and shaping them into a concise analyst-ready workspace.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {kSteps.map((step, index) => {
            const isActive = index === activeStep
            const isComplete = index < activeStep

            return (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className={`relative flex items-center gap-3 rounded-[24px] border px-4 py-3 ${
                  isActive ? 'border-[#b79a42] bg-[#f3edd8]' : 'border-black/8 bg-[#f6f3ec]'
                }`}
                initial={{ opacity: 0, x: -10 }}
                key={step}
                transition={{ delay: index * 0.06 }}
              >
                <div className="absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.1)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-75" />
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    isComplete
                      ? 'border-[#73b896] bg-[#dff2e8] text-[#2f6b4b]'
                      : isActive
                        ? 'border-[#b79a42] bg-[#f1df9a] text-[#69571d]'
                        : 'border-black/10 text-black/35'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
                <div className="flex-1 text-[17px] text-black/72">{step}</div>
                {isActive ? (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    className="h-2.5 w-2.5 rounded-full bg-[#d8b538]"
                    transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                  />
                ) : null}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
