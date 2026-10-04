/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useWatch } from "react-hook-form";
import { ArrowRight, CheckCircle2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn, isDarkColor } from "@/lib/utils";
import type { CreateModuleFormValues } from "@/lib/validations/course";
import { SurveyIntro } from "@/components/survey/SurveyIntro";
import AnimationWrapper from "@/components/ui/custom/animation-wrapper";
import { QuestionAnswer } from "@/components/survey/module-runner/QuestionAnswer";
import { QuestionPromptCard } from "@/components/survey/module-runner/QuestionPromptCard";
import {
  initialAnswer,
  hasAnswer,
} from "@/components/survey/module-runner/answer-utils";
import type { AnswerValue } from "@/components/survey/module-runner/types";

export function ModulePreview({
  existingThumbnail,
}: {
  existingThumbnail?: string;
}) {
  const title = useWatch<CreateModuleFormValues, "title">({ name: "title" });
  const description = useWatch<CreateModuleFormValues, "description">({
    name: "description",
  });
  const questions = useWatch<CreateModuleFormValues, "questions">({
    name: "questions",
  });
  const thumbnail = useWatch<CreateModuleFormValues, "thumbnail">({
    name: "thumbnail",
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    isCorrect?: boolean;
    explanation?: string;
    correctAnswer?: AnswerValue;
  } | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const timeout = setTimeout(() => {
      if (thumbnail && thumbnail instanceof File) {
        objectUrl = URL.createObjectURL(thumbnail);
        setPreviewUrl(objectUrl);
      } else if (existingThumbnail) {
        setPreviewUrl(existingThumbnail);
      } else {
        setPreviewUrl(null);
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnail, existingThumbnail]);

  const safeQuestions = useMemo(() => questions || [], [questions]);
  const totalQuestions = safeQuestions.length;
  const question = safeQuestions[currentIndex];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex >= totalQuestions && totalQuestions > 0) {
        setCurrentIndex(Math.max(0, totalQuestions - 1));
      }
      if (totalQuestions === 0) {
        setIsStarted(false);
        setIsCompleted(false);
        setCurrentIndex(0);
        setResult(null);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [totalQuestions, currentIndex]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (question && answer === null && !result) {
        setAnswer(initialAnswer(question as any));
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [question, answer, result]);

  useEffect(() => {
    if (!result || result.explanation) return;

    const hasCorrectAnswer = Boolean(
      (question?.isScored || (question as any)?.isScored === undefined) &&
      ((result?.correctAnswer && typeof result.correctAnswer === "string" && result.correctAnswer.trim().length > 0) ||
       ((question as any)?.correctAnswer && typeof (question as any).correctAnswer === "string" && (question as any).correctAnswer.trim().length > 0))
    );

    let delay: number | null = null;
    if (question?.type === "Ordering") {
      if (result?.isCorrect !== false) delay = 300;
    } else if (question?.type === "Simulated Call") {
      delay = 650;
    } else if (question?.type === "Information") {
      delay = 300;
    } else if (question?.type === "Swipe") {
      delay = 100;
    } else if (question?.type === "Rating") {
      delay = 400;
    } else if (question?.type === "Free Input") {
      delay = 400;
    } else if (
      question?.type === "Video" &&
      !("options" in question && Array.isArray((question as any).options) && (question as any).options.length > 0)
    ) {
      delay = 300;
    } else if (!hasCorrectAnswer) {
      delay = 300;
    }

    if (delay === null) return;

    const timer = window.setTimeout(() => {
      if (currentIndex >= totalQuestions - 1) {
        setIsCompleted(true);
        return;
      }
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnswer(initialAnswer(safeQuestions[nextIndex] as any));
      setResult(null);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [question, result, currentIndex, totalQuestions, safeQuestions]);

  useEffect(() => {
    if (!result || !bottomRef.current) return;

    const timer = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [question?.type, result]);

  const handleSubmit = (submittedAnswer: AnswerValue | null = answer) => {
    if (!question || !hasAnswer(submittedAnswer)) return;

    let isCorrect = true;
    let correctAnswer: AnswerValue | undefined = undefined;

    if (question.type === "MCQ") {
      isCorrect = submittedAnswer === question.correctAnswer;
      correctAnswer = question.correctAnswer;
    } else if (question.type === "Ordering") {
      const correctOrder = question.items || [];
      isCorrect = JSON.stringify(submittedAnswer) === JSON.stringify(correctOrder);
      correctAnswer = correctOrder;
    } else if (question.type === "Swipe") {
      isCorrect = true;
      correctAnswer = undefined;
    } else if (question.type === "Chat Scenario") {
      if (Array.isArray(submittedAnswer) && question.chatSteps) {
        let allCorrect = true;
        for (const sel of submittedAnswer as any[]) {
          const step = question.chatSteps?.find((s) => s.stepId === sel.stepId);
          const opt = step?.options?.find((o) => o.optionId === sel.optionId);
          if (opt && opt.isCorrect === false) {
            allCorrect = false;
          }
        }
        isCorrect = allCorrect;
      } else {
        isCorrect = submittedAnswer === question.correctAnswer;
      }
      correctAnswer = question.correctAnswer;
    } else if (question.type === "Video" && question.correctAnswer) {
      isCorrect = submittedAnswer === question.correctAnswer;
      correctAnswer = question.correctAnswer;
    }

    setResult({
      isCorrect:
        !question.isScored ||
          question.type === "Swipe" ||
          question.type === "Free Input" ||
          question.type === "Rating" ||
          question.type === "Simulated Call" ||
          (question.type === "Video" && !question.correctAnswer)
          ? undefined
          : isCorrect,
      correctAnswer,
      explanation: question.explanation,
    });
  };

  const handleRetryOrdering = () => {
    setResult(null);
  };

  const handleContinue = () => {
    if (currentIndex >= totalQuestions - 1) {
      setIsCompleted(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswer(initialAnswer(safeQuestions[nextIndex] as any));
    setResult(null);
  };

  const renderContent = () => {
    if (!isStarted && !isCompleted) {
      return (
        <SurveyIntro
          title={title || "Titel leermodule"}
          description={description || "Beschrijving van de module..."}
          badge="Leermodule"
          imageUrl={previewUrl || "/window.svg"}
          questionCount={totalQuestions}
          format="Interactief"
          startLabel="Start"
          onStart={() => setIsStarted(true)}
        />
      );
    }

    const isModuleScored = safeQuestions.some(
      (q) => q.isScored === true || String(q.isScored) === "true",
    );

    if (isCompleted) {
      const formattedTitle = title?.trim() ? `"${title.trim()}"` : "deze module";

      return (
        <AnimationWrapper
          direction="up"
          duration={0.4}
          className="flex h-full flex-col"
        >
          <div className="flex h-full flex-1 flex-col justify-between">
            <div className="space-y-4">
              <div className="rounded-lg bg-primary p-3 text-center text-primary-foreground shadow-sm">
                <CheckCircle2 className="mx-auto mb-2.5 size-10" />
                <h1 className="font-heading text-xl font-bold">
                  Module afgerond
                </h1>
                <p className="mt-1.5 text-xs text-primary-foreground/85">
                  {totalQuestions === 1 ? (
                    <>
                      Je hebt de vraag van{" "}
                      <span className="font-semibold text-primary-foreground">
                        {formattedTitle}
                      </span>{" "}
                      beantwoord.
                    </>
                  ) : (
                    <>
                      Je hebt alle {totalQuestions} vragen van{" "}
                      <span className="font-semibold text-primary-foreground">
                        {formattedTitle}
                      </span>{" "}
                      beantwoord.
                    </>
                  )}
                </p>
              </div>

              {isModuleScored ? (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-secondary-foreground/10 bg-secondary/30 p-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-primary">100</p>
                    <p className="text-xs text-muted-foreground">Modulescore</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">100%</p>
                    <p className="text-xs text-muted-foreground">Voortgang</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-secondary-foreground/10 bg-secondary/30 p-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-primary">100%</p>
                    <p className="text-xs text-muted-foreground">Voortgang</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center px-4 pt-8 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PartyPopper className="size-8" />
                </div>
                <p className="font-heading text-xl font-bold text-foreground">
                  {title?.trim()
                    ? `Bedankt voor het afronden van ${formattedTitle}!`
                    : "Bedankt voor het afronden van deze module!"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We waarderen je deelname en feedback enorm.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Button
                type="button"
                size="lg-full"
                onClick={() => {
                  setIsStarted(false);
                  setIsCompleted(false);
                  setCurrentIndex(0);
                  setResult(null);
                }}
              >
                Voorbeeld herstarten
              </Button>
            </div>
          </div>
        </AnimationWrapper>
      );
    }

    if (!question) {
      return (
        <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
          Er zijn geen vragen beschikbaar in deze module.
        </div>
      );
    }

    const displayedProgress =
      totalQuestions > 0
        ? ((result ? currentIndex + 1 : currentIndex) / totalQuestions) * 100
        : 0;
    const isOrderingRetry =
      question.type === "Ordering" && result?.isCorrect === false;

    const isSimulatedCall = question?.type === "Simulated Call";
    const questionBackgroundColor = /^#[0-9A-Fa-f]{6}$/.test(
      question.colorCode || "",
    )
      ? question.colorCode
      : undefined;
    const isDarkBg = isDarkColor(questionBackgroundColor);

    return (
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col overflow-hidden bg-secondary p-3 text-foreground animate-fadeIn sm:p-5",
          isSimulatedCall && "relative p-0 bg-black text-white",
        )}
        style={{
          backgroundColor: isSimulatedCall ? undefined : questionBackgroundColor,
        }}
      >
        {!isSimulatedCall && (
          <div className="mb-4 shrink-0 px-1 py-2">
            <h2
              className={cn(
                "mb-2 font-heading text-lg font-bold leading-tight",
                questionBackgroundColor
                  ? isDarkBg
                    ? "text-white drop-shadow-sm"
                    : "text-zinc-950"
                  : "text-secondary-foreground",
              )}
            >
              {title || "Titel leermodule"}
            </h2>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center">
                <span
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none shadow-xs",
                    questionBackgroundColor
                      ? isDarkBg
                        ? "bg-black/40 text-white backdrop-blur-xs border border-white/25"
                        : "bg-black/10 text-zinc-950 border border-black/10"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  VRAAG {currentIndex + 1} VAN {totalQuestions}
                </span>
              </div>
              <Progress
                value={displayedProgress}
                className={cn(
                  "h-1.5 w-full rounded-full",
                  questionBackgroundColor
                    ? isDarkBg
                      ? "bg-white/25 [&>div]:bg-white"
                      : "bg-black/15 [&>div]:bg-zinc-900"
                    : "bg-primary/25 [&>div]:bg-primary",
                )}
              />
            </div>
          </div>
        )}

        <AnimationWrapper
          key={currentIndex}
          direction="left"
          duration={0.4}
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            isSimulatedCall && "relative h-full w-full bg-black",
          )}
        >
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden",
              isSimulatedCall
                ? "relative h-full w-full overflow-hidden rounded-none bg-black p-0"
                : "space-y-2.5",
            )}
          >
            {question.type !== "Swipe" &&
              question.type !== "Simulated Call" &&
              question.type !== "Chat Scenario" && (
                <QuestionPromptCard question={question as any} />
              )}

            <QuestionAnswer
              question={question as any}
              answer={answer}
              disabled={Boolean(result)}
              onAnswer={setAnswer}
              onSwipe={(direction) => {
                setAnswer(direction);
                handleSubmit(direction);
              }}
              onAutoSubmit={(ans) => {
                handleSubmit(ans);
              }}
              correctAnswer={result?.correctAnswer}
              isSubmitted={Boolean(result)}
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
            />

            {result &&
              question.type !== "Simulated Call" &&
              (result.explanation || isOrderingRetry) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-auto!"
                >
                  <div className="space-y-3">
                    {isOrderingRetry && (
                      <div className="min-w-0 overflow-hidden rounded-2xl border-2 border-zinc-200/90 bg-white p-4 text-sm font-semibold shadow-sm wrap-break-word text-zinc-950">
                        <p>Zet de onderdelen in de juiste volgorde en probeer opnieuw.</p>
                      </div>
                    )}
                    {result.explanation && !isOrderingRetry && (
                      <div className="min-w-0 rounded-2xl border-2 border-zinc-200/90 bg-white p-4 text-sm shadow-sm wrap-break-word text-zinc-950">
                        <span className="font-bold text-zinc-950">Feedback: </span>
                        <span className="text-zinc-800">{result.explanation}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            <div ref={bottomRef} />
          </div>
        </AnimationWrapper>

        {!isSimulatedCall && question?.type !== "Swipe" && (
          <div className="mt-auto shrink-0 pt-0 [&_button]:bg-background [&_button]:text-foreground [&_button]:hover:bg-background/90">
            {result ? (
              isOrderingRetry ? (
                <Button
                  type="button"
                  size="lg-full"
                  onClick={handleRetryOrdering}
                >
                  Opnieuw proberen
                  <ArrowRight />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg-full"
                  onClick={handleContinue}
                >
                  {currentIndex === totalQuestions - 1
                    ? "Bekijk resultaat"
                    : "Verder"}
                  <ArrowRight />
                </Button>
              )
            ) : (
              <Button
                type="button"
                size="lg-full"
                disabled={!hasAnswer(answer)}
                onClick={() => handleSubmit()}
              >
                {question?.type === "Information" ? "Verder" : "Volgende"}
                <ArrowRight />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">Interactive Preview</h3>
        <span className="text-xs text-muted-foreground">
          Learner&apos;s View
        </span>
      </div> */}

      <div className="mx-auto flex w-full max-w-95 justify-center pt-2 pb-8">
        {/* Outer Device Frame (Titanium look) */}
        <div className="relative flex h-200 max-h-[82dvh] min-h-150 w-full flex-col overflow-visible rounded-[3.5rem] bg-linear-to-br from-zinc-700 via-zinc-900 to-zinc-700 p-0.75 shadow-2xl ring-1 ring-zinc-800/50">

          {/* Hardware Buttons */}
          <div className="absolute -left-1 top-27.5 h-8 w-1 rounded-l-md bg-zinc-600 shadow-[inset_1px_0_1px_rgba(255,255,255,0.2)]" />
          <div className="absolute -left-1 top-40 h-14 w-1 rounded-l-md bg-zinc-600 shadow-[inset_1px_0_1px_rgba(255,255,255,0.2)]" />
          <div className="absolute -left-1 top-58 h-14 w-1 rounded-l-md bg-zinc-600 shadow-[inset_1px_0_1px_rgba(255,255,255,0.2)]" />
          <div className="absolute -right-1 top-47 h-20 w-1 rounded-r-md bg-zinc-600 shadow-[inset_-1px_0_1px_rgba(255,255,255,0.2)]" />

          {/* Inner Black Bezel */}
          <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[3.35rem] bg-black p-2 sm:p-3 shadow-[inset_0_0_12px_rgba(0,0,0,1)]">

            {/* Screen */}
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.8rem] bg-card ring-1 ring-white/10">

              {/* Front Camera Cutout */}
              <div className="absolute inset-x-0 top-3 z-50 flex justify-center drop-shadow-md">
                <div className="h-5 w-5 rounded-full bg-black ring-1 ring-white/5" />
              </div>

              {/* Glossy Screen Reflection Overlay */}
              <div className="pointer-events-none absolute inset-0 z-40 bg-linear-to-tr from-transparent via-transparent to-white/3" />

              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
