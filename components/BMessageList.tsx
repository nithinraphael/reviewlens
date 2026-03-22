'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { FC } from 'react'
import { BMarkdownContent } from '@/components/BMarkdownContent'
import { getUIMessageText } from '@/lib/messages'
import type { BMessageListProps } from '@/types'

const getBubbleClassName = (role: string, tone: 'default' | 'sidebar') => {
  if (role === 'user') {
    return tone === 'sidebar'
      ? 'ml-auto border-black/90 bg-[#171717] text-white shadow-[0_18px_34px_rgba(18,18,18,0.12)]'
      : 'ml-auto border-black bg-black text-white'
  }

  return tone === 'sidebar'
    ? 'mr-auto border-black/6 bg-[#fcfbf8] text-black shadow-[0_10px_28px_rgba(18,18,18,0.04)]'
    : 'mr-auto border-black/8 bg-white text-black'
}

export const BMessageList: FC<BMessageListProps> = ({
  messages,
  isStreaming,
  isCompact = false,
  tone = 'default',
}) => (
  <div className={`flex flex-col gap-4 ${isCompact ? 'min-h-0' : 'min-h-64'}`}>
    <AnimatePresence initial={false}>
      {messages.map((message) => {
        const content = getUIMessageText(message)
        const isUserMessage = message.role === 'user'
        const bubbleToneClassName = getBubbleClassName(message.role, tone)

        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`relative ${isUserMessage ? 'flex justify-end' : 'flex justify-start'}`}
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 16 }}
            key={message.id}
            transition={{ duration: 0.22 }}
            whileHover={tone === 'sidebar' ? { y: -1 } : undefined}
          >
            <div
              className={`relative border px-5 py-4 text-sm leading-7 ${
                tone === 'sidebar'
                  ? isUserMessage
                    ? 'max-w-fit min-w-0 rounded-[30px] rounded-br-[12px] overflow-visible px-4 py-3'
                    : 'max-w-[86%] rounded-[30px] rounded-bl-[12px] overflow-visible'
                  : 'max-w-[85%] overflow-hidden rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
              } ${bubbleToneClassName}`}
            >
              <div
                className={`absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(255,255,255,0.3)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x ${
                  isUserMessage ? 'opacity-70' : 'opacity-0'
                }`}
              />
              <div
                className={`absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x ${
                  isUserMessage ? 'opacity-0' : 'opacity-80'
                }`}
              />
              {tone === 'sidebar' ? (
                <div
                  className={`absolute bottom-3 h-5 w-5 rotate-45 border ${
                    isUserMessage
                      ? '-right-1 border-l-0 border-t-0 border-black/90 bg-[#171717]'
                      : '-left-1 border-r-0 border-t-0 border-black/6 bg-[#fcfbf8]'
                  }`}
                />
              ) : null}
              <div className={`mb-2 uppercase opacity-65 ${tone === 'sidebar' ? 'text-[9px] tracking-[0.32em]' : 'text-[10px] tracking-[0.25em]'}`}>
                {isUserMessage ? 'You' : 'ReviewLens'}
              </div>
              <BMarkdownContent content={content} isUserMessage={isUserMessage} />
            </div>
          </motion.div>
        )
      })}
    </AnimatePresence>
    {messages.length === 0 ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={`border border-dashed border-black/10 px-5 text-sm leading-7 text-black/45 ${
          tone === 'sidebar'
            ? 'rounded-[30px] bg-[#fcfbf8] py-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
            : 'rounded-[28px] bg-white py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
        }`}
        initial={{ opacity: 0, y: 16 }}
      >
        Ask for churn signals, recurring complaints, sentiment splits, or an executive summary of business risk and opportunity.
      </motion.div>
    ) : null}
    {isStreaming ? (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={`mr-auto flex items-center gap-3 border border-black/8 px-4 py-3 text-sm text-black/55 ${
          tone === 'sidebar'
            ? 'rounded-[24px] bg-[#fcfbf8] shadow-[0_12px_22px_rgba(18,18,18,0.04)]'
            : 'rounded-[24px] bg-white shadow-[0_10px_24px_rgba(18,18,18,0.06)]'
        }`}
        initial={{ opacity: 0, y: 16 }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
              className="h-2 w-2 rounded-full bg-[#d9e94d]"
              key={dot}
              transition={{ duration: 0.8, delay: dot * 0.12, repeat: Number.POSITIVE_INFINITY }}
            />
          ))}
        </div>
        Streaming insight...
      </motion.div>
    ) : null}
  </div>
)
