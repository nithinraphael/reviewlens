'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { BBriefPanel } from '@/components/BBriefPanel'
import { BChatPanel } from '@/components/BChatPanel'
import { BExportButton } from '@/components/BExportButton'
import { BIngestLoader } from '@/components/BIngestLoader'
import { BModeToggle } from '@/components/BModeToggle'
import { BTutorialModal } from '@/components/BTutorialModal'
import { BUrlInput } from '@/components/BUrlInput'
import { useReviewStore } from '@/store/reviewStore'
import type { AnalystMode, TrustpilotReview } from '@/types'

type SectionId = 'dashboard' | 'reviews' | 'briefing' | 'chat'

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

const kIdleOrbs = [
  {
    className:
      'left-[-4%] top-[-10%] h-40 w-40 bg-[radial-gradient(circle,rgba(232,242,85,0.95)_0%,rgba(232,242,85,0.18)_46%,transparent_72%)]',
    duration: 8.4,
  },
  {
    className:
      'right-[-2%] top-[10%] h-36 w-36 bg-[radial-gradient(circle,rgba(255,214,153,0.9)_0%,rgba(255,214,153,0.16)_48%,transparent_72%)]',
    duration: 9.2,
  },
  {
    className:
      'bottom-[-16%] left-[18%] h-48 w-48 bg-[radial-gradient(circle,rgba(197,239,209,0.88)_0%,rgba(197,239,209,0.14)_48%,transparent_74%)]',
    duration: 10.1,
  },
] as const

const kIdlePulseBars = [
  'h-12',
  'h-20',
  'h-16',
  'h-28',
  'h-10',
  'h-24',
] as const

const kIdleStatCards = [
  {
    title: 'Signal',
    value: 'Patterns',
    body: 'Themes begin clustering the moment reviews arrive.',
    className: 'bg-[linear-gradient(180deg,#f5f8dd_0%,#eef4ca_100%)]',
  },
  {
    title: 'Mood',
    value: 'Sentiment',
    body: 'Praise, friction, and urgency separate into clear tracks.',
    className: 'bg-[linear-gradient(180deg,#fff8ef_0%,#f8ecdb_100%)]',
  },
  {
    title: 'Output',
    value: 'Brief',
    body: 'A decision-ready narrative forms without asking for extra setup.',
    className: 'bg-[linear-gradient(180deg,#ffffff_0%,#f6f2ea_100%)]',
  },
] as const

const BIdleState: FC<{
  eyebrow: string
  title: string
  body: string
  accentLabel: string
}> = ({ eyebrow, title, body, accentLabel }) => (
  <div className="relative overflow-hidden rounded-[30px] border border-black/8 bg-[linear-gradient(145deg,#fffefb_0%,#f8f3e8_48%,#fdfbf5_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_24px_60px_rgba(18,18,18,0.05)]">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.6)_0%,transparent_24%,transparent_76%,rgba(255,255,255,0.3)_100%)]" />
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x opacity-80" />
    {kIdleOrbs.map(({ className, duration }, index) => (
      <motion.div
        animate={{ x: [0, 10, -6, 0], y: [0, -12, 8, 0], scale: [1, 1.08, 0.94, 1] }}
        className={`pointer-events-none absolute rounded-full blur-2xl ${className}`}
        key={className}
        transition={{
          duration,
          delay: index * 0.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
    ))}
    <div className="relative overflow-hidden rounded-[26px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,252,245,0.92)_100%)] px-5 py-5 backdrop-blur-sm lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(232,242,85,0.1),transparent_34%)]" />
      <div className="relative grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-black/42 shadow-[0_8px_24px_rgba(18,18,18,0.04)]">
            <motion.span
              animate={{ scale: [1, 1.24, 1], opacity: [0.8, 1, 0.8] }}
              className="h-2.5 w-2.5 rounded-full bg-[#e8f255]"
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
            {eyebrow}
          </div>
          <div className="mt-4 max-w-[16ch] text-[clamp(2.2rem,4vw,4.7rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-black">
            {title}
          </div>
          <p className="mt-4 max-w-[34rem] text-[16px] leading-7 text-black/60 lg:text-[18px] lg:leading-8">{body}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-black/8 bg-[#121212] px-4 py-2 text-[13px] font-medium text-white shadow-[0_12px_28px_rgba(18,18,18,0.18)]">
              {accentLabel}
            </div>
            <div className="rounded-full border border-black/8 bg-white/84 px-4 py-2 text-[13px] text-black/62">
              waiting for first source URL
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {kIdleStatCards.map(({ title: statTitle, value, body: statBody, className }, index) => (
              <motion.div
                animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
                className={`rounded-[22px] border border-black/8 p-4 shadow-[0_14px_30px_rgba(18,18,18,0.05)] ${className}`}
                key={`${accentLabel}-${statTitle}`}
                transition={{
                  duration: 3 + index * 0.4,
                  delay: index * 0.14,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.24em] text-black/38">{statTitle}</div>
                <div className="mt-3 text-[22px] font-semibold tracking-[-0.05em] text-black">{value}</div>
                <div className="mt-2 text-[13px] leading-6 text-black/58">{statBody}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[340px]">
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 1.2, 0] }}
            className="absolute inset-x-0 top-6 mx-auto w-[min(100%,34rem)] rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#121212_0%,#1a1a1a_100%)] p-6 text-white shadow-[0_34px_80px_rgba(18,18,18,0.24)]"
            transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/38">Live canvas</div>
                <div className="mt-3 text-[34px] font-semibold tracking-[-0.06em]">{accentLabel}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[12px] text-white/72">
                warming up
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Incoming pulse</div>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {kIdlePulseBars.map((heightClass, index) => (
                    <motion.div
                      animate={{ scaleY: [1, 1.22, 0.88, 1] }}
                      className={`w-full origin-bottom rounded-full bg-[linear-gradient(180deg,#f7f9d1_0%,#d6df58_100%)] ${heightClass}`}
                      key={`${accentLabel}-${heightClass}`}
                      transition={{
                        duration: 1.8,
                        delay: index * 0.08,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4"
                  transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Clustering</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['pricing friction', 'delight moments', 'service lag', 'trust cues'].map((item) => (
                      <span
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[12px] text-white/72"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  animate={{ x: [0, -8, 0], y: [0, 4, 0] }}
                  className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.04)_100%)] p-4"
                  transition={{ duration: 3.8, delay: 0.12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Narrative draft</div>
                      <div className="mt-2 text-[18px] font-medium tracking-[-0.04em] text-white">
                        The workspace is poised to turn noise into direction.
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 180, 360] }}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] text-[18px]"
                      transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                    >
                      +
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0], rotate: [0, -2, 0] }}
            className="absolute bottom-3 left-4 rounded-[24px] border border-black/8 bg-white/86 px-4 py-4 shadow-[0_18px_36px_rgba(18,18,18,0.08)] backdrop-blur-sm"
            transition={{ duration: 3.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            <div className="text-[10px] uppercase tracking-[0.24em] text-black/34">Mood index</div>
            <div className="mt-2 flex items-end gap-2">
              {['h-6', 'h-10', 'h-8', 'h-12'].map((heightClass, index) => (
                <motion.div
                  animate={{ scaleY: [1, 1.16, 1] }}
                  className={`w-3 origin-bottom rounded-full ${heightClass} ${
                    index === 1 || index === 3 ? 'bg-[#121212]' : 'bg-[#e8f255]'
                  }`}
                  key={`${accentLabel}-${heightClass}`}
                  transition={{ duration: 1.7, delay: index * 0.1, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0], x: [0, 8, 0] }}
            className="absolute bottom-8 right-3 rounded-full border border-black/8 bg-[#f7f1e6] px-4 py-3 text-[12px] uppercase tracking-[0.24em] text-black/55 shadow-[0_14px_28px_rgba(18,18,18,0.08)]"
            transition={{ duration: 3.4, delay: 0.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          >
            no dead air
          </motion.div>
        </div>
      </div>
    </div>
  </div>
)

export const BAppShell: FC = () => {
  const brief = useReviewStore((state) => state.brief)
  const chatMessages = useReviewStore((state) => state.chatMessages)
  const mode = useReviewStore((state) => state.mode)
  const reviews = useReviewStore((state) => state.reviews)
  const isLoading = useReviewStore((state) => state.isLoading)
  const setMode = useReviewStore((state) => state.setMode)

  const contentRef = useRef<HTMLDivElement>(null)
  const chatPanelRef = useRef<HTMLElement>(null)
  const dashboardRef = useRef<HTMLElement>(null)
  const reviewsRef = useRef<HTMLElement>(null)
  const briefingRef = useRef<HTMLElement>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const sections: readonly ObservedSection[] = [
      { id: 'dashboard', element: dashboardRef.current },
      { id: 'reviews', element: reviewsRef.current },
      { id: 'briefing', element: briefingRef.current },
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
    }

    refMap[sectionId].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
    setActiveSection(sectionId)
  }

  const handleToggleChat = () => {
    setIsChatOpen((current) => !current)
  }

  const handleOpenTutorial = () => {
    setIsTutorialOpen(true)
  }

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false)
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
            <motion.button
              className="relative overflow-hidden rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#f6f2ea_100%)] px-5 py-5 text-left shadow-[0_16px_36px_rgba(18,18,18,0.05)]"
              onClick={handleOpenTutorial}
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
            >
              <div className="absolute inset-x-5 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x opacity-75" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.34em] text-black/32">Tutorial</div>
                  <div className="mt-3 text-[22px] font-medium tracking-tight text-black">See how it works</div>
                  <p className="mt-2 text-[14px] leading-6 text-black/56">
                    Animated walkthrough of the ingest, brief, chat, and export flow.
                  </p>
                </div>
                <motion.div
                  animate={{ x: [0, 3, 0], opacity: [0.6, 1, 0.6] }}
                  className="mt-1 text-xl text-black/42"
                  transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
                >
                  →
                </motion.div>
              </div>
            </motion.button>
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
                  onClick={() => scrollToSection('dashboard')}
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
                      <BIdleState
                        accentLabel="Fresh reviews"
                        body="Drop in a Trustpilot URL and we’ll start collecting the strongest praise, sharpest complaints, and patterns worth chasing."
                        eyebrow="Review stream"
                        title="Nothing in the feed yet"
                      />
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
                      <div className="mt-5">
                        <BIdleState
                          accentLabel="Exec summary"
                          body="Once reviews land, this panel will turn them into pain points, praise themes, urgent flags, and a clean narrative you can share."
                          eyebrow="Brief engine"
                          title="Waiting to write the story"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
      <BTutorialModal isOpen={isTutorialOpen} onClose={handleCloseTutorial} />
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
