'use client'

import { motion } from 'framer-motion'
import type { FC } from 'react'
import { BStatPulse } from '@/components/BStatPulse'
import type { BBriefPanelProps } from '@/types'

const getChartBars = (averageRating: number) =>
  Array.from({ length: 14 }, (_, index) => {
    const base = 34 + index * 3.7
    return Math.min(92, base + averageRating * 4)
  })

export const BBriefPanel: FC<BBriefPanelProps> = ({ brief }) => {
  const chartBars = getChartBars(brief.averageRating)
  const urgentFlagCount = brief.urgentFlags.length
  const topPainPoints = brief.painPoints.slice(0, 3)
  const topPraiseThemes = brief.praiseThemes.slice(0, 3)

  return (
    <section className="space-y-5">
      <div className="rounded-[1.9rem] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-black/45">Overview</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-black">Review performance</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <BStatPulse label="Average rating" tone="accent" value={brief.averageRating} />
            <BStatPulse label="Reviews" value={brief.reviewCount} />
            <BStatPulse label="Urgent flags" tone={urgentFlagCount > 0 ? 'alert' : 'default'} value={urgentFlagCount} />
          </div>
        </div>

        <div className="mt-8 grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.7rem] border border-black/8 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-black/48">Sentiment movement</div>
                <div className="mt-1 text-[18px] font-medium text-black">Auto-generated trend view</div>
              </div>
              <div className="flex gap-2">
                <div className="rounded-xl border border-black/10 bg-[#f5f3eb] px-3 py-2 text-sm">Line</div>
                <div className="rounded-xl border border-black px-3 py-2 text-sm">Bar</div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-black/8 bg-[linear-gradient(180deg,#fbfaf7,#f7f5ef)] p-5">
              <div className="mb-5 flex flex-wrap gap-5 text-sm text-black/55">
                <div className="font-medium text-black">All</div>
                <div>Positive signals</div>
                <div>Customer service</div>
                <div>Risk flags</div>
              </div>
              <div className="grid h-[280px] grid-cols-14 items-end gap-2 rounded-[1.2rem] border border-black/8 bg-white/80 px-4 pb-4 pt-6">
                {chartBars.map((height, index) => (
                  <motion.div
                    animate={{ height: `${height}%`, opacity: 1 }}
                    className="rounded-t-[14px] bg-[linear-gradient(180deg,#e6f35c_0%,#d6e14f_65%,rgba(214,225,79,0.18)_100%)]"
                    initial={{ height: '18%', opacity: 0.5 }}
                    key={`${index + 1}`}
                    transition={{ delay: index * 0.03, duration: 0.45 }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-black/8 p-5">
            <div className="text-sm text-black/48">Executive summary</div>
            <p className="mt-4 text-[17px] leading-8 text-black/72">{brief.summary}</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-[1.1rem] bg-[#f5f3eb] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-black/38">Pain points</div>
                <div className="mt-3 text-[16px] leading-7 text-black/72">
                  {topPainPoints.join(' · ')}
                </div>
              </div>
              <div className="rounded-[1.1rem] bg-[#f5f3eb] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-black/38">Praise themes</div>
                <div className="mt-3 text-[16px] leading-7 text-black/72">
                  {topPraiseThemes.join(' · ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.8rem] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-semibold tracking-tight">Theme table</div>
            <div className="rounded-full bg-[#e8f255] px-3 py-1 text-sm">{brief.reviewCount}</div>
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-black/8">
            <div className="grid grid-cols-[1.1fr_1.2fr_0.6fr] bg-[#f8f6f1] px-5 py-3 text-sm text-black/48">
              <div>Theme</div>
              <div>Observation</div>
              <div>Status</div>
            </div>
            {[...topPraiseThemes, ...topPainPoints].slice(0, 6).map((item, index) => {
              const isPositive = index < topPraiseThemes.length

              return (
                <div
                  className="grid grid-cols-[1.1fr_1.2fr_0.6fr] border-t border-black/8 px-5 py-4 text-[15px]"
                  key={item}
                >
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
        </div>

        <div className="rounded-[1.8rem] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-3xl font-semibold tracking-tight">Risk summary</div>
            <button className="rounded-xl border border-black px-4 py-2 text-sm">See all</button>
          </div>
          <div className="mt-6 text-6xl font-semibold tracking-tight">
            {brief.averageRating.toFixed(1)}
          </div>
          <div className="mt-1 text-black/45">Average rating from analyzed reviews</div>
          <div className="mt-7 rounded-[1.2rem] bg-[#eef257] p-5">
            <div className="text-3xl font-semibold">${brief.reviewCount * 3290}</div>
            <div className="mt-2 text-black/62">Estimated value represented in customer feedback volume</div>
          </div>
          <div className="mt-5 space-y-3">
            {(brief.urgentFlags.length > 0 ? brief.urgentFlags : ['No urgent flags detected']).map((flag) => (
              <div className="rounded-[1.1rem] border border-black/8 bg-[#fbfaf7] px-4 py-3 text-[15px] text-black/65" key={flag}>
                {flag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
