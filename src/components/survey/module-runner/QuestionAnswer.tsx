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
    return (
      <div className="space-y-3">
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
                "group flex w-full min-w-0 items-center justify-between gap-3.5 rounded-2xl p-4 text-left text-sm sm:text-base font-medium transition-all duration-150 cursor-pointer shadow-md active:scale-[0.99]",
                // Unsubmitted & Unselected (Clean solid card)
                !isSubmitted &&
                  !selected &&
                  "bg-card text-card-foreground border-2 border-border hover:border-primary/60 hover:shadow-lg",
                // Unsubmitted & Selected (Highlighted active card)
                !isSubmitted &&
                  selected &&
                  "bg-card text-card-foreground border-2 border-primary ring-4 ring-primary/20 shadow-xl scale-[1.01] font-bold",
                // Submitted & Correct Option
                isCorrectOption &&
                  "bg-card text-card-foreground border-2 border-success shadow-md font-bold",
                // Submitted & Wrong Option Selected
                isWrongSelection &&
                  "bg-card text-card-foreground border-2 border-destructive shadow-md font-bold",
                // Submitted & Dimmed Options
                isDimmed &&
                  "bg-card/70 text-muted-foreground border border-border/40 opacity-50 shadow-none",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all border",
                    // Unselected badge
                    !isSubmitted &&
                      !selected &&
                      "bg-muted text-foreground border-border group-hover:bg-primary/10 group-hover:text-primary",
                    // Selected badge
                    !isSubmitted &&
                      selected &&
                      "bg-primary text-primary-foreground border-primary font-black shadow-xs scale-105",
                    // Correct badge
                    isCorrectOption && "bg-success text-success-foreground border-success shadow-xs font-bold",
                    // Wrong badge
                    isWrongSelection && "bg-destructive text-destructive-foreground border-destructive shadow-xs font-bold",
                    // Dimmed badge
                    isDimmed && "bg-muted text-muted-foreground border-border/40",
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
                        ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                        : "border-2 border-border bg-muted/40 group-hover:border-primary/50",
                    )}
                  >
                    {selected && <Check className="size-3.5 stroke-[3] text-primary-foreground" />}
                  </div>
                )}
                {isCorrectOption && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-success text-success-foreground shadow-xs">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                )}
                {isWrongSelection && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs">
                    <X className="size-3.5 stroke-[3]" />
                  </div>
                )}
                {isDimmed && (
                  <div className="size-6 rounded-full border-2 border-border/40" />
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
            className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 shadow-md text-card-foreground"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold text-foreground border border-border">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 whitespace-pre-wrap wrap-break-word text-sm sm:text-base font-medium">
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
        <div className="aspect-video overflow-hidden rounded-2xl bg-black shadow-md">
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
          <div className="space-y-3 pt-2">
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
                    "group flex w-full min-w-0 items-center justify-between gap-3.5 rounded-2xl p-4 text-left text-sm sm:text-base font-medium transition-all duration-150 cursor-pointer shadow-md active:scale-[0.99]",
                    !isSubmitted &&
                      !selected &&
                      "bg-card text-card-foreground border-2 border-border hover:border-primary/60 hover:shadow-lg",
                    !isSubmitted &&
                      selected &&
                      "bg-card text-card-foreground border-2 border-primary ring-4 ring-primary/20 shadow-xl scale-[1.01] font-bold",
                    isCorrectOption &&
                      "bg-card text-card-foreground border-2 border-success shadow-md font-bold",
                    isWrongSelection &&
                      "bg-card text-card-foreground border-2 border-destructive shadow-md font-bold",
                    isDimmed &&
                      "bg-card/70 text-muted-foreground border border-border/40 opacity-50 shadow-none",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all border",
                        !isSubmitted &&
                          !selected &&
                          "bg-muted text-foreground border-border group-hover:bg-primary/10 group-hover:text-primary",
                        !isSubmitted &&
                          selected &&
                          "bg-primary text-primary-foreground border-primary font-black shadow-xs scale-105",
                        isCorrectOption && "bg-success text-success-foreground border-success shadow-xs font-bold",
                        isWrongSelection && "bg-destructive text-destructive-foreground border-destructive shadow-xs font-bold",
                        isDimmed && "bg-muted text-muted-foreground border-border/40",
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
                            ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                            : "border-2 border-border bg-muted/40 group-hover:border-primary/50",
                        )}
                      >
                        {selected && <Check className="size-3.5 stroke-[3] text-primary-foreground" />}
                      </div>
                    )}
                    {isCorrectOption && (
                      <div className="flex size-6 items-center justify-center rounded-full bg-success text-success-foreground shadow-xs">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    )}
                    {isWrongSelection && (
                      <div className="flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xs">
                        <X className="size-3.5 stroke-[3]" />
                      </div>
                    )}
                    {isDimmed && (
                      <div className="size-6 rounded-full border-2 border-border/40" />
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
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-md scale-105"
                  : "bg-card text-card-foreground border-2 border-border hover:border-primary/60 hover:shadow-md",
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
      className="min-h-36 rounded-2xl border-2 border-border bg-card p-4 text-card-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20"
      onChange={(event) => onAnswer(event.target.value)}
    />
  );
}
