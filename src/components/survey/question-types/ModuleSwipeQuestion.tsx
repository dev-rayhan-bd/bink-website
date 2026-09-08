"use client";

import { useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const cardBg =
    question.blockColor ||
    (question.colorCode && /^#[0-9A-Fa-f]{6}$/.test(question.colorCode)
      ? question.colorCode
      : undefined);

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
        style={{ x, rotate, touchAction: "pan-y" }}
        animate={controls}
        className="relative z-10 w-full max-w-full cursor-grab overflow-hidden rounded-[32px] border border-black/10 bg-primary text-primary-foreground shadow-[0_20px_45px_-10px_rgba(233,48,143,0.35)] ring-1 ring-black/5 will-change-transform active:cursor-grabbing dark:border-white/15 dark:ring-white/10"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-[32px]"
          style={{ backgroundColor: overlayColor }}
        />
        <div
          className={cn(
            "relative z-10 flex w-full flex-col overflow-hidden rounded-[32px]",
            !question.image
              ? "min-h-[300px] justify-between p-6 sm:min-h-[360px] sm:p-8"
              : "p-0",
          )}
          style={cardBg ? { backgroundColor: cardBg } : undefined}
        >
          {/* Card Top Label */}
          <div className="flex w-full items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-inherit/75">
              {currentIndex !== undefined && totalQuestions !== undefined
                ? `Vraag ${currentIndex + 1} van ${totalQuestions}`
                : question.type}
            </span>
          </div>

          {/* Picture Always Above Text */}
          {question.image && (
            <div className="aspect-3/4 w-full overflow-hidden rounded-t-[32px] bg-muted/20">
              <MediaImage
                value={question.image as MediaValue}
                alt="Swipe question"
                className="block h-full w-full object-cover object-center"
              />
            </div>
          )}

          {/* Text Content */}
          {hasContent && (
            <div
              className={cn(
                "flex-1 flex items-center justify-center text-center",
                question.image
                  ? "border-t border-border/40 p-5 sm:p-6"
                  : "py-6 my-auto",
              )}
            >
              <RichQuestionContent
                value={question.content}
                className="font-heading text-lg font-bold leading-relaxed text-inherit sm:text-xl"
              />
            </div>
          )}

          {/* Bottom Card Direction Hints */}
          <div className="flex w-full items-center justify-between pt-3 text-xs font-semibold text-inherit/75">
            <span className="flex items-center gap-1">
              ← {question.leftLabel || "Nee"}
            </span>
            <span className="flex items-center gap-1">
              {question.rightLabel || "Ja"} →
            </span>
          </div>
        </div>
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
