"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Phone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleQuestion } from "@/lib/types/module.type";
import type { AnswerValue, MediaValue } from "./types";
import { MediaImage, MediaVideo } from "./media";

export function SimulatedCallQuestion({
  question,
  answer,
  disabled,
  onComplete,
}: {
  question: ModuleQuestion;
  answer: AnswerValue | null;
  disabled: boolean;
  onComplete: () => void;
}) {
  const [localAnswered, setLocalAnswered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const completionRef = useRef(false);
  const isComplete = answer === "completed";
  const hasAnswered = isComplete || localAnswered;
  const callerName = question.callerName || "Inkomende beller";

  const completeOnce = useCallback(() => {
    if (disabled || isComplete || completionRef.current) return;
    completionRef.current = true;
    onComplete();
  }, [disabled, isComplete, onComplete]);

  useEffect(() => {
    if (
      !hasAnswered ||
      disabled ||
      isComplete ||
      question.postCallVideoUrl
    ) {
      return;
    }

    const timer = window.setTimeout(
      completeOnce,
      question.callerPhoto ? 3000 : 2000,
    );

    return () => window.clearTimeout(timer);
  }, [
    completeOnce,
    disabled,
    hasAnswered,
    isComplete,
    question.callerPhoto,
    question.postCallVideoUrl,
  ]);

  return (
    <div className="absolute inset-0 z-20 flex h-full w-full flex-col overflow-hidden bg-black text-white">
      {/* Pre-mount & preload post-call video in background so it's buffered when user answers */}
      {question.postCallVideoUrl && (
        <div
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-300",
            hasAnswered ? "z-20 opacity-100" : "pointer-events-none -z-10 opacity-0",
          )}
        >
          <MediaVideo
            value={question.postCallVideoUrl as MediaValue}
            autoPlay={hasAnswered}
            className="size-full object-cover"
            onEnded={completeOnce}
          />
        </div>
      )}

      {/* Answered View when no video (caller photo or text message) */}
      {hasAnswered && !question.postCallVideoUrl && (
        <div className="relative z-20 flex size-full flex-col items-center justify-center bg-black animate-fadeIn">
          {question.callerPhoto ? (
            <MediaImage
              value={question.callerPhoto as MediaValue}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-black text-white">
              <p className="text-xl font-bold">
                {question.postCallMessage || "Gesprek beëindigd"}
              </p>
              <p className="mt-2 text-sm text-white/60">Even geduld a.u.b....</p>
            </div>
          )}
        </div>
      )}

      {/* Ringing / Incoming Call View */}
      {!hasAnswered && (
        <>
          {question.callerPhoto && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <MediaImage
                value={question.callerPhoto as MediaValue}
                alt=""
                className="size-full scale-110 object-cover blur-sm"
              />
              <div className="absolute inset-0 bg-black/45 backdrop-blur-md" />
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/75" />
            </div>
          )}

          <div className="relative z-10 flex min-h-full w-full flex-col items-center justify-between px-6 py-12 text-center">
            <div className="space-y-6 pt-4">
              <p className="text-base font-medium text-white/70">Inkomende oproep...</p>
              <div className="mx-auto flex size-36 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/10 shadow-lg ring-4 ring-white/5">
                {question.callerPhoto ? (
                  <MediaImage
                    value={question.callerPhoto as MediaValue}
                    alt={callerName}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-16 text-white/80" />
                )}
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
                  {callerName}
                </h2>
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 pb-4">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                >
                  <ArrowUp className="size-7 text-white/30" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                >
                  <ArrowUp className="size-7 text-white/50" />
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                >
                  <ArrowUp className="size-7 text-white/80" />
                </motion.div>
              </div>
              <motion.button
                type="button"
                disabled={disabled}
                drag="y"
                dragConstraints={{ top: -120, bottom: 0 }}
                dragElastic={0.08}
                animate={{ y: dragOffset }}
                whileTap={{ scale: disabled ? 1 : 0.96 }}
                onDrag={(_, info) => setDragOffset(Math.min(0, info.offset.y))}
                onDragEnd={(_, info) => {
                  if (disabled) return;
                  if (info.offset.y < -72) {
                    setDragOffset(-120);
                    window.setTimeout(() => setLocalAnswered(true), 120);
                    return;
                  }
                  setDragOffset(0);
                }}
                className="flex size-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg shadow-black/40 ring-4 ring-white/20 disabled:opacity-60"
                aria-label="Veeg omhoog om op te nemen"
              >
                <Phone className="size-7" />
              </motion.button>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Veeg omhoog om op te nemen
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
