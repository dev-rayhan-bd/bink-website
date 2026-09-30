"use client";

import { useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
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
}: {
  question: ModuleQuestion;
  disabled: boolean;
  onSwipe: (direction: "left" | "right") => void;
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
      "rgba(239, 68, 68, 0.25)",
      "rgba(255, 255, 255, 0)",
      "rgba(34, 197, 94, 0.25)",
    ],
  );

  const blockColor = /^#[0-9A-Fa-f]{6}$/.test(question.blockColor || "")
    ? question.blockColor
    : undefined;

  const submitSwipe = async (direction: "left" | "right") => {
    if (isDisabled) return;

    setHasSwiped(true);

    await controls.start({
      x: direction === "right" ? 380 : -380,
      rotate: direction === "right" ? 10 : -10,
      opacity: 0,
      transition: { duration: 0.18, ease: "easeOut" },
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
        "flex w-full min-w-0 max-w-full grow shrink-0 flex-col justify-between overflow-x-hidden",
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
          "relative z-10 flex w-full max-w-full cursor-grab flex-col justify-between overflow-hidden rounded-[24px] border border-black/10 shadow-lg shadow-black/5 will-change-transform active:cursor-grabbing dark:border-white/15",
          !blockColor && "bg-card text-card-foreground",
        )}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          style={{ backgroundColor: overlayColor }}
        />
        {!question.image ? (
          /* Text-only swipe card */
          <div className="relative z-10 flex min-h-[300px] w-full flex-col justify-between p-6 sm:p-8">
            {hasContent && (
              <div className="my-auto flex flex-1 items-center justify-center py-6 text-center">
                <RichQuestionContent
                  value={question.content}
                  className="font-heading text-base font-bold leading-relaxed text-foreground sm:text-lg"
                />
              </div>
            )}

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
          /* Image Swipe Card - Dynamic flexible layout that adapts to text length */
          <div className="relative z-10 flex w-full flex-col justify-between">
            <div
              className={cn(
                "relative w-full overflow-hidden bg-muted/20 shrink-0",
                hasContent ? "aspect-16/10" : "aspect-4/3 min-h-[240px]",
              )}
            >
              <MediaImage
                value={question.image as MediaValue}
                alt="Swipe vraag"
                className="block h-full w-full object-cover object-center"
              />
            </div>

            {hasContent && (
              <div className="my-auto flex min-h-[60px] flex-1 items-center justify-center p-5 text-center sm:p-6">
                <RichQuestionContent
                  value={question.content}
                  className="font-heading text-base font-bold leading-relaxed text-foreground sm:text-lg"
                />
              </div>
            )}

            <div className="flex w-full items-center justify-between px-5 pb-4 pt-2 text-xs font-semibold text-muted-foreground/80 sm:px-6">
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
      <div className="mt-auto flex w-full max-w-full flex-col gap-2.5 pt-3">
        <div className="flex items-center justify-center py-0.5">
          <span className="inline-flex items-center justify-center rounded-full bg-black/75 px-4 py-1 text-[11px] font-semibold text-white shadow-md backdrop-blur-md border border-white/20">
            Sleep de kaart of tik hieronder
          </span>
        </div>
        <div className="flex w-full gap-3">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void submitSwipe("left")}
            className="flex flex-1 items-center justify-center rounded-xl border-2 border-black/10 bg-white px-4 py-3 text-sm font-bold text-zinc-900 shadow-md transition-all hover:bg-zinc-100 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-card dark:text-zinc-100 dark:border-white/20"
          >
            <span className="truncate">{question.leftLabel || "Nee"}</span>
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void submitSwipe("right")}
            className="flex flex-1 items-center justify-center rounded-xl border-2 border-white bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="truncate">{question.rightLabel || "Ja"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

