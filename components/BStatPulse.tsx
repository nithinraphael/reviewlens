'use client'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { FC } from 'react'
import { useEffect } from 'react'

interface BStatPulseProps {
  readonly label: string
  readonly value: number
  readonly suffix?: string
  readonly tone?: 'default' | 'accent' | 'alert'
}

const getToneClassName = (tone: BStatPulseProps['tone']) => {
  if (tone === 'accent') return 'border-[#c8d94a] bg-[linear-gradient(135deg,#eef257_0%,#e2e84a_100%)] text-black shadow-[0_8px_24px_rgba(214,225,79,0.32)]'
  if (tone === 'alert') return 'border-rose-200 bg-[linear-gradient(135deg,#fff1f0_0%,#ffe4e4_100%)] text-rose-700 shadow-[0_8px_20px_rgba(239,68,68,0.10)]'
  return 'border-black/8 bg-[linear-gradient(135deg,#ffffff_0%,#f6f3ec_100%)] text-black shadow-[0_8px_20px_rgba(18,18,18,0.05)]'
}

export const BStatPulse: FC<BStatPulseProps> = ({
  label,
  value,
  suffix = '',
  tone = 'default',
}) => {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) =>
    `${latest.toFixed(suffix === '%' ? 0 : 1).replace(/\.0$/, '')}${suffix}`,
  )

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.1, ease: 'easeOut' })
    return () => controls.stop()
  }, [count, value])

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[22px] border px-5 py-3.5 ${getToneClassName(tone)}`}
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.02 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.6),transparent_50%)]" />
      <div className="relative text-[10px] uppercase tracking-[0.28em] opacity-50 font-medium">{label}</div>
      <motion.div className="relative mt-1.5 text-[26px] font-semibold tracking-[-0.04em] leading-none">{rounded}</motion.div>
    </motion.div>
  )
}
