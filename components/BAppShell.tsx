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
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 18 },
  transition: { duration: 0.28, ease: 'easeOut' },
} as const

const kSidebarItems = [
  'Dashboard',
  'Reviews',
  'Briefing',
  'Chat',
  'Exports',
] as const

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

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#121212]">
      <div className="flex min-h-screen w-full overflow-hidden bg-[#fbfaf7]">
        <aside className="hidden w-[280px] shrink-0 border-r border-black/8 bg-white lg:flex lg:flex-col">
          <div className="border-b border-black/8 px-8 py-8">
            <div className="text-[34px] font-semibold tracking-tight">ReviewLens</div>
          </div>
          <div className="flex flex-1 flex-col justify-between px-4 py-5">
            <nav className="space-y-2">
              {kSidebarItems.map((item, index) => (
                <motion.div
                  className={`flex items-center justify-between rounded-2xl px-5 py-4 text-[17px] ${
                    index === 0 ? 'bg-[#f3f0ea] font-medium' : 'text-black/68'
                  }`}
                  key={item}
                  whileHover={{ x: 2 }}
                >
                  <span>{item}</span>
                  {index === 0 ? <span className="h-2.5 w-2.5 rounded-full bg-[#e8f255]" /> : null}
                </motion.div>
              ))}
            </nav>
            <div className="space-y-3 border-t border-black/8 px-2 pt-6 text-[17px] text-black/62">
              <div className="rounded-2xl px-3 py-3">Settings</div>
              <div className="flex items-center justify-between rounded-2xl px-3 py-3">
                <span>Help &amp; Support</span>
                <span className="rounded-full bg-[#e8f255] px-2 py-0.5 text-sm text-black">8</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#fbfaf7]">
          <header className="border-b border-black/8 px-6 py-5 lg:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <BUrlInput />
              <div className="flex flex-wrap items-center gap-3">
                <BModeToggle mode={mode} onChange={handleModeChange} />
                <BExportButton isDisabled={!brief} targetRef={contentRef} />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f255] text-sm font-semibold">
                  RL
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto px-6 py-7 lg:px-10">
            <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm text-black/45">Insights</p>
                <h1 className="mt-1 text-5xl font-semibold tracking-tight text-black">Reporting</h1>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-black/38">Mode</div>
                  <div className="mt-2 text-xl font-semibold capitalize">{mode}</div>
                </div>
                <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-black/38">Reviews</div>
                  <div className="mt-2 text-xl font-semibold">{reviews.length}</div>
                </div>
                <div className="rounded-[1.35rem] border border-black/8 bg-white px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-black/38">Status</div>
                  <div className="mt-2 text-xl font-semibold">{brief ? 'Ready' : 'Waiting'}</div>
                </div>
                <div className="rounded-[1.35rem] border border-black/8 bg-[#f3f0ea] px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-black/38">Workspace</div>
                  <div className="mt-2 text-xl font-semibold">Live</div>
                </div>
              </div>
            </div>

            <div className="grid gap-5" ref={contentRef}>
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
        </section>
      </div>
      <BIngestLoader hasReviews={reviews.length > 0} isVisible={isLoading} />
    </main>
  )
}
