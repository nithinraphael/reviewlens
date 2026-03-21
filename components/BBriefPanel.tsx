'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import { useState } from 'react'
import { BStatPulse } from '@/components/BStatPulse'
import type { BBriefPanelProps, TrustpilotReview } from '@/types'

type ChartTab = 'all' | 'positive' | 'service' | 'risk'

interface ChartDatum {
  readonly label: string
  readonly value: number
}

const kChartTabs: readonly { readonly id: ChartTab; readonly label: string }[] = [
  { id: 'all', label: 'All ratings' },
  { id: 'positive', label: 'Positive ratings' },
  { id: 'service', label: 'Customer service' },
  { id: 'risk', label: 'Risk flags' },
]

const kServiceKeywords = [
  'service',
  'support',
  'agent',
  'helpful',
  'staff',
  'team',
  'representative',
  'customer care',
] as const

const kRiskKeywords = [
  'refund',
  'cancel',
  'charge',
  'fraud',
  'claim',
  'complaint',
  'delay',
  'billing',
  'problem',
  'issue',
  'legal',
  'unsafe',
] as const

const countRatings = (reviews: readonly TrustpilotReview[]) => {
  const counts = new Map<number, number>([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ])

  reviews.forEach(({ rating }) => {
    const roundedRating = Math.max(1, Math.min(5, Math.round(rating)))
    counts.set(roundedRating, (counts.get(roundedRating) ?? 0) + 1)
  })

  return [1, 2, 3, 4, 5].map((rating) => ({
    label: `${rating} star`,
    value: counts.get(rating) ?? 0,
  }))
}

const matchesKeywordGroup = (review: TrustpilotReview, keywords: readonly string[]) => {
  const text = `${review.title} ${review.body}`.toLowerCase()
  return keywords.some((keyword) => text.includes(keyword))
}

const getChartData = (tab: ChartTab, reviews: readonly TrustpilotReview[]): readonly ChartDatum[] => {
  if (tab === 'positive') {
    return [
      { label: '4 star', value: reviews.filter(({ rating }) => Math.round(rating) === 4).length },
      { label: '5 star', value: reviews.filter(({ rating }) => Math.round(rating) === 5).length },
    ]
  }

  if (tab === 'service') {
    const filteredReviews = reviews.filter((review) => matchesKeywordGroup(review, kServiceKeywords))
    return countRatings(filteredReviews)
  }

  if (tab === 'risk') {
    const filteredReviews = reviews.filter((review) => matchesKeywordGroup(review, kRiskKeywords))
    return countRatings(filteredReviews)
  }

  return countRatings(reviews)
}

const getBarHeight = (value: number, maxValue: number) => {
  if (maxValue === 0) return 18
  return Math.max(18, Math.round((value / maxValue) * 100))
}

const getInsightLine = (tab: ChartTab, data: readonly ChartDatum[]) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (tab === 'positive') return `${total} reviews landed at 4 or 5 stars.`
  if (tab === 'service') return `${total} reviews explicitly mention service-related interactions.`
  if (tab === 'risk') return `${total} reviews include risk-oriented language such as claims, delays, refunds, or billing issues.`
  return `${total} total reviews distributed across the 1-to-5-star scale.`
}

const getTopBucket = (data: readonly ChartDatum[]) =>
  data.reduce((current, item) => (item.value > current.value ? item : current), data[0] ?? { label: 'N/A', value: 0 })

export const BBriefPanel: FC<BBriefPanelProps> = ({ brief, reviews, onSeeAllReviews }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('all')

  const chartData = getChartData(activeTab, reviews)
  const maxValue = Math.max(...chartData.map(({ value }) => value), 0)
  const topBucket = getTopBucket(chartData)
  const urgentFlagCount = brief.urgentFlags.length
  const topPainPoints = brief.painPoints.slice(0, 3)
  const topPraiseThemes = brief.praiseThemes.slice(0, 3)

  return (
    <section className="space-y-5">
      <motion.div
        className="relative overflow-hidden rounded-[38px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8"
        transition={{ duration: 0.28, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_42%)] opacity-70" />
        <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-black/35">Overview</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-black">Review performance</h2>
            <div className="mt-4 h-px w-44 bg-[radial-gradient(circle,_rgba(18,18,18,0.18)_1px,_transparent_1.5px)] bg-[length:10px_1px] bg-repeat-x" />
          </div>
          <div className="flex flex-wrap gap-3">
            <BStatPulse label="Average rating" tone="accent" value={brief.averageRating} />
            <BStatPulse label="Reviews" value={brief.reviewCount} />
            <BStatPulse label="Urgent flags" tone={urgentFlagCount > 0 ? 'alert' : 'default'} value={urgentFlagCount} />
          </div>
        </div>

        <div className="mt-8 grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-black/8 p-5 shadow-[0_10px_28px_rgba(18,18,18,0.04)]"
            transition={{ duration: 0.24, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute inset-y-5 left-5 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:1px_10px] bg-repeat-y opacity-75" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-black/42">Sentiment breakdown</div>
                <div className="mt-1 text-[18px] font-medium text-black">
                  Based on the currently loaded review dataset
                </div>
              </div>
              <motion.div className="rounded-[20px] border border-black/8 bg-[#f5f3eb] px-4 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" whileHover={{ y: -1 }}>
                Top bucket: {topBucket.label} ({topBucket.value})
              </motion.div>
            </div>

            <div className="rounded-[32px] border border-black/8 bg-[linear-gradient(180deg,#fbfaf7,#f7f5ef)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <div className="mb-5 flex flex-wrap gap-5 text-sm text-black/55">
                {kChartTabs.map(({ id, label }) => (
                  <motion.button
                    className={`rounded-full border-b pb-1 transition ${
                      id === activeTab ? 'border-black text-black' : 'border-transparent text-black/55 hover:border-black/20'
                    }`}
                    key={id}
                    onClick={() => setActiveTab(id)}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-[24px] border border-black/8 bg-white/80 px-4 pb-4 pt-6">
                <div className="pointer-events-none absolute inset-x-4 inset-y-6 grid grid-rows-4">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      className="border-t border-black/8 bg-[radial-gradient(circle,_rgba(18,18,18,0.11)_1px,_transparent_1.4px)] bg-[length:9px_1px] bg-repeat-x"
                      key={item}
                    />
                  ))}
                </div>
                <div className={`relative grid h-[280px] items-end gap-3 ${chartData.length <= 2 ? 'grid-cols-2' : 'grid-cols-5'}`}>
                  {chartData.map(({ label, value }, index) => (
                    <div className="flex h-full flex-col justify-end" key={label}>
                      <div className="mb-3 text-center font-mono text-sm text-black/48">{value}</div>
                      <motion.div
                        animate={{ height: `${getBarHeight(value, maxValue)}%`, opacity: 1 }}
                        className="relative rounded-t-[22px] border border-[#d8e24f] bg-[linear-gradient(180deg,#e6f35c_0%,#d6e14f_70%,rgba(214,225,79,0.18)_100%)] shadow-[0_14px_24px_rgba(214,225,79,0.18)]"
                        initial={{ height: '18%', opacity: 0.45 }}
                        transition={{ delay: index * 0.04, duration: 0.45 }}
                        whileHover={{ scaleX: 1.04 }}
                      >
                        <div className="absolute inset-x-2 top-2 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.2)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-55" />
                      </motion.div>
                      <div className="mt-3 text-center text-sm text-black/55">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-[20px] border border-black/8 bg-white px-4 py-3 text-[15px] text-black/62">
                {getInsightLine(activeTab, chartData)}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-black/8 p-5 shadow-[0_10px_28px_rgba(18,18,18,0.04)]"
            transition={{ duration: 0.24, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
            <div className="text-sm uppercase tracking-[0.24em] text-black/42">Executive summary</div>
            <p className="mt-4 text-[17px] leading-8 text-black/72">{brief.summary}</p>
            <div className="mt-6 space-y-3">
              <motion.div className="rounded-[24px] border border-black/8 bg-[#f5f3eb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" whileHover={{ y: -1 }}>
                <div className="text-xs uppercase tracking-[0.24em] text-black/38">Pain points</div>
                <div className="mt-3 text-[16px] leading-7 text-black/72">
                  {topPainPoints.join(' · ')}
                </div>
              </motion.div>
              <motion.div className="rounded-[24px] border border-black/8 bg-[#f5f3eb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]" whileHover={{ y: -1 }}>
                <div className="text-xs uppercase tracking-[0.24em] text-black/38">Praise themes</div>
                <div className="mt-3 text-[16px] leading-7 text-black/72">
                  {topPraiseThemes.join(' · ')}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          className="relative overflow-hidden rounded-[38px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)]"
          transition={{ duration: 0.24, ease: 'easeOut' }}
          whileHover={{ y: -2 }}
        >
          <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-semibold tracking-tight">Theme table</div>
            <motion.div className="rounded-full bg-[#e8f255] px-3 py-1 text-sm shadow-[0_8px_18px_rgba(232,242,85,0.28)]" whileHover={{ scale: 1.04 }}>
              {brief.reviewCount}
            </motion.div>
          </div>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-black/8">
            <div className="grid grid-cols-[1.1fr_1.2fr_0.6fr] border-b border-black/8 bg-[#f8f6f1] px-5 py-3 text-sm uppercase tracking-[0.2em] text-black/42">
              <div>Theme</div>
              <div>Observation</div>
              <div>Status</div>
            </div>
            {[...topPraiseThemes, ...topPainPoints].slice(0, 6).map((item, index) => {
              const isPositive = index < topPraiseThemes.length

              return (
                <div
                  className="relative grid grid-cols-[1.1fr_1.2fr_0.6fr] border-t border-black/8 px-5 py-4 text-[15px]"
                  key={item}
                >
                  <div className="absolute inset-x-5 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.11)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-80" />
                  <div className="font-medium text-black">{item}</div>
                  <div className="text-black/62">
                    {isPositive
                      ? 'Frequently mentioned as a positive pattern across recent reviews.'
                      : 'Appears as a recurring friction point that should be monitored.'}
                  </div>
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        isPositive ? 'bg-[#eef5d2] text-[#48621b]' : 'bg-[#f7e6df] text-[#8f4b33]'
                      }`}
                    >
                      {isPositive ? 'Positive' : 'Watch'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden rounded-[38px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)]"
          transition={{ duration: 0.24, ease: 'easeOut' }}
          whileHover={{ y: -2 }}
        >
          <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-semibold tracking-tight">Risk summary</div>
            <motion.button
              className="rounded-[20px] border border-black px-4 py-2 text-sm transition hover:bg-black hover:text-white"
              onClick={onSeeAllReviews}
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              See all
            </motion.button>
          </div>
          <div className="mt-6 text-6xl font-semibold tracking-tight">
            {brief.averageRating.toFixed(1)}
          </div>
          <div className="mt-1 text-black/45">Average rating from analyzed reviews</div>
          <motion.div
            className="relative mt-7 overflow-hidden rounded-[28px] border border-[#d8e24f] bg-[#eef257] p-5 shadow-[0_16px_34px_rgba(214,225,79,0.18)]"
            whileHover={{ y: -2, scale: 1.01 }}
          >
            <div className="absolute inset-x-5 top-3 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.16)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x" />
            <div className="text-3xl font-semibold">{topBucket.value}</div>
            <div className="mt-2 text-black/62">Reviews in the currently strongest visible segment</div>
          </motion.div>
          <div className="mt-5 space-y-3">
            {(brief.urgentFlags.length > 0 ? brief.urgentFlags : ['No urgent flags detected']).map((flag) => (
              <motion.div
                className="rounded-[20px] border border-black/8 bg-[#fbfaf7] px-4 py-3 text-[15px] text-black/65 shadow-[0_8px_18px_rgba(18,18,18,0.03)]"
                key={flag}
                whileHover={{ x: 2 }}
              >
                {flag}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
