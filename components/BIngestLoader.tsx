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
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_35%),rgba(5,8,15,0.72)] px-4 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={kBackgroundTransition}
    >
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={kBackgroundTransition}
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
        <div className="flex items-center gap-6">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute inset-0 rounded-full border border-amber-300/25"
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              className="absolute inset-2 rounded-full border border-dashed border-white/20"
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.65, 1, 0.65] }}
              className="h-8 w-8 rounded-full bg-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.55)]"
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Analyzing</p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-50">Building your review intelligence brief</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
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
                className={`flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 ${
                  isActive ? 'border-amber-300/35 bg-amber-300/10' : 'border-white/8 bg-white/[0.03]'
                }`}
                initial={{ opacity: 0, x: -10 }}
                key={step}
                transition={{ delay: index * 0.06 }}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    isComplete
                      ? 'border-emerald-300/50 bg-emerald-300/15 text-emerald-100'
                      : isActive
                        ? 'border-amber-300/50 bg-amber-300/20 text-amber-50'
                        : 'border-white/12 text-zinc-500'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
                <div className="flex-1 text-sm text-zinc-200">{step}</div>
                {isActive ? (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    className="h-2.5 w-2.5 rounded-full bg-amber-300"
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
