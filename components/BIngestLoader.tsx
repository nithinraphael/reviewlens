"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FC } from "react";
import { useEffect, useState } from "react";
import type { BIngestLoaderProps } from "@/types";

const kSteps = [
  "Connecting to the Trustpilot page",
  "Collecting recent customer feedback",
  "Composing the analyst brief",
] as const;

const kPulseHeights = ["h-5", "h-10", "h-7", "h-12", "h-6"] as const;

const kSignalChips = [
  "delivery lag",
  "helpful support",
  "refund friction",
  "trust signal",
] as const;

const kTransition = { duration: 0.32, ease: "easeOut" } as const;

export const BIngestLoader: FC<BIngestLoaderProps> = ({
  isVisible,
  hasReviews,
}) => {
  return (
    <AnimatePresence>
      {isVisible ? <BIngestLoaderCard hasReviews={hasReviews} /> : null}
    </AnimatePresence>
  );
};

const BIngestLoaderCard: FC<Pick<BIngestLoaderProps, "hasReviews">> = ({
  hasReviews,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1050);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeStep = hasReviews ? 2 : Math.min(1, elapsed);
  const activeStepLabel = kSteps[activeStep];

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(201,219,47,0.18),transparent_40%),rgba(17,17,17,0.45)] p-5 backdrop-blur-xl"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={kTransition}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-[linear-gradient(150deg,rgba(255,255,255,0.95)_0%,rgba(251,250,246,0.88)_100%)] p-5 shadow-[0_28px_80px_rgba(6,7,8,0.34)] md:p-7"
        exit={{ opacity: 0, scale: 0.98, y: 14 }}
        initial={{ opacity: 0, scale: 0.94, y: 22 }}
        transition={kTransition}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,219,47,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,201,133,0.2),transparent_30%)]" />

        <div className="relative flex items-start gap-4">
          <div className="relative h-11 w-11 shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute inset-0 rounded-full border border-[#beca45]"
              transition={{
                duration: 4.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              className="absolute inset-1.5 rounded-full border border-dashed border-black/20"
              transition={{
                duration: 5.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.6, 1, 0.6] }}
              className="absolute inset-3 rounded-full bg-[#dec53f] shadow-[0_0_24px_rgba(222,197,63,0.45)]"
              transition={{
                duration: 1.6,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#96873f]">
              Analyzing
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold leading-[1.04] tracking-tight text-black md:text-[2rem]">
              Building your review intelligence brief
            </h2>
            <p className="mt-2.5 text-base leading-7 text-black/65">
              Distilling raw customer feedback into patterns, risks, and
              executive-ready insight.
            </p>
          </div>
        </div>

        <div className="relative mt-7 grid gap-4 rounded-2xl border border-black/10 bg-[linear-gradient(165deg,#fffef8_0%,#f4efe3_100%)] p-4 pb-16 md:grid-cols-[1.04fr_auto_1.04fr] md:items-center md:pb-4">
          <motion.div
            animate={{ y: [0, -3, 0], rotate: [0, -0.5, 0] }}
            className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-4.5"
            transition={{
              duration: 3.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{ x: ["-120%", "180%"] }}
              className="pointer-events-none absolute inset-y-0 w-12 bg-linear-to-r from-transparent via-[#f5f7cf]/80 to-transparent"
              transition={{
                duration: 1.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <div className="text-[11px] uppercase tracking-[0.24em] text-black/35">
              Source page
            </div>
            <div className="mt-3.5 space-y-3">
              {[0, 1, 2].map((row) => (
                <motion.div
                  animate={{ x: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
                  className="rounded-xl border border-black/10 bg-[#faf8f3] p-3.5"
                  key={`source-row-${row}`}
                  transition={{
                    duration: 1.8,
                    delay: row * 0.12,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  <div className="h-2.5 w-20 rounded-full bg-black/13" />
                  <div className="mt-2 h-2.5 w-full rounded-full bg-black/11" />
                  <div className="mt-2 h-2.5 w-4/5 rounded-full bg-black/8" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ x: [0, 10, 0] }}
            className="hidden items-center gap-1 md:flex"
            transition={{
              duration: 1.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {[0, 1, 2].map((dot) => (
              <motion.span
                animate={{
                  opacity: [0.25, 1, 0.25],
                  scale: [0.85, 1.15, 0.85],
                }}
                className="h-2.5 w-2.5 rounded-full bg-[#ceb53f]"
                key={`flow-dot-${dot}`}
                transition={{
                  duration: 1,
                  delay: dot * 0.1,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            ))}
            <span className="text-black/30">→</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 4, 0], rotate: [0, 0.45, 0] }}
            className="rounded-2xl border border-black/10 bg-[linear-gradient(170deg,#111111_0%,#1f2023_100%)] p-4.5 text-white shadow-[0_14px_36px_rgba(17,17,17,0.28)]"
            transition={{
              duration: 3.7,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  Signal engine
                </div>
                <div className="mt-1.5 text-3xl font-semibold tracking-tight">
                  Analyst brief
                </div>
              </div>
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/72">
                assembling
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[11px] uppercase tracking-[0.17em] text-white/35">
                  Review pulse
                </div>
                <div className="mt-3 flex h-16 items-end gap-1.5">
                  {kPulseHeights.map((heightClass, index) => (
                    <motion.div
                      animate={{ scaleY: [0.86, 1.2, 0.86] }}
                      className={`w-full origin-bottom rounded-full bg-linear-to-b from-[#f2f4c7] to-[#cad74f] ${heightClass}`}
                      key={`${heightClass}-${index}`}
                      transition={{
                        duration: 1.6,
                        delay: index * 0.08,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.17em] text-white/35">
                    Theme extraction
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {kSignalChips.map((chip) => (
                      <span
                        className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/76"
                        key={chip}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.div
                  animate={{ opacity: [0.65, 1, 0.65] }}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                  transition={{
                    duration: 2.4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <div className="text-[11px] uppercase tracking-[0.17em] text-white/35">
                    Narrative draft
                  </div>
                  <div className="mt-2.5 h-2.5 w-36 rounded-full bg-white/20" />
                  <div className="mt-2 h-2.5 w-full rounded-full bg-white/14" />
                  <div className="mt-2 h-2.5 w-4/5 rounded-full bg-white/11" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: [0.78, 1, 0.78] }}
            className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl border border-black/10 bg-white/88 px-3.5 py-2.5 backdrop-blur-sm md:hidden"
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <span className="rounded-full border border-[#bba146]/45 bg-[#efe3b6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7d6a24]">
              Step {activeStep + 1} of {kSteps.length}
            </span>
            <span className="ml-2 truncate text-xs font-medium text-black/72">
              {activeStepLabel}
            </span>
          </motion.div>

          <motion.div
            animate={{ opacity: [0.82, 1, 0.82] }}
            className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-full border border-black/10 bg-white/88 px-3.5 py-2 backdrop-blur-sm md:flex"
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <span className="rounded-full border border-[#bba146]/45 bg-[#efe3b6] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7d6a24]">
              {activeStep + 1}/{kSteps.length}
            </span>
            <span className="text-xs font-medium text-black/72">
              {activeStepLabel}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
