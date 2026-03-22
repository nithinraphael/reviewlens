"use client";

import { motion } from "framer-motion";
import type { FC } from "react";
import { useState } from "react";
import { BStatPulse } from "@/components/BStatPulse";
import type { BBriefPanelProps, TrustpilotReview } from "@/types";

type ChartTab = "all" | "positive" | "service" | "risk";

interface ChartDatum {
  readonly label: string;
  readonly value: number;
}

const kChartTabs: readonly { readonly id: ChartTab; readonly label: string }[] =
  [
    { id: "all", label: "All ratings" },
    { id: "positive", label: "Positive ratings" },
    { id: "service", label: "Customer service" },
    { id: "risk", label: "Risk flags" },
  ];

const kServiceKeywords = [
  "service",
  "support",
  "agent",
  "helpful",
  "staff",
  "team",
  "representative",
  "customer care",
] as const;

const kRiskKeywords = [
  "refund",
  "cancel",
  "charge",
  "fraud",
  "claim",
  "complaint",
  "delay",
  "billing",
  "problem",
  "issue",
  "legal",
  "unsafe",
] as const;

const countRatings = (reviews: readonly TrustpilotReview[]) => {
  const counts = new Map<number, number>([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ]);

  reviews.forEach(({ rating }) => {
    const roundedRating = Math.max(1, Math.min(5, Math.round(rating)));
    counts.set(roundedRating, (counts.get(roundedRating) ?? 0) + 1);
  });

  return [1, 2, 3, 4, 5].map((rating) => ({
    label: `${rating} star`,
    value: counts.get(rating) ?? 0,
  }));
};

const matchesKeywordGroup = (
  review: TrustpilotReview,
  keywords: readonly string[],
) => {
  const text = `${review.title} ${review.body}`.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
};

const getChartData = (
  tab: ChartTab,
  reviews: readonly TrustpilotReview[],
): readonly ChartDatum[] => {
  if (tab === "positive") {
    return [
      {
        label: "4 star",
        value: reviews.filter(({ rating }) => Math.round(rating) === 4).length,
      },
      {
        label: "5 star",
        value: reviews.filter(({ rating }) => Math.round(rating) === 5).length,
      },
    ];
  }

  if (tab === "service") {
    const filteredReviews = reviews.filter((review) =>
      matchesKeywordGroup(review, kServiceKeywords),
    );
    return countRatings(filteredReviews);
  }

  if (tab === "risk") {
    const filteredReviews = reviews.filter((review) =>
      matchesKeywordGroup(review, kRiskKeywords),
    );
    return countRatings(filteredReviews);
  }

  return countRatings(reviews);
};

const getBarHeight = (value: number, maxValue: number) => {
  if (maxValue === 0) return 6;
  return Math.max(6, Math.round((value / maxValue) * 100));
};

const getInsightLine = (tab: ChartTab, data: readonly ChartDatum[]) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (tab === "positive") return `${total} reviews landed at 4 or 5 stars.`;
  if (tab === "service")
    return `${total} reviews explicitly mention service-related interactions.`;
  if (tab === "risk")
    return `${total} reviews include risk-oriented language such as claims, delays, refunds, or billing issues.`;
  return `${total} total reviews distributed across the 1-to-5-star scale.`;
};

const getTopBucket = (data: readonly ChartDatum[]) =>
  data.reduce(
    (current, item) => (item.value > current.value ? item : current),
    data[0] ?? { label: "N/A", value: 0 },
  );

const toReadableTheme = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (firstChar) => firstChar.toUpperCase());

export const BBriefPanel: FC<BBriefPanelProps> = ({
  brief,
  reviews,
  onSeeAllReviews,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>("all");

  const chartData = getChartData(activeTab, reviews);
  const maxValue = Math.max(...chartData.map(({ value }) => value), 0);
  const topBucket = getTopBucket(chartData);
  const urgentFlagCount = brief.urgentFlags.length;
  const topPainPoints = brief.painPoints.slice(0, 3);
  const topPraiseThemes = brief.praiseThemes.slice(0, 3);

  return (
    <section className="space-y-5">
      {/* ── Overview card ── */}
      <div className="relative overflow-hidden rounded-[38px] border border-black/[0.07] bg-white p-6 shadow-[0_2px_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.05)] lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.9),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(18,18,18,0.10)_30%,rgba(18,18,18,0.10)_70%,transparent)]" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-black/35">
              Overview
            </p>
            <h2 className="mt-2 text-[2.4rem] font-semibold tracking-[-0.04em] leading-[1] text-black">
              Review performance
            </h2>
            <div className="mt-3.5 h-px w-40 bg-[linear-gradient(90deg,rgba(18,18,18,0.15),transparent)]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <BStatPulse
              label="Average rating"
              tone="accent"
              value={brief.averageRating}
            />
            <BStatPulse label="Reviews" value={brief.reviewCount} />
            <BStatPulse
              label="Urgent flags"
              tone={urgentFlagCount > 0 ? "alert" : "default"}
              value={urgentFlagCount}
            />
          </div>
        </div>

        <div className="relative mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
          {/* Chart */}
          <div className="h-fit self-start overflow-hidden rounded-[28px] border border-black/[0.07] bg-[#fafaf8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            {/* Tab row */}
            <div className="mb-5 flex flex-wrap gap-1 rounded-[18px] border border-black/[0.07] bg-white/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {kChartTabs.map(({ id, label }) => (
                <motion.button
                  className={`relative flex-1 rounded-[14px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    id === activeTab
                      ? "bg-[#121212] text-white shadow-[0_4px_12px_rgba(18,18,18,0.20)]"
                      : "text-black/50 hover:text-black/75"
                  }`}
                  key={id}
                  onClick={() => setActiveTab(id)}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Top bucket badge */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[13px] text-black/45">
                Sentiment breakdown — {activeTab}
              </p>
              <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[12px] font-medium text-black/60 shadow-[0_2px_8px_rgba(18,18,18,0.06)]">
                Top: {topBucket.label} ({topBucket.value})
              </span>
            </div>

            {/* Bars */}
            <div
              className={`grid h-[220px] items-end gap-3 ${chartData.length <= 2 ? "grid-cols-2" : "grid-cols-5"}`}
            >
              {chartData.map(({ label, value }, index) => (
                <div
                  className="flex h-full flex-col items-center justify-end gap-2"
                  key={label}
                >
                  <span className="font-mono text-[12px] font-medium text-black/50">
                    {value}
                  </span>
                  <motion.div
                    animate={{
                      height: `${getBarHeight(value, maxValue)}%`,
                      opacity: 1,
                    }}
                    className="relative w-full overflow-hidden rounded-t-[16px] bg-[linear-gradient(180deg,#e6f35c_0%,#ccd642_100%)] shadow-[0_8px_20px_rgba(214,225,79,0.30)]"
                    initial={{ height: "6%", opacity: 0 }}
                    transition={{
                      delay: index * 0.045,
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    whileHover={{ scaleX: 1.05 }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[40%] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)]" />
                  </motion.div>
                  <span className="text-center text-[11px] text-black/45">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Insight line */}
            <div className="mt-4 rounded-[18px] border border-black/[0.07] bg-white px-4 py-3 text-[14px] leading-6 text-black/55 shadow-[0_2px_8px_rgba(18,18,18,0.04)]">
              {getInsightLine(activeTab, chartData)}
            </div>
          </div>

          {/* Executive summary + pain/praise */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 overflow-hidden rounded-[28px] border border-black/[0.07] bg-[#fafaf8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-black/35">
                Executive summary
              </p>
              <p className="mt-3 text-[15px] leading-[1.75] text-black/68">
                {brief.summary}
              </p>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-[#fafaf8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-black/35">
                Top issues to fix
              </p>
              <ul className="mt-3 space-y-2.5 text-[14px] leading-[1.65] text-black/64">
                {(topPainPoints.length > 0
                  ? topPainPoints
                  : ["No recurring issue identified yet"]
                ).map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#b84b2f]" />
                    <span>{toReadableTheme(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-[#fafaf8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-black/35">
                What customers value
              </p>
              <ul className="mt-3 space-y-2.5 text-[14px] leading-[1.65] text-black/64">
                {(topPraiseThemes.length > 0
                  ? topPraiseThemes
                  : ["No recurring strength identified yet"]
                ).map((item) => (
                  <li className="flex items-start gap-2" key={item}>
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#4d7f2f]" />
                    <span>{toReadableTheme(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Theme table + Risk summary ── */}
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        {/* Theme table */}
        <div className="relative overflow-hidden rounded-[38px] border border-black/[0.07] bg-white p-6 shadow-[0_2px_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.05)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.9),transparent_55%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(18,18,18,0.10)_30%,rgba(18,18,18,0.10)_70%,transparent)]" />
          <div className="relative flex items-center justify-between gap-3">
            <h3 className="text-[1.6rem] font-semibold tracking-tight text-black">
              Themes at a glance
            </h3>
            <span className="rounded-full bg-[#e8f255] px-3.5 py-1 text-[13px] font-semibold shadow-[0_4px_14px_rgba(232,242,85,0.32)]">
              {brief.reviewCount}
            </span>
          </div>
          <div className="relative mt-5 overflow-hidden rounded-[22px] border border-black/[0.07]">
            <div className="grid grid-cols-[1.1fr_1.2fr_0.55fr] border-b border-black/[0.07] bg-[#f8f6f1] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-black/40">
              <div>Theme from reviews</div>
              <div>Why it matters</div>
              <div>Action</div>
            </div>
            {[...topPraiseThemes, ...topPainPoints]
              .slice(0, 6)
              .map((item, index) => {
                const isPositive = index < topPraiseThemes.length;
                return (
                  <motion.div
                    className={`grid grid-cols-[1.1fr_1.2fr_0.55fr] border-t border-black/[0.06] px-5 py-3.5 text-[14px] transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-[#fcfbf9]"
                    } hover:bg-[#f7f5f0]`}
                    key={item}
                    whileHover={{ x: 2 }}
                  >
                    <div className="font-medium text-black pr-4">
                      {toReadableTheme(item)}
                    </div>
                    <div className="text-black/55 pr-4">
                      {isPositive
                        ? `${toReadableTheme(item)} appears repeatedly as a positive experience. Keep this consistent and reinforce it in customer messaging.`
                        : `${toReadableTheme(item)} appears repeatedly as a source of friction. Assign an owner, investigate root cause, and prioritize fixes.`}
                    </div>
                    <div>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[12px] font-medium ${
                          isPositive
                            ? "bg-[#e8f5d4] text-[#3d6b1a]"
                            : "bg-[#fde8e2] text-[#8b3c27]"
                        }`}
                      >
                        {isPositive ? "Keep strong" : "Fix first"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Risk summary */}
        <div className="relative overflow-hidden rounded-[38px] border border-black/[0.07] bg-white p-6 shadow-[0_2px_1px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.05)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.9),transparent_55%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(18,18,18,0.10)_30%,rgba(18,18,18,0.10)_70%,transparent)]" />
          <div className="relative flex items-center justify-between gap-3">
            <h3 className="text-[1.6rem] font-semibold tracking-tight text-black">
              Risk summary
            </h3>
            <motion.button
              className="rounded-[16px] border border-black/10 bg-[#f8f6f1] px-4 py-2 text-[13px] font-medium text-black/65 shadow-[0_2px_8px_rgba(18,18,18,0.05)] transition hover:bg-[#121212] hover:text-white"
              onClick={onSeeAllReviews}
              type="button"
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              See all
            </motion.button>
          </div>

          <div className="relative mt-6">
            <div className="text-[4.5rem] font-semibold tracking-[-0.06em] leading-none text-black">
              {brief.averageRating.toFixed(1)}
            </div>
            <p className="mt-2 text-[13px] text-black/40 font-medium uppercase tracking-[0.22em]">
              Average rating
            </p>
          </div>

          <motion.div
            className="relative mt-6 overflow-hidden rounded-[24px] border border-[#cfd94a] bg-[linear-gradient(135deg,#eef257_0%,#e2e84a_100%)] p-5 shadow-[0_8px_24px_rgba(214,225,79,0.30)]"
            whileHover={{ y: -2, scale: 1.01 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,transparent_50%)]" />
            <div className="relative text-[2.6rem] font-semibold tracking-[-0.05em] leading-none">
              {topBucket.value}
            </div>
            <div className="relative mt-2 text-[13px] text-black/60">
              Reviews in the strongest visible segment
            </div>
          </motion.div>

          <div className="mt-5 space-y-2.5">
            {(brief.urgentFlags.length > 0
              ? brief.urgentFlags
              : ["No urgent flags detected"]
            ).map((flag) => (
              <motion.div
                className="rounded-[18px] border border-black/[0.07] bg-[#fafaf8] px-4 py-3 text-[14px] text-black/60 shadow-[0_2px_8px_rgba(18,18,18,0.04)]"
                key={flag}
                whileHover={{ x: 3 }}
              >
                {flag}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
