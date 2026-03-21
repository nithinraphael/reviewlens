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
  if (tone === 'accent') return 'border-amber-300/20 bg-amber-300/10 text-amber-50'
  if (tone === 'alert') return 'border-rose-300/20 bg-rose-300/10 text-rose-50'
  return 'border-white/10 bg-white/[0.04] text-zinc-100'
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
    const controls = animate(count, value, { duration: 0.9, ease: 'easeOut' })
    return () => controls.stop()
  }, [count, value])

  return (
    <motion.div
      className={`rounded-[1.4rem] border px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.14)] ${getToneClassName(tone)}`}
      initial={{ opacity: 0, y: 14 }}
      whileHover={{ y: -2 }}
    >
      <div className="text-[10px] uppercase tracking-[0.25em] opacity-65">{label}</div>
      <motion.div className="mt-2 text-2xl font-semibold">{rounded}</motion.div>
    </motion.div>
  )
}
