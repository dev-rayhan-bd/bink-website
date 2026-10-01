/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, MessageCircle, X } from "lucide-react";
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
    return (
      <div className="space-y-2.5">
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

          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(option)}
              className={cn(
                "group flex w-full min-w-0 items-center justify-between gap-3.5 rounded-2xl p-3.5 sm:p-4 text-left text-sm transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.99]",
                // Unsubmitted & Unselected
                !isSubmitted &&
                  !selected &&
                  "bg-white text-zinc-900 border-2 border-black/10 hover:border-black/25 hover:shadow-md",
                // Unsubmitted & Selected (Active choice with prominent border)
                !isSubmitted &&
                  selected &&
                  "bg-white text-zinc-950 border-3 border-zinc-950 ring-4 ring-zinc-950/25 shadow-xl scale-[1.02] font-bold",
                // Submitted & Correct Option
                isCorrectOption &&
                  "bg-emerald-50 text-emerald-950 border-3 border-success shadow-md font-semibold",
                // Submitted & Wrong Option Selected
                isWrongSelection &&
                  "bg-rose-50 text-rose-950 border-3 border-destructive shadow-md font-semibold",
                // Submitted & Dimmed Options
                isDimmed &&
                  "bg-white/80 text-zinc-400 border border-black/5 opacity-60 shadow-none",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all",
                    // Unselected badge
                    !isSubmitted &&
                      !selected &&
                      "bg-zinc-100 text-zinc-700 border border-zinc-200/80 group-hover:bg-zinc-200",
                    // Selected badge
                    !isSubmitted &&
                      selected &&
                      "bg-zinc-950 text-white font-black shadow-sm scale-110",
                    // Correct badge
                    isCorrectOption && "bg-success text-white shadow-xs font-bold",
                    // Wrong badge
                    isWrongSelection && "bg-destructive text-destructive-foreground shadow-xs font-bold",
                    // Dimmed badge
                    isDimmed && "bg-zinc-100 text-zinc-400 border-0",
                  )}
                >
                  {optionLabel(optionIndex)}
                </span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word leading-snug">
                  {option}
                </span>
              </div>

              {/* Right Selection Indicator */}
              <div className="shrink-0 pl-1">
                {!isSubmitted && (
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full transition-all shrink-0",
                      selected
                        ? "bg-zinc-950 text-white shadow-md scale-110 ring-2 ring-zinc-950/20"
                        : "border-2 border-zinc-300 bg-zinc-50 group-hover:border-zinc-400",
                    )}
                  >
                    {selected && <Check className="size-3.5 stroke-[3.5] text-white" />}
                  </div>
                )}
                {isCorrectOption && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-success text-white shadow-xs">
                    <Check className="size-3.5 stroke-[3.5]" />
                  </div>
                )}
                {isWrongSelection && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs">
                    <X className="size-3.5 stroke-[3.5]" />
                  </div>
                )}
                {isDimmed && (
                  <div className="size-6 rounded-full border-2 border-zinc-200/60" />
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
      <div className="space-y-3">
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
            className="flex items-center gap-3 rounded-2xl border-2 border-black/8 bg-white p-3.5 shadow-sm text-zinc-900 dark:border-white/15 dark:bg-card dark:text-zinc-100"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word text-sm">
              {item}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={disabled || index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown />
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

    return (
      <div className="space-y-4">
        <div className="aspect-video overflow-hidden rounded-lg bg-black shadow-md">
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
          <div className="space-y-2.5 pt-2">
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

              return (
                <button
                  key={`${option}-${optionIndex}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onAnswer(option)}
                  className={cn(
                    "group flex w-full min-w-0 items-center justify-between gap-3.5 rounded-2xl p-3.5 sm:p-4 text-left text-sm transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.99]",
                    // Unsubmitted & Unselected
                    !isSubmitted &&
                      !selected &&
                      "bg-white text-zinc-900 border-2 border-black/10 hover:border-black/25 hover:shadow-md",
                    // Unsubmitted & Selected
                    !isSubmitted &&
                      selected &&
                      "bg-white text-zinc-950 border-3 border-zinc-950 ring-4 ring-zinc-950/25 shadow-xl scale-[1.02] font-bold",
                    // Submitted & Correct
                    isCorrectOption &&
                      "bg-emerald-50 text-emerald-950 border-3 border-success shadow-md font-semibold",
                    // Submitted & Wrong
                    isWrongSelection &&
                      "bg-rose-50 text-rose-950 border-3 border-destructive shadow-md font-semibold",
                    // Submitted & Dimmed
                    isDimmed &&
                      "bg-white/80 text-zinc-400 border border-black/5 opacity-60 shadow-none",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all",
                        !isSubmitted &&
                          !selected &&
                          "bg-zinc-100 text-zinc-700 border border-zinc-200/80 group-hover:bg-zinc-200",
                        !isSubmitted &&
                          selected &&
                          "bg-zinc-950 text-white font-black shadow-sm scale-110",
                        isCorrectOption && "bg-success text-white shadow-xs font-bold",
                        isWrongSelection && "bg-destructive text-destructive-foreground shadow-xs font-bold",
                        isDimmed && "bg-zinc-100 text-zinc-400 border-0",
                      )}
                    >
                      {optionLabel(optionIndex)}
                    </span>
                    <span className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word leading-snug">
                      {option}
                    </span>
                  </div>

                  <div className="shrink-0 pl-1">
                    {!isSubmitted && (
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full transition-all shrink-0",
                          selected
                            ? "bg-zinc-950 text-white shadow-md scale-110 ring-2 ring-zinc-950/20"
                            : "border-2 border-zinc-300 bg-zinc-50 group-hover:border-zinc-400",
                        )}
                      >
                        {selected && <Check className="size-3.5 stroke-[3.5] text-white" />}
                      </div>
                    )}
                    {isCorrectOption && (
                      <div className="flex size-6 items-center justify-center rounded-full bg-success text-white shadow-xs">
                        <Check className="size-3.5 stroke-[3.5]" />
                      </div>
                    )}
                    {isWrongSelection && (
                      <div className="flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs">
                        <X className="size-3.5 stroke-[3.5]" />
                      </div>
                    )}
                    {isDimmed && (
                      <div className="size-6 rounded-full border-2 border-zinc-200/60" />
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
      <div className="grid grid-cols-5 gap-2 pt-1">
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
                "flex h-12 items-center justify-center rounded-2xl text-base font-bold transition-all duration-150 cursor-pointer shadow-sm active:scale-95",
                isSelected
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ring-2 ring-zinc-900/30 dark:ring-white/30 shadow-md scale-105"
                  : "bg-white dark:bg-card text-zinc-900 dark:text-zinc-100 border-2 border-black/10 dark:border-white/15 hover:border-black/25 dark:hover:border-white/30 hover:shadow-md",
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
      className="min-h-36 rounded-2xl border-2 border-black/10 bg-white p-4 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-zinc-900/20 dark:border-white/15 dark:bg-card dark:text-zinc-100 dark:placeholder:text-zinc-500"
      onChange={(event) => onAnswer(event.target.value)}
    />
  );
}
