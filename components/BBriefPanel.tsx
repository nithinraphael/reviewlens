'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { BStatPulse } from '@/components/BStatPulse'
import type { BBriefPanelProps } from '@/types'

const kPanelTransition = { duration: 0.28, ease: 'easeOut' } as const

const getSections = ({ painPoints, praiseThemes, urgentFlags }: BBriefPanelProps['brief']) =>
  [
    {
      title: 'Pain points',
      items: painPoints,
      tone: 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]',
    },
    {
      title: 'Praise themes',
      items: praiseThemes,
      tone: 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]',
    },
    {
      title: 'Urgent flags',
      items: urgentFlags.length > 0 ? urgentFlags : ['No urgent flags detected'],
      tone:
        urgentFlags.length > 0
          ? 'border-amber-400/40 bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(120,53,15,0.12))] text-amber-50'
          : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]',
    },
  ] as const

export const BBriefPanel: FC<BBriefPanelProps> = ({ brief }) => {
  const sections = getSections(brief)
  const urgentFlagCount = brief.urgentFlags.length

  return (
    <AnimatePresence>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4"
        exit={{ opacity: 0, y: 16 }}
        initial={{ opacity: 0, y: 16 }}
        transition={kPanelTransition}
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Auto brief</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Review snapshot</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                {brief.reviewCount} reviews
              </div>
              <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-50">
                {brief.averageRating.toFixed(1)} avg rating
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">{brief.summary}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <BStatPulse label="Review volume" value={brief.reviewCount} />
            <BStatPulse label="Average rating" tone="accent" value={brief.averageRating} />
            <BStatPulse label="Urgent flags" tone={urgentFlagCount > 0 ? 'alert' : 'default'} value={urgentFlagCount} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map(({ title, items, tone }, index) => (
            <motion.article
              animate={{
                opacity: 1,
                y: 0,
                scale: title === 'Urgent flags' ? [1, 1.02, 1] : 1,
              }}
              className={`relative overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.14)] ${tone}`}
              initial={{ opacity: 0, y: 16 }}
              key={title}
              transition={{ delay: index * 0.07, duration: 0.24 }}
              whileHover={{ y: -3 }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-100">{title}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                {items.map((item) => (
                  <li
                    key={`${title}-${item}`}
                    className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
