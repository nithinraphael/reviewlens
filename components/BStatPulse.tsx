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
      className={`rounded-[1.4rem] border px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.04)] ${getToneClassName(tone)}`}
      initial={{ opacity: 0, y: 14 }}
      whileHover={{ y: -2 }}
    >
      <div className="text-[10px] uppercase tracking-[0.25em] opacity-55">{label}</div>
      <motion.div className="mt-2 text-2xl font-semibold">{rounded}</motion.div>
    </motion.div>
  )
}
