"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Phone, UserRound } from "lucide-react";
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
  const [hasAnswered, setHasAnswered] = useState(answer === "completed");
  const [dragOffset, setDragOffset] = useState(0);
  const completionRef = useRef(false);
  const isComplete = answer === "completed";
  const callerName = question.callerName || "Training caller";

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

  if (!hasAnswered) {
    return (
      <div className="fixed inset-0 z-50 flex h-full w-full overflow-hidden bg-foreground text-background">
        {question.callerPhoto && (
          <MediaImage
            value={question.callerPhoto as MediaValue}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-foreground/55" />

        <div className="relative z-10 flex min-h-full w-full flex-col items-center justify-between px-6 py-10 text-center">
          <div className="space-y-8">
            <p className="text-lg text-background/80">Inkomende oproep...</p>
            <div className="mx-auto flex size-40 items-center justify-center overflow-hidden rounded-full border border-background/80 bg-background/15 shadow-sm">
              {question.callerPhoto ? (
                <MediaImage
                  value={question.callerPhoto as MediaValue}
                  alt={callerName}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-16 text-background/80" />
              )}
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-background">
                {callerName}
              </h2>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
              >
                <ArrowUp className="size-8 text-background/35" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
              >
                <ArrowUp className="size-8 text-background/50" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
              >
                <ArrowUp className="size-8 text-background/75" />
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
                  window.setTimeout(() => setHasAnswered(true), 120);
                  return;
                }
                setDragOffset(0);
              }}
              className="flex size-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg shadow-foreground/30 ring-6 ring-background/15 disabled:opacity-60"
              aria-label="Veeg omhoog om op te nemen"
            >
              <Phone className="size-7" />
            </motion.button>
            <p className="text-xs font-semibold uppercase tracking-wider text-background/60">
              Veeg omhoog om op te nemen
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-black animate-fadeIn">
      {question.postCallVideoUrl ? (
        <MediaVideo
          value={question.postCallVideoUrl as MediaValue}
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          onEnded={completeOnce}
        />
      ) : question.callerPhoto ? (
        <MediaImage
          value={question.callerPhoto as MediaValue}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-foreground text-background">
          <p className="text-xl font-bold">Gesprek beëindigd</p>
          <p className="mt-2 text-sm text-background/60">Even geduld a.u.b....</p>
        </div>
      )}
    </div>
  );
}
