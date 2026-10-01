/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChatScenarioQuestion } from "../question-types/ChatScenarioQuestion";
import { ModuleSwipeQuestion } from "../question-types/ModuleSwipeQuestion";
import { optionLabel } from "./answer-utils";
import { MediaVideo } from "./media";
import { SimulatedCallQuestion } from "./SimulatedCallQuestion";
import type { AnswerRendererProps, MediaValue } from "./types";

export function QuestionAnswer({
  question,
  answer,
  disabled,
  onAnswer,
  onSwipe,
  onAutoSubmit,
  correctAnswer,
  isSubmitted = false,
  currentIndex,
}: AnswerRendererProps & {
  onAutoSubmit?: (value: string) => void;
  currentIndex?: number;
  totalQuestions?: number;
}) {
  if (question.type === "Information") {
    return null;
  }

  if (question.type === "MCQ") {
    const optionsCount = (question.options ?? []).length;
    const isManyOptions = optionsCount >= 4;

    return (
      <div className={cn("w-full", isManyOptions ? "space-y-1.5" : "space-y-2")}>
        {(question.options ?? []).map((option, optionIndex) => {
          const selected = answer === option;
          const hasCorrectAnswer =
            correctAnswer !== undefined &&
            correctAnswer !== null &&
            !(
              typeof correctAnswer === "string" && correctAnswer.trim() === ""
            );
          const isCorrectOption =
            isSubmitted && hasCorrectAnswer && correctAnswer === option;
          const isWrongSelection =
            isSubmitted && hasCorrectAnswer && selected && correctAnswer !== option;
          const isDimmed =
            isSubmitted &&
            hasCorrectAnswer &&
            !isCorrectOption &&
            !isWrongSelection;

          const isLongText = option.length > 50;

          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(option)}
              className={cn(
                "group flex w-full min-w-0 items-center justify-between gap-2.5 rounded-xl text-left font-medium transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.99]",
                isManyOptions ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5",
                // Unsubmitted & Unselected (Solid high-contrast white card)
                !isSubmitted &&
                  !selected &&
                  "bg-white text-zinc-950 border-2 border-zinc-200 dark:bg-card dark:text-zinc-100 dark:border-zinc-700 hover:border-zinc-400 hover:shadow-md",
                // Unsubmitted & Selected (Highlighted active card with bold border)
                !isSubmitted &&
                  selected &&
                  "bg-white text-zinc-950 border-2 border-zinc-950 ring-4 ring-black/10 dark:bg-card dark:text-white dark:border-white dark:ring-white/20 shadow-md font-bold",
                // Submitted & Correct Option
                isCorrectOption &&
                  "bg-white text-zinc-950 border-2 border-emerald-600 dark:bg-card dark:text-white shadow-md font-bold",
                // Submitted & Wrong Option Selected
                isWrongSelection &&
                  "bg-white text-zinc-950 border-2 border-rose-600 dark:bg-card dark:text-white shadow-md font-bold",
                // Submitted & Dimmed Options
                isDimmed &&
                  "bg-white/80 text-zinc-400 border border-zinc-200 opacity-60 dark:bg-card/70 dark:text-zinc-500 shadow-none",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-all border",
                    isManyOptions ? "size-6" : "size-6.5 sm:size-7",
                    // Unselected badge
                    !isSubmitted &&
                      !selected &&
                      "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 group-hover:bg-zinc-200",
                    // Selected badge
                    !isSubmitted &&
                      selected &&
                      "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 font-black shadow-xs",
                    // Correct badge
                    isCorrectOption && "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold",
                    // Wrong badge
                    isWrongSelection && "bg-rose-600 text-white border-rose-600 shadow-xs font-bold",
                    // Dimmed badge
                    isDimmed && "bg-zinc-100 text-zinc-400 border-zinc-200",
                  )}
                >
                  {optionLabel(optionIndex)}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 whitespace-pre-wrap wrap-break-word leading-snug",
                    isLongText || isManyOptions ? "text-xs sm:text-sm" : "text-xs sm:text-base",
                  )}
                >
                  {option}
                </span>
              </div>

              {/* Right Selection Indicator */}
              <div className="shrink-0 pl-1">
                {!isSubmitted && (
                  <div
                    className={cn(
                      "flex size-5 sm:size-5.5 items-center justify-center rounded-full transition-all shrink-0",
                      selected
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs ring-2 ring-black/10"
                        : "border-2 border-zinc-300 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-600 group-hover:border-zinc-400",
                    )}
                  >
                    {selected && <Check className="size-3 stroke-[3]" />}
                  </div>
                )}
                {isCorrectOption && (
                  <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                )}
                {isWrongSelection && (
                  <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs">
                    <X className="size-3 stroke-[3]" />
                  </div>
                )}
                {isDimmed && (
                  <div className="size-5 rounded-full border border-zinc-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "Swipe") {
    return (
      <ModuleSwipeQuestion
        key={question.id}
        question={question}
        disabled={disabled}
        onSwipe={onSwipe}
      />
    );
  }

  if (question.type === "Ordering") {
    const items: string[] = Array.isArray(answer)
      ? (answer as string[])
      : (question.items ?? []);
    const move = (index: number, offset: number) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= items.length) return;
      const updated: string[] = [...items];
      [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
      onAnswer(updated);
    };

    return (
      <div className="space-y-2 w-full">
        {items.map((item, index) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            key={`${item}-${index}`}
            className="flex items-center gap-2.5 rounded-xl border-2 border-zinc-200 bg-white p-3 shadow-xs text-zinc-950 dark:bg-card dark:border-zinc-700 dark:text-zinc-100"
          >
            <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-900 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word text-xs sm:text-sm font-medium">
              {item}
            </span>
            <div className="flex gap-0.5">
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={disabled || index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (question.type === "Chat Scenario") {
    return (
      <ChatScenarioQuestion
        key={question.id || String(currentIndex)}
        question={question}
        disabled={disabled}
        onAnswer={onAnswer}
        onAutoSubmit={onAutoSubmit as any}
      />
    );
  }

  if (question.type === "Simulated Call") {
    return (
      <SimulatedCallQuestion
        key={question.id || String(currentIndex)}
        question={question}
        answer={answer}
        disabled={disabled}
        onComplete={() => {
          onAnswer("completed");
          if (onAutoSubmit) {
            onAutoSubmit("completed");
          }
        }}
      />
    );
  }

  if (question.type === "Video") {
    const videoUrl = question.videoUrl ?? "";
    const videoSrc = videoUrl as MediaValue;
    const youtubeId =
      typeof videoUrl === "string"
        ? videoUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/)?.[1] ?? undefined
        : undefined;
    const hasOptions =
      Array.isArray(question.options) && question.options.length > 0;
    const isManyOptions = (question.options?.length ?? 0) >= 4;

    return (
      <div className="space-y-2.5 w-full">
        <div className="aspect-video max-h-[22dvh] overflow-hidden rounded-xl bg-black shadow-xs shrink-0">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={question.content}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <MediaVideo value={videoSrc} className="size-full" />
          )}
        </div>
        {hasOptions ? (
          <div className={cn("w-full pt-1", isManyOptions ? "space-y-1.5" : "space-y-2")}>
            {question.options?.map((option, optionIndex) => {
              const selected = answer === option;
              const hasCorrectAnswer =
                correctAnswer !== undefined &&
                correctAnswer !== null &&
                !(
                  typeof correctAnswer === "string" &&
                  correctAnswer.trim() === ""
                );
              const isCorrectOption =
                isSubmitted && hasCorrectAnswer && correctAnswer === option;
              const isWrongSelection =
                isSubmitted &&
                hasCorrectAnswer &&
                selected &&
                correctAnswer !== option;
              const isDimmed =
                isSubmitted &&
                hasCorrectAnswer &&
                !isCorrectOption &&
                !isWrongSelection;

              const isLongText = option.length > 50;

              return (
                <button
                  key={`${option}-${optionIndex}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswer(option)}
                  className={cn(
                    "group flex w-full min-w-0 items-center justify-between gap-2.5 rounded-xl text-left font-medium transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.99]",
                    isManyOptions ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5",
                    // Unsubmitted & Unselected (Solid high-contrast white card)
                    !isSubmitted &&
                      !selected &&
                      "bg-white text-zinc-950 border-2 border-zinc-200 dark:bg-card dark:text-zinc-100 dark:border-zinc-700 hover:border-zinc-400 hover:shadow-md",
                    // Unsubmitted & Selected (Highlighted active card with bold border)
                    !isSubmitted &&
                      selected &&
                      "bg-white text-zinc-950 border-2 border-zinc-950 ring-4 ring-black/10 dark:bg-card dark:text-white dark:border-white dark:ring-white/20 shadow-md font-bold",
                    // Submitted & Correct Option
                    isCorrectOption &&
                      "bg-white text-zinc-950 border-2 border-emerald-600 dark:bg-card dark:text-white shadow-md font-bold",
                    // Submitted & Wrong Option Selected
                    isWrongSelection &&
                      "bg-white text-zinc-950 border-2 border-rose-600 dark:bg-card dark:text-white shadow-md font-bold",
                    // Submitted & Dimmed Options
                    isDimmed &&
                      "bg-white/80 text-zinc-400 border border-zinc-200 opacity-60 dark:bg-card/70 dark:text-zinc-500 shadow-none",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-all border",
                        isManyOptions ? "size-6" : "size-6.5 sm:size-7",
                        // Unselected badge
                        !isSubmitted &&
                          !selected &&
                          "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 group-hover:bg-zinc-200",
                        // Selected badge
                        !isSubmitted &&
                          selected &&
                          "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 font-black shadow-xs",
                        // Correct badge
                        isCorrectOption && "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold",
                        // Wrong badge
                        isWrongSelection && "bg-rose-600 text-white border-rose-600 shadow-xs font-bold",
                        // Dimmed badge
                        isDimmed && "bg-zinc-100 text-zinc-400 border-zinc-200",
                      )}
                    >
                      {optionLabel(optionIndex)}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 whitespace-pre-wrap wrap-break-word leading-snug",
                        isLongText || isManyOptions ? "text-xs sm:text-sm" : "text-xs sm:text-base",
                      )}
                    >
                      {option}
                    </span>
                  </div>

                  <div className="shrink-0 pl-1">
                    {!isSubmitted && (
                      <div
                        className={cn(
                          "flex size-5 sm:size-5.5 items-center justify-center rounded-full transition-all shrink-0",
                          selected
                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs ring-2 ring-black/10"
                            : "border-2 border-zinc-300 bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-600 group-hover:border-zinc-400",
                        )}
                      >
                        {selected && <Check className="size-3 stroke-[3]" />}
                      </div>
                    )}
                    {isCorrectOption && (
                      <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                    {isWrongSelection && (
                      <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs">
                        <X className="size-3 stroke-[3]" />
                      </div>
                    )}
                    {isDimmed && (
                      <div className="size-5 rounded-full border border-zinc-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  if (question.type === "Rating") {
    return (
      <div className="grid grid-cols-5 gap-2 pt-1 w-full">
        {Array.from(
          { length: question.scale ?? 5 },
          (_, index) => index + 1,
        ).map((rating) => {
          const isSelected = answer === rating;
          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(rating)}
              className={cn(
                "flex h-12 sm:h-13 items-center justify-center rounded-xl text-base sm:text-lg font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-95",
                isSelected
                  ? "bg-zinc-950 text-white border-2 border-zinc-950 ring-4 ring-black/25 dark:bg-white dark:text-zinc-950 dark:border-white dark:ring-white/30 font-black shadow-md scale-105"
                  : "bg-white text-zinc-950 border-2 border-zinc-200 dark:bg-card dark:text-zinc-100 dark:border-zinc-700 hover:border-zinc-400 hover:shadow-xs",
              )}
            >
              {rating}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Textarea
      value={typeof answer === "string" ? answer : ""}
      disabled={disabled}
      placeholder="Schrijf jouw antwoord..."
      className="min-h-28 sm:min-h-36 rounded-xl border-2 border-zinc-200 bg-white p-3.5 text-zinc-950 shadow-xs placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-2 focus-visible:ring-black/10 text-xs sm:text-sm dark:bg-card dark:border-zinc-700 dark:text-zinc-100"
      onChange={(event) => onAnswer(event.target.value)}
    />
  );
}
