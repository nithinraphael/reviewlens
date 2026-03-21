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
  if (tone === 'accent') return 'border-[#d6df57] bg-[#eef257] text-black'
  if (tone === 'alert') return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-black/8 bg-[#f8f6f1] text-black'
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
      className={`relative overflow-hidden rounded-[26px] border px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.04)] ${getToneClassName(tone)}`}
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.015 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_42%)] opacity-70" />
      <div className="absolute inset-x-4 top-3 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.14)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-75" />
      <div className="relative text-[10px] uppercase tracking-[0.25em] opacity-55">{label}</div>
      <motion.div className="relative mt-2 text-2xl font-semibold">{rounded}</motion.div>
    </motion.div>
  )
}
