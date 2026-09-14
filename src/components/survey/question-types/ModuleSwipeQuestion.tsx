"use client";

import { useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Check, X } from "lucide-react";
import { RichQuestionContent } from "@/components/ui/custom/RichQuestionContent";
import { cn } from "@/lib/utils";
import { hasQuestionContent } from "@/lib/question-content";
import type { ModuleQuestion } from "@/lib/types/module.type";
import { MediaImage } from "../module-runner/media";
import type { MediaValue } from "../module-runner/types";

export function ModuleSwipeQuestion({
  question,
  disabled,
  onSwipe,
  currentIndex,
  totalQuestions,
}: {
  question: ModuleQuestion;
  disabled: boolean;
  onSwipe: (direction: "left" | "right") => void;
  currentIndex?: number;
  totalQuestions?: number;
}) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [hasSwiped, setHasSwiped] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isDisabled = disabled || hasSwiped;
  const hasContent = hasQuestionContent(question.content);
  const rotate = useTransform(x, [-220, 220], [-8, 8]);
  const overlayColor = useTransform(
    x,
    [-160, 0, 160],
    [
      "rgba(239, 68, 68, 0.35)",
      "rgba(255, 255, 255, 0)",
      "rgba(34, 197, 94, 0.35)",
    ],
  );

  const blockColor = /^#[0-9A-Fa-f]{6}$/.test(question.blockColor || "")
    ? question.blockColor
    : undefined;

  const submitSwipe = async (direction: "left" | "right") => {
    if (isDisabled) return;

    setHasSwiped(true);

    await controls.start({
      x: direction === "right" ? 360 : -360,
      rotate: direction === "right" ? 8 : -8,
      opacity: 0,
      transition: { duration: 0.22, ease: "easeOut" },
    });

    setIsDismissed(true);
    onSwipe(direction);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const projectedOffset = info.offset.x + info.velocity.x * 0.08;

    if (projectedOffset > 90) {
      void submitSwipe("right");
    } else if (projectedOffset < -90) {
      void submitSwipe("left");
    } else {
      void controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 420, damping: 32 },
      });
    }
  };

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-full grow shrink-0 flex-col overflow-x-hidden",
        isDismissed && "invisible pointer-events-none",
      )}
      aria-hidden={isDismissed || undefined}
    >
      <motion.div
        drag={isDisabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.35}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{
          x,
          rotate,
          touchAction: "pan-y",
          backgroundColor: blockColor,
        }}
        animate={controls}
        className={cn(
          "relative z-10 w-full max-w-full cursor-grab overflow-hidden rounded-[28px] border border-black/10 shadow-lg shadow-black/5 will-change-transform active:cursor-grabbing dark:border-white/15",
          !blockColor && "bg-card text-card-foreground",
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          style={{ backgroundColor: overlayColor }}
        />
        {!question.image ? (
          /* Text-only swipe card */
          <div className="relative z-10 flex min-h-[380px] w-full flex-col justify-between p-6 sm:min-h-[420px] sm:p-8">
            {/* Card Top Label */}
            <div className="flex w-full items-center justify-between pb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {currentIndex !== undefined && totalQuestions !== undefined
                  ? `Vraag ${currentIndex + 1} van ${totalQuestions}`
                  : question.type}
              </span>
            </div>

            {/* Text Content */}
            {hasContent && (
              <div className="my-auto flex min-h-[200px] flex-1 items-center justify-center py-6 text-center">
                <RichQuestionContent
                  value={question.content}
                  className="font-heading text-lg font-bold leading-relaxed text-foreground sm:text-xl"
                />
              </div>
            )}

            {/* Bottom Card Direction Hints */}
            <div className="flex w-full items-center justify-between pt-3 text-xs font-semibold text-muted-foreground/80">
              <span className="flex items-center gap-1">
                ← {question.leftLabel || "Nee"}
              </span>
              <span className="flex items-center gap-1">
                {question.rightLabel || "Ja"} →
              </span>
            </div>
          </div>
        ) : (
          /* Image Swipe Card - Framed with consistent padding, top label, and rounded image */
          <div className="relative z-10 flex min-h-[420px] w-full flex-col justify-between p-5 sm:min-h-[460px] sm:p-6">
            {/* Card Top Label */}
            <div className="flex w-full items-center justify-between pb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                {currentIndex !== undefined && totalQuestions !== undefined
                  ? `Vraag ${currentIndex + 1} van ${totalQuestions}`
                  : question.type}
              </span>
            </div>

            {/* Framed Image */}
            <div
              className={cn(
                "relative flex w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-muted/20 shadow-xs dark:border-white/10",
                hasContent
                  ? "h-[190px] sm:h-[220px]"
                  : "min-h-[280px] sm:min-h-[320px] flex-1",
              )}
            >
              <MediaImage
                value={question.image as MediaValue}
                alt="Swipe question"
                className="block h-full w-full object-contain p-1"
              />
            </div>

            {/* Text Content below image */}
            {hasContent && (
              <div className="my-auto flex min-h-[140px] flex-1 items-center justify-center py-4 text-center">
                <RichQuestionContent
                  value={question.content}
                  className="font-heading text-base font-bold leading-snug text-foreground sm:text-lg"
                />
              </div>
            )}

            {/* Bottom Card Direction Hints */}
            <div className="flex w-full items-center justify-between pt-3 text-xs font-semibold text-muted-foreground/80">
              <span className="flex items-center gap-1">
                ← {question.leftLabel || "Nee"}
              </span>
              <span className="flex items-center gap-1">
                {question.rightLabel || "Ja"} →
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Controls Under Card */}
      <div className="mt-auto flex w-full max-w-full flex-col gap-3 pt-5">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/90">
          <span>Sleep de kaart of tik hieronder</span>
        </div>
        <div className="flex w-full gap-3">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void submitSwipe("left")}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-card px-4 py-3.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-white/15"
          >
            <X className="size-4 stroke-3 text-destructive" />
            <span className="truncate">{question.leftLabel || "Nee"}</span>
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void submitSwipe("right")}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <Check className="size-4 stroke-3" />
            <span className="truncate">{question.rightLabel || "Ja"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
