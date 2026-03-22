"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FC } from "react";
import type { BTutorialModalProps } from "@/types";

interface TutorialStep {
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

interface TutorialFlowLane {
  readonly key: string;
  readonly title: string;
  readonly nodes: readonly string[];
  readonly accentClassName: string;
}

const kTutorialSteps: readonly TutorialStep[] = [
  {
    label: "01",
    title: "Ingest the review source",
    body: "Paste a Trustpilot business URL and ReviewLens scrapes the latest review pages into a normalized dataset.",
  },
  {
    label: "02",
    title: "Build the auto brief",
    body: "The platform distills pain points, praise themes, urgent flags, ratings, and a concise executive summary.",
  },
  {
    label: "03",
    title: "Interrogate the dataset",
    body: "Use chat to ask grounded follow-up questions. Guardrails keep answers tied to the ingested review evidence.",
  },
  {
    label: "04",
    title: "Share the workspace",
    body: "Export the brief and transcript into a polished PDF for stakeholders, leadership, or handoff.",
  },
] as const;

const kFlowLanes: readonly TutorialFlowLane[] = [
  {
    key: "ingest",
    title: "Ingest lane",
    nodes: ["User", "URL", "Scraper", "Embed", "Store", "Brief"],
    accentClassName: "from-[#f4f2eb] to-white",
  },
  {
    key: "query",
    title: "Query lane",
    nodes: [
      "User",
      "Query",
      "Guardrail1",
      "Embed",
      "VectorSearch",
      "TopK + Query",
      "Gemini",
      "Response",
    ],
    accentClassName: "from-[#f5f3ff] to-white",
  },
] as const;

export const BTutorialModal: FC<BTutorialModalProps> = ({
  isOpen,
  onClose,
}) => (
  <AnimatePresence initial={false}>
    {isOpen ? (
      <>
        <motion.button
          animate={{ opacity: 1 }}
          aria-label="Close tutorial"
          className="fixed inset-0 z-[70] bg-[rgba(16,16,16,0.12)] backdrop-blur-[6px]"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
          type="button"
        />
        <motion.section
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed left-1/2 top-1/2 z-[80] hidden h-[min(84vh,52rem)] w-[min(74rem,calc(100vw-4rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[42px] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#faf8f3_100%)] shadow-[0_38px_110px_rgba(18,18,18,0.16)] xl:block"
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
        >
          <div className="absolute inset-x-8 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.16)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
          <div className="grid h-full grid-cols-[0.95fr_1.05fr]">
            <div className="relative flex min-h-0 flex-col border-r border-black/8 px-8 py-8">
              <div className="absolute inset-y-8 right-0 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.14)_1px,_transparent_1.5px)] bg-[length:1px_10px] bg-repeat-y opacity-70" />
              <div className="max-w-xl">
                <div className="text-[11px] uppercase tracking-[0.36em] text-black/34">
                  Tutorial
                </div>
                <h2 className="mt-3 text-[3.1rem] font-semibold tracking-[-0.05em] leading-[0.95] text-black">
                  How ReviewLens works
                </h2>
                <p className="mt-4 text-[16px] leading-7 text-black/62">
                  A fast analyst workspace for turning public review pages into
                  a brief, a grounded Q&amp;A surface, and a shareable report.
                </p>
              </div>

              <div className="mt-7 grid gap-3">
                {kTutorialSteps.map(({ label, title, body }, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[24px] border border-black/8 bg-white/80 px-4 py-4 shadow-[0_12px_30px_rgba(18,18,18,0.04)]"
                    initial={{ opacity: 0, y: 16 }}
                    key={label}
                    transition={{
                      delay: index * 0.06,
                      duration: 0.24,
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.11)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x opacity-80" />
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/8 bg-[#f3f0ea] font-mono text-[10px] tracking-[0.22em] text-black/46">
                        {label}
                      </div>
                      <div>
                        <div className="text-[17px] font-medium tracking-tight text-black">
                          {title}
                        </div>
                        <p className="mt-1.5 text-[14px] leading-6 text-black/58">
                          {body}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative min-h-0 overflow-hidden px-8 py-8">
              <div className="absolute right-8 top-8">
                <motion.button
                  aria-label="Close tutorial"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-black/8 bg-white/90 text-xl text-black/55 shadow-[0_16px_32px_rgba(18,18,18,0.08)] backdrop-blur"
                  onClick={onClose}
                  type="button"
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ×
                </motion.button>
              </div>

              <div className="text-[11px] uppercase tracking-[0.36em] text-black/34">
                Visual flow
              </div>
              <h3 className="mt-3 max-w-[28rem] text-[2.4rem] font-semibold tracking-[-0.04em] leading-[0.96] text-black">
                From source page to executive-ready output
              </h3>

              <div className="relative mt-6 overflow-hidden rounded-[30px] border border-black/8 bg-[linear-gradient(180deg,#fbfaf7_0%,#f6f2ea_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="absolute inset-x-6 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x opacity-85" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,120,255,0.09),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(232,242,85,0.12),transparent_28%)]" />

                <div className="space-y-4">
                  {kFlowLanes.map(
                    ({ key, title, nodes, accentClassName }, laneIndex) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative overflow-hidden rounded-[24px] border border-black/8 bg-gradient-to-b ${accentClassName} p-4 shadow-[0_14px_30px_rgba(18,18,18,0.05)]`}
                        initial={{ opacity: 0, y: 14 }}
                        key={key}
                        transition={{
                          delay: laneIndex * 0.08,
                          duration: 0.24,
                          ease: "easeOut",
                        }}
                      >
                        <div className="absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.11)_1px,_transparent_1.4px)] bg-[length:8px_1px] bg-repeat-x opacity-75" />
                        <div className="text-[10px] uppercase tracking-[0.28em] text-black/34">
                          {title}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2.5">
                          {nodes.map((node, index) => (
                            <div className="contents" key={`${key}-${node}`}>
                              <motion.div
                                animate={{
                                  opacity: [0.9, 1, 0.9],
                                  y: [0, -2, 0],
                                }}
                                className="rounded-[18px] border border-black/8 bg-white/88 px-3 py-2 text-[13px] font-medium tracking-tight text-black shadow-[0_8px_18px_rgba(18,18,18,0.04)]"
                                transition={{
                                  duration: 2.2,
                                  delay: index * 0.08,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                {node}
                              </motion.div>
                              {index < nodes.length - 1 ? (
                                <motion.div
                                  animate={{
                                    opacity: [0.35, 1, 0.35],
                                    x: [0, 3, 0],
                                  }}
                                  className="text-sm text-black/38"
                                  transition={{
                                    duration: 1.4,
                                    delay: index * 0.06,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                >
                                  →
                                </motion.div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </>
    ) : null}
  </AnimatePresence>
);
