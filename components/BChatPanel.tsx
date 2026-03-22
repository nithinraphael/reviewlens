"use client";

import { motion } from "framer-motion";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { BMessageInput } from "@/components/BMessageInput";
import { BMessageList } from "@/components/BMessageList";
import { normalizeErrorMessage } from "@/lib/errorMessages";
import { useReviewStore } from "@/store/reviewStore";
import type { BChatPanelProps } from "@/types";

export const BChatPanel: FC<BChatPanelProps> = ({ isSidebar = false }) => {
  const reviews = useReviewStore((state) => state.reviews);
  const setChatMessages = useReviewStore((state) => state.setChatMessages);
  const messageViewportRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    setChatMessages(messages);
  }, [messages, setChatMessages]);

  useEffect(() => {
    const viewport = messageViewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages, status]);

  const isDisabled = status !== "ready" || reviews.length === 0;

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isDisabled) return;

    void sendMessage(
      { text: trimmedInput },
      {
        body: {
          mode: "analyst",
          reviews,
        },
      },
    );
    setInput("");
  };

  if (isSidebar) {
    return (
      <motion.section
        className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[40px] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fcfaf6_100%)] p-6 shadow-[0_28px_90px_rgba(18,18,18,0.10)]"
        transition={{ duration: 0.28, ease: "easeOut" }}
        whileHover={{ y: -1 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_42%)] opacity-80" />
        <div className="absolute left-8 right-8 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />

        <div className="relative mb-5 shrink-0 pr-16">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-black/30">
                Conversation
              </p>
              <h2 className="mt-2 text-[40px] font-semibold tracking-[-0.04em] text-black">
                Ask the dataset
              </h2>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="rounded-full border border-black/8 bg-white/80 px-4 py-2 text-[13px] text-black/55 backdrop-blur">
                {reviews.length} reviews
              </div>
              <motion.div
                animate={
                  status === "streaming" || status === "submitted"
                    ? { opacity: [0.5, 1, 0.5] }
                    : { opacity: 1 }
                }
                className="rounded-full border border-black/8 bg-[#f6f3ec] px-4 py-2 text-[13px] capitalize text-black/68"
                transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
              >
                {reviews.length === 0 ? "waiting" : status}
              </motion.div>
            </div>
          </div>
          <div className="mt-5 h-px w-48 bg-[radial-gradient(circle,_rgba(18,18,18,0.16)_1px,_transparent_1.5px)] bg-[length:10px_1px] bg-repeat-x" />
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[34px] border border-black/8 bg-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm">
          <div className="absolute inset-y-8 right-6 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.08)_1px,_transparent_1.5px)] bg-[length:1px_10px] bg-repeat-y opacity-75" />
          <div className="flex h-full min-h-0 flex-col">
            <div
              className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pr-5"
              ref={messageViewportRef}
            >
              <BMessageList
                isCompact
                isStreaming={status === "streaming" || status === "submitted"}
                messages={messages}
                tone="sidebar"
              />
            </div>
            {error ? (
              <p className="mx-6 mb-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
                {normalizeErrorMessage(error.message)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 shrink-0">
          <BMessageInput
            input={input}
            isDisabled={isDisabled}
            isMinimal
            onChange={setInput}
            onSubmit={handleSubmit}
          />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[38px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(25,25,25,0.04)] ${
        isSidebar ? "lg:p-6" : "lg:p-8"
      }`}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_40%)] opacity-70" />
      <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.15)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
      <div
        className={`mb-6 flex shrink-0 flex-col gap-4 ${isSidebar ? "" : "xl:flex-row xl:items-center xl:justify-between"}`}
      >
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-black/35">
            Conversation
          </p>
          <h2
            className={`mt-1 font-semibold tracking-tight text-black ${isSidebar ? "text-3xl" : "text-4xl"}`}
          >
            Ask the dataset
          </h2>
          <div className="mt-4 h-px w-48 bg-[radial-gradient(circle,_rgba(18,18,18,0.18)_1px,_transparent_1.5px)] bg-[length:10px_1px] bg-repeat-x" />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <motion.div
            className="rounded-[20px] border border-black/8 bg-[#f5f3eb] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            whileHover={{ y: -1 }}
          >
            {reviews.length} reviews loaded
          </motion.div>
          <motion.div
            animate={
              status === "streaming" || status === "submitted"
                ? { opacity: [0.5, 1, 0.5] }
                : { opacity: 1 }
            }
            className="rounded-[20px] border border-black/8 bg-[#f5f3eb] px-4 py-2 capitalize shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }}
            whileHover={{ y: -1 }}
          >
            {reviews.length === 0 ? "waiting" : status}
          </motion.div>
        </div>
      </div>

      <div className="min-h-0 flex-1 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <motion.div
          className="relative flex min-h-0 flex-col overflow-hidden rounded-[32px] border border-black/8 bg-[#fbfaf7] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
          transition={{ duration: 0.24, ease: "easeOut" }}
          whileHover={{ y: -1 }}
        >
          <div className="absolute inset-y-5 right-5 w-px bg-[radial-gradient(circle,_rgba(18,18,18,0.12)_1px,_transparent_1.5px)] bg-[length:1px_10px] bg-repeat-y opacity-75" />
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <BMessageList
              isCompact={isSidebar}
              isStreaming={status === "streaming" || status === "submitted"}
              messages={messages}
            />
          </div>
          {error ? (
            <p className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
              {normalizeErrorMessage(error.message)}
            </p>
          ) : null}
          <div className="mt-5">
            <BMessageInput
              input={input}
              isDisabled={isDisabled}
              onChange={setInput}
              onSubmit={handleSubmit}
            />
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-black/8 bg-[#f8f6f1] p-5 shadow-[0_10px_28px_rgba(18,18,18,0.04)]"
            transition={{ duration: 0.24, ease: "easeOut" }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
            <div className="text-sm uppercase tracking-[0.24em] text-black/38">
              Suggested prompts
            </div>
            <div className="mt-4 space-y-3">
              {[
                "What are the top recurring complaints?",
                "Summarize the key findings from these reviews.",
                "Which praise themes appear most often?",
                "Are there any legal or safety red flags?",
              ].map((item) => (
                <motion.button
                  className="relative w-full rounded-[24px] border border-black/8 bg-white px-4 py-3 text-left text-[15px] text-black/70 shadow-[0_8px_22px_rgba(18,18,18,0.04)] transition hover:border-black/18 hover:bg-[#fbfaf7]"
                  key={item}
                  onClick={() => setInput(item)}
                  type="button"
                  whileHover={{ x: 4, y: -1 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <span className="absolute inset-x-4 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.1)_1px,_transparent_1.5px)] bg-[length:8px_1px] bg-repeat-x opacity-75" />
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[32px] border border-black/8 bg-[#f8f6f1] p-5 shadow-[0_10px_28px_rgba(18,18,18,0.04)]"
            transition={{ duration: 0.24, ease: "easeOut" }}
            whileHover={{ y: -2 }}
          >
            <div className="absolute left-0 right-0 top-0 h-px bg-[radial-gradient(circle,_rgba(18,18,18,0.13)_1px,_transparent_1.5px)] bg-[length:9px_1px] bg-repeat-x" />
            <div className="text-sm uppercase tracking-[0.24em] text-black/38">
              Assistant behavior
            </div>
            <div className="mt-4 text-[16px] leading-8 text-black/68">
              Analyst mode stays closer to evidence, patterns, and review-level
              observations.
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
