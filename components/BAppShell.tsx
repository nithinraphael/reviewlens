'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { BBriefPanel } from '@/components/BBriefPanel'
import { BChatPanel } from '@/components/BChatPanel'
import { BExportButton } from '@/components/BExportButton'
import { BIngestLoader } from '@/components/BIngestLoader'
import { BModeToggle } from '@/components/BModeToggle'
import { BUrlInput } from '@/components/BUrlInput'
import { useReviewStore } from '@/store/reviewStore'
import type { AnalystMode, TrustpilotReview } from '@/types'

type SectionId = 'dashboard' | 'reviews' | 'briefing' | 'chat' | 'exports' | 'settings' | 'help'

interface SidebarItem {
  readonly id: SectionId
  readonly label: string
}

interface ObservedSection {
  readonly id: SectionId
  readonly element: HTMLElement | null
}

const kPanelMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 18 },
  transition: { duration: 0.28, ease: 'easeOut' },
} as const

const kSidebarItems: readonly SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'briefing', label: 'Briefing' },
  { id: 'chat', label: 'Chat' },
  { id: 'exports', label: 'Exports' },
]

const toDisplayRating = (rating: number) => `${rating.toFixed(1).replace(/\.0$/, '')}/5`

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const getPreviewText = ({ title, body }: TrustpilotReview) => {
  const text = title || body
  return text.length > 72 ? `${text.slice(0, 72)}...` : text
}

const getStatusLabel = (review: TrustpilotReview) => {
  if (review.rating >= 4) return 'Positive'
  if (review.rating <= 2) return 'Risk'
  return 'Neutral'
}

export const BAppShell: FC = () => {
  const brief = useReviewStore((state) => state.brief)
  const chatMessages = useReviewStore((state) => state.chatMessages)
  const mode = useReviewStore((state) => state.mode)
  const reviews = useReviewStore((state) => state.reviews)
  const isLoading = useReviewStore((state) => state.isLoading)
  const reset = useReviewStore((state) => state.reset)
  const setMode = useReviewStore((state) => state.setMode)

  const contentRef = useRef<HTMLDivElement>(null)
  const chatPanelRef = useRef<HTMLElement>(null)
  const dashboardRef = useRef<HTMLElement>(null)
  const reviewsRef = useRef<HTMLElement>(null)
  const briefingRef = useRef<HTMLElement>(null)
  const exportsRef = useRef<HTMLElement>(null)
  const settingsRef = useRef<HTMLElement>(null)
  const helpRef = useRef<HTMLElement>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const sections: readonly ObservedSection[] = [
      { id: 'dashboard', element: dashboardRef.current },
      { id: 'reviews', element: reviewsRef.current },
      { id: 'briefing', element: briefingRef.current },
      { id: 'exports', element: exportsRef.current },
      { id: 'settings', element: settingsRef.current },
      { id: 'help', element: helpRef.current },
    ]
    const visibleSections = sections.filter(
      (section): section is ObservedSection & { readonly element: HTMLElement } => section.element instanceof HTMLElement,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (!visible) return
        const match = visibleSections.find(({ element }) => element === visible.target)
        if (match) setActiveSection(match.id)
      },
      {
        root: container,
        threshold: [0.2, 0.45, 0.7],
      },
    )

    visibleSections.forEach(({ element }) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  const handleModeChange = (nextMode: AnalystMode) => {
    setMode(nextMode)
  }

  const scrollToSection = (sectionId: SectionId) => {
    if (sectionId === 'chat') {
      setIsChatOpen(true)
      setActiveSection('chat')
      return
    }

    const refMap: Record<SectionId, RefObject<HTMLElement | null>> = {
      dashboard: dashboardRef,
      reviews: reviewsRef,
      briefing: briefingRef,
      chat: chatPanelRef,
      exports: exportsRef,
      settings: settingsRef,
      help: helpRef,
    }

    refMap[sectionId].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    setActiveSection(sectionId)
  }

  const handleResetWorkspace = () => {
    reset()
    scrollToSection('dashboard')
  }

  const handleToggleChat = () => {
    setIsChatOpen((current) => !current)
  }

  return (
    <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(232,242,85,0.16),_transparent_22%),linear-gradient(180deg,#f7f4ed_0%,#f5f2eb_100%)] text-[#121212]">
      <div className="flex h-full w-full overflow-hidden bg-[#fbfaf7]">
        <aside className="relative hidden h-full w-[280px] shrink-0 overflow-hidden border-r border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fcfaf5_100%)] lg:flex lg:flex-col">
          <div className="absolute bottom-0 right-0 top-0 w-px bg-[linear-gradient(180deg,rgba(18,18,18,0.08)_0%,rgba(18,18,18,0.08)_60%,transparent_100%)]" />
          <div className="absolute bottom-0 right-6 top-0 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.16)_1px,_transparent_1.4px)] bg-[length:1px_10px] bg-repeat-y opacity-65" />
          <div className="border-b border-black/8 px-8 py-8">
            <div className="text-[11px] uppercase tracking-[0.42em] text-black/35">Customer intelligence</div>
            <div className="mt-3 text-[34px] font-semibold tracking-tight">ReviewLens</div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between px-4 py-5">
            <nav className="space-y-2">
              {kSidebarItems.map(({ id, label }, index) => {
                const isActive = activeSection === id || (id === 'chat' && isChatOpen)

                return (
                  <motion.button
                    className={`group relative flex w-full items-center justify-between rounded-[28px] border px-5 py-4 text-left text-[17px] shadow-[0_8px_20px_rgba(18,18,18,0.02)] transition ${
                      isActive
                        ? 'border-black/12 bg-[#f3f0ea] font-medium text-black'
                        : 'border-transparent text-black/68 hover:border-black/8 hover:bg-[#faf8f3]'
                    }`}
                    key={id}
                    onClick={() => scrollToSection(id)}
                    type="button"
                    whileHover={{ x: 4, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[11px] tracking-[0.22em] text-black/35">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{label}</span>
                    </div>
                    <span className="absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x opacity-70" />
                    {isActive ? <span className="h-2.5 w-2.5 bg-[#e8f255]" /> : null}
                  </motion.button>
                )
              })}
            </nav>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#fbfaf7]">
          <header className="relative shrink-0 border-b border-black/8 px-6 py-5 lg:px-10">
            <div className="absolute inset-x-10 bottom-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.16)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x opacity-70" />
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <BUrlInput />
              <div className="flex flex-wrap items-center gap-3">
                <BModeToggle mode={mode} onChange={handleModeChange} />
                <BExportButton
                  brief={brief}
                  isDisabled={!brief}
                  messages={chatMessages}
                  mode={mode}
                  reviews={reviews}
                />
                <motion.button
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f255] text-sm font-semibold shadow-[0_12px_24px_rgba(232,242,85,0.28)]"
                  onClick={() => scrollToSection('settings')}
                  type="button"
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  RL
                </motion.button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden px-6 py-7 lg:px-10">
            <div className="h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pr-1" ref={contentRef}>
              <section className="mb-10" ref={dashboardRef}>
                <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-black/35">Insights</p>
                    <h1 className="mt-1 text-5xl font-semibold tracking-tight text-black">Reporting</h1>
                    <div className="mt-4 h-px w-52 bg-[radial-gradient(circle,_rgba(18,18,18,0.18)_1px,_transparent_1.5px)] bg-[length:10px_1px] bg-repeat-x" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="relative overflow-hidden rounded-[24px] border border-black/8 bg-white px-4 py-3">
                      <div className="absolute inset-x-4 top-3 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x" />
                      <div className="text-xs uppercase tracking-[0.2em] text-black/38">Mode</div>
                      <div className="mt-2 text-xl font-semibold capitalize">{mode}</div>
                    </div>
                    <div className="relative overflow-hidden rounded-[24px] border border-black/8 bg-white px-4 py-3">
                      <div className="absolute inset-x-4 top-3 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x" />
                      <div className="text-xs uppercase tracking-[0.2em] text-black/38">Reviews</div>
                      <div className="mt-2 text-xl font-semibold">{reviews.length}</div>
                    </div>
                    <div className="relative overflow-hidden rounded-[24px] border border-black/8 bg-white px-4 py-3">
                      <div className="absolute inset-x-4 top-3 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x" />
                      <div className="text-xs uppercase tracking-[0.2em] text-black/38">Status</div>
                      <div className="mt-2 text-xl font-semibold">{brief ? 'Ready' : 'Waiting'}</div>
                    </div>
                    <div className="relative overflow-hidden rounded-[24px] border border-black/8 bg-[#f3f0ea] px-4 py-3">
                      <div className="absolute inset-x-4 top-3 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x" />
                      <div className="text-xs uppercase tracking-[0.2em] text-black/38">Workspace</div>
                      <div className="mt-2 text-xl font-semibold">Live</div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid gap-6">
                <section ref={reviewsRef}>
                  <motion.div {...kPanelMotion} className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8">
                    <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-black/35">Reviews</p>
                        <h2 className="mt-1 text-4xl font-semibold tracking-tight">Recent review feed</h2>
                      </div>
                      <div className="bg-[#e8f255] px-3 py-1 text-sm">{reviews.length}</div>
                    </div>
                    {reviews.length > 0 ? (
                      <div className="overflow-hidden rounded-[26px] border border-black/8">
                        <div className="grid grid-cols-[1fr_120px_140px_120px] border-b border-black/8 bg-[#f8f6f1] px-5 py-3 text-sm uppercase tracking-[0.2em] text-black/42">
                          <div>Review</div>
                          <div>Rating</div>
                          <div>Date</div>
                          <div>Status</div>
                        </div>
                        {reviews.slice(0, 10).map((review) => (
                          <div
                            className="relative grid grid-cols-[1fr_120px_140px_120px] border-t border-black/8 px-5 py-4 text-[15px]"
                            key={review.id}
                          >
                            <div className="absolute inset-x-5 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.11)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-80" />
                            <div>
                              <div className="font-medium text-black">{review.author}</div>
                              <div className="mt-1 text-black/62">{getPreviewText(review)}</div>
                            </div>
                            <div className="font-medium text-black">{toDisplayRating(review.rating)}</div>
                            <div className="text-black/62">{formatDate(review.date)}</div>
                            <div>
                              <span
                                className={`rounded-full px-3 py-1 text-sm ${
                                  getStatusLabel(review) === 'Positive'
                                    ? 'bg-[#eef5d2] text-[#48621b]'
                                    : getStatusLabel(review) === 'Risk'
                                      ? 'bg-[#f7e6df] text-[#8f4b33]'
                                      : 'bg-[#f3f0ea] text-black/62'
                                }`}
                              >
                                {getStatusLabel(review)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[26px] border border-dashed border-black/10 bg-[#fbfaf7] px-5 py-8 text-black/48">
                        Run an analysis to populate the live review table.
                      </div>
                    )}
                  </motion.div>
                </section>

              <section ref={briefingRef}>
                <AnimatePresence mode="popLayout">
                  {brief ? (
                    <motion.div key="brief" {...kPanelMotion}>
                      <BBriefPanel
                        brief={brief}
                        onSeeAllReviews={() => scrollToSection('reviews')}
                        reviews={reviews}
                      />
                    </motion.div>
                  ) : (
                    <motion.div {...kPanelMotion} className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8">
                      <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
                      <p className="text-sm uppercase tracking-[0.28em] text-black/35">Briefing</p>
                      <h2 className="mt-1 text-4xl font-semibold tracking-tight">Auto brief</h2>
                      <div className="mt-5 rounded-[26px] border border-dashed border-black/10 bg-[#fbfaf7] px-5 py-8 text-black/48">
                        The auto-generated brief will appear here after you run an analysis.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <section ref={exportsRef}>
                <motion.div
                  {...kPanelMotion}
                  className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8"
                >
                  <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-black/35">Exports</p>
                      <h2 className="mt-1 text-4xl font-semibold tracking-tight">Share the workspace</h2>
                    </div>
                    <BExportButton
                      brief={brief}
                      isDisabled={!brief}
                      messages={chatMessages}
                      mode={mode}
                      reviews={reviews}
                    />
                  </div>
                  <div className="mt-5 rounded-[24px] border border-black/8 bg-[#f8f6f1] p-5 text-[16px] leading-8 text-black/68">
                    Export creates a PDF of the loaded dashboard, briefing, and conversation transcript. The button becomes active once a brief exists.
                  </div>
                </motion.div>
              </section>

              <section ref={settingsRef}>
                <motion.div
                  {...kPanelMotion}
                  className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8"
                >
                  <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
                  <p className="text-sm uppercase tracking-[0.28em] text-black/35">Settings</p>
                  <h2 className="mt-1 text-4xl font-semibold tracking-tight">Workspace controls</h2>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-[18px] border border-black bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1f1f1f]"
                      onClick={handleResetWorkspace}
                      type="button"
                    >
                      Reset workspace
                    </button>
                    <button
                      className="rounded-[18px] border border-black/10 bg-[#f5f3eb] px-4 py-3 text-sm font-medium text-black/70"
                      onClick={() => scrollToSection('dashboard')}
                      type="button"
                    >
                      Back to top
                    </button>
                  </div>
                </motion.div>
              </section>

              <section ref={helpRef}>
                <motion.div
                  {...kPanelMotion}
                  className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8"
                >
                  <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
                  <p className="text-sm uppercase tracking-[0.28em] text-black/35">Help &amp; Support</p>
                  <h2 className="mt-1 text-4xl font-semibold tracking-tight">How to use the workspace</h2>
                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    <div className="rounded-[22px] border border-black/8 bg-[#f8f6f1] p-4 text-[15px] leading-7 text-black/68">
                      1. Paste a Trustpilot business review URL and run analysis.
                    </div>
                    <div className="rounded-[22px] border border-black/8 bg-[#f8f6f1] p-4 text-[15px] leading-7 text-black/68">
                      2. Review the statistics, rating distribution, and generated brief.
                    </div>
                    <div className="rounded-[22px] border border-black/8 bg-[#f8f6f1] p-4 text-[15px] leading-7 text-black/68">
                      3. Use chat prompts to ask follow-up questions and export the report when ready.
                    </div>
                  </div>
                </motion.div>
              </section>
              </div>
            </div>

          </div>
        </section>
      </div>
      <AnimatePresence initial={false}>
        {isChatOpen ? (
          <>
            <motion.button
              aria-label="Close chat panel"
              className="fixed inset-0 z-40 bg-black/8 backdrop-blur-[2px]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={handleToggleChat}
              type="button"
              animate={{ opacity: 1 }}
            />
            <motion.section
              animate={{ opacity: 1, x: 0 }}
              className="fixed bottom-6 right-6 top-6 z-50 hidden w-[min(50vw,calc(100vw-5rem))] xl:block"
              exit={{ opacity: 0, x: 28 }}
              initial={{ opacity: 0, x: 28 }}
              key="chat-overlay"
              ref={chatPanelRef}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <motion.button
                aria-label="Collapse chat panel"
                className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/94 text-black/60 shadow-[0_16px_30px_rgba(18,18,18,0.08)] backdrop-blur"
                onClick={handleToggleChat}
                type="button"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-lg leading-none">×</span>
              </motion.button>
              <BChatPanel isSidebar />
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
      <motion.button
        aria-label={isChatOpen ? 'Close chat panel' : 'Open chat panel'}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white text-[#2f1d63] shadow-[0_18px_44px_rgba(18,18,18,0.14)]"
        onClick={handleToggleChat}
        type="button"
        whileHover={{ y: -3, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          animate={{ scale: isChatOpen ? [1, 1.06, 1] : 1 }}
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(143,107,255,0.16),transparent_60%)]"
          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <svg
          aria-hidden="true"
          className="relative z-10 h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M7 10h10" />
          <path d="M7 14h6" />
          <path d="M5 19.2V6.8A1.8 1.8 0 0 1 6.8 5h10.4A1.8 1.8 0 0 1 19 6.8v7.4A1.8 1.8 0 0 1 17.2 16H9.5L5 19.2Z" />
        </svg>
        <span className="sr-only">Chat</span>
      </motion.button>
      <BIngestLoader hasReviews={reviews.length > 0} isVisible={isLoading} />
    </main>
  )
}
