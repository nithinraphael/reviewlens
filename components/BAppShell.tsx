'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { useRef } from 'react'
import { BBriefPanel } from '@/components/BBriefPanel'
import { BChatPanel } from '@/components/BChatPanel'
import { BExportButton } from '@/components/BExportButton'
import { BIngestLoader } from '@/components/BIngestLoader'
import { BModeToggle } from '@/components/BModeToggle'
import { BUrlInput } from '@/components/BUrlInput'
import { useReviewStore } from '@/store/reviewStore'
import type { AnalystMode } from '@/types'

const kPanelMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: { duration: 0.28, ease: 'easeOut' },
} as const

export const BAppShell: FC = () => {
  const brief = useReviewStore((state) => state.brief)
  const mode = useReviewStore((state) => state.mode)
  const reviews = useReviewStore((state) => state.reviews)
  const isLoading = useReviewStore((state) => state.isLoading)
  const setMode = useReviewStore((state) => state.setMode)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleModeChange = (nextMode: AnalystMode) => {
    setMode(nextMode)
  }

  const shellClassName =
    mode === 'exec'
      ? 'relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(251,191,36,0.14),_transparent_24%),linear-gradient(180deg,_#06080d_0%,_#0f172a_45%,_#06080d_100%)] px-4 py-8 text-zinc-100 sm:px-6 lg:px-10'
      : 'relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(45,212,191,0.12),_transparent_24%),linear-gradient(180deg,_#07080c_0%,_#111827_45%,_#08090d_100%)] px-4 py-8 text-zinc-100 sm:px-6 lg:px-10'

  return (
    <main className={shellClassName}>
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-[8%] top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute right-[6%] top-40 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-[linear-gradient(to_top,rgba(255,255,255,0.03),transparent)]" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col gap-5 overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/25 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute -right-12 top-8 h-40 w-40 rounded-full border border-white/8" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs uppercase tracking-[0.4em] ${mode === 'exec' ? 'text-cyan-200/70' : 'text-amber-200/70'}`}
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.05 }}
              >
                ReviewLens
              </motion.p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn Trustpilot reviews into an analyst-ready brief.
              </h1>
              <p className="mt-4 text-sm leading-7 text-zinc-300 sm:text-base">
                Paste a Trustpilot business page, generate an instant brief, and ask focused
                follow-up questions in analyst or executive mode.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-zinc-300">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  Auto-brief synthesis
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  {mode === 'exec' ? 'Executive framing active' : 'Analyst precision active'}
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                  Exportable transcript
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <BModeToggle mode={mode} onChange={handleModeChange} />
              <BExportButton isDisabled={!brief} targetRef={contentRef} />
            </div>
          </div>

          <BUrlInput />
        </motion.div>

        <div className="grid gap-6" ref={contentRef}>
          <AnimatePresence mode="popLayout">
            {brief ? (
              <motion.div key="brief" {...kPanelMotion}>
                <BBriefPanel brief={brief} />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <motion.div {...kPanelMotion}>
            <BChatPanel />
          </motion.div>
        </div>
      </div>
      <BIngestLoader hasReviews={reviews.length > 0} isVisible={isLoading} />
    </main>
  )
}
