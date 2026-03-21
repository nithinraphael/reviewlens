'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { FC } from 'react'

interface BMarkdownContentProps {
  readonly content: string
  readonly isUserMessage: boolean
}

const getTextTone = (isUserMessage: boolean) => (isUserMessage ? 'text-zinc-950' : 'text-zinc-100')
const getMutedTone = (isUserMessage: boolean) => (isUserMessage ? 'text-zinc-800/80' : 'text-zinc-300')
const getRuleTone = (isUserMessage: boolean) => (isUserMessage ? 'border-zinc-900/10' : 'border-white/10')
const getCodeTone = (isUserMessage: boolean) =>
  isUserMessage ? 'bg-zinc-950/10 text-zinc-950' : 'bg-white/8 text-zinc-100'

export const BMarkdownContent: FC<BMarkdownContentProps> = ({ content, isUserMessage }) => (
  <div className={`markdown-body text-[15px] leading-8 ${getTextTone(isUserMessage)}`}>
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="mt-1 text-2xl font-semibold tracking-tight">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-1 text-xl font-semibold tracking-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-1 text-lg font-semibold tracking-tight">{children}</h3>,
        p: ({ children }) => <p className={`my-3 ${getMutedTone(isUserMessage)}`}>{children}</p>,
        strong: ({ children }) => <strong className={getTextTone(isUserMessage)}>{children}</strong>,
        ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6">{children}</ol>,
        li: ({ children }) => <li className={getMutedTone(isUserMessage)}>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote
            className={`my-4 border-l-2 pl-4 italic ${getRuleTone(isUserMessage)} ${getMutedTone(isUserMessage)}`}
          >
            {children}
          </blockquote>
        ),
        hr: () => <hr className={`my-5 ${getRuleTone(isUserMessage)}`} />,
        code: ({ children, className }) =>
          className ? (
            <code className={`rounded-xl px-1.5 py-1 font-mono text-[13px] ${getCodeTone(isUserMessage)}`}>
              {children}
            </code>
          ) : (
            <code className={`rounded-md px-1.5 py-1 font-mono text-[13px] ${getCodeTone(isUserMessage)}`}>
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre
            className={`my-4 overflow-x-auto rounded-2xl p-4 font-mono text-[13px] leading-6 ${getCodeTone(
              isUserMessage,
            )}`}
          >
            {children}
          </pre>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  </div>
)
