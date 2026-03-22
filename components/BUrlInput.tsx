"use client";

import { motion } from "framer-motion";
import type { ChangeEvent, FC, FormEvent } from "react";
import { useState } from "react";
import { useReviewIngest } from "@/hooks/useReviewIngest";
import { useReviewStore } from "@/store/reviewStore";

const isUrlValid = (value: string) => value.includes("trustpilot.com/review/");

export const BUrlInput: FC = () => {
  const storedUrl = useReviewStore((state) => state.url);
  const [url, setUrl] = useState(storedUrl);
  const { ingest, isLoading, error } = useReviewIngest();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUrl = url.trim();
    if (!isUrlValid(trimmedUrl)) {
      useReviewStore
        .getState()
        .setError("Enter a Trustpilot business review URL");
      return;
    }

    void ingest(trimmedUrl);
  };

  return (
    <form className="w-full max-w-2xl" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <motion.div
          className="group relative flex-1 rounded-[32px] p-[1.5px]"
          transition={{ duration: 0.22, ease: "easeOut" }}
          whileFocus={{ y: -1 }}
          whileHover={{ y: -1 }}
        >
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "140% 50%", "0% 50%"],
              opacity: [0.78, 1, 0.78],
            }}
            className="pointer-events-none absolute inset-0 rounded-[32px] bg-[linear-gradient(110deg,rgba(20,20,20,0.92)_0%,rgba(20,20,20,0.92)_28%,rgba(112,112,112,0.98)_42%,rgba(245,245,245,0.95)_50%,rgba(112,112,112,0.98)_58%,rgba(20,20,20,0.92)_72%,rgba(20,20,20,0.92)_100%)] bg-[length:260%_260%] shadow-[0_12px_26px_rgba(18,18,18,0.14)]"
            transition={{
              duration: 2.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
          <motion.div
            animate={{
              opacity: [0.12, 0.2, 0.12],
              scale: [0.996, 1.004, 0.996],
            }}
            className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_left,rgba(18,18,18,0.24),transparent_38%),radial-gradient(circle_at_right,rgba(64,64,64,0.18),transparent_34%)] blur-md"
            transition={{
              duration: 2.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <div className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-black/35 transition-colors duration-200">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>
          <div className="pointer-events-none absolute inset-[1.5px] rounded-[30px] bg-[radial-gradient(circle_at_left,rgba(232,242,85,0.24),transparent_34%)] opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
          <input
            className="relative z-10 h-14 w-full rounded-[30px] border border-black/8 bg-[#f3f0ea] pl-14 pr-5 text-[17px] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition-[border-color,box-shadow,transform,background-color] duration-250 placeholder:text-black/38 focus:border-black/20 focus:shadow-[0_10px_30px_rgba(18,18,18,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]"
            onChange={handleChange}
            placeholder="Paste a Trustpilot URL here"
            value={url}
          />
        </motion.div>
        <motion.button
          className="group relative h-14 overflow-hidden rounded-[28px] border border-black/8 bg-white px-6 text-[15px] font-medium text-black shadow-[0_8px_22px_rgba(0,0,0,0.06)] transition-[box-shadow,background-color,border-color] duration-300 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isLoading}
          type="submit"
          whileHover={isLoading ? undefined : { y: -2, scale: 1.01 }}
          whileTap={isLoading ? undefined : { scale: 0.98 }}
        >
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.7)_28%,transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {isLoading ? "Loading..." : "Run analysis"}
        </motion.button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </form>
  );
};
