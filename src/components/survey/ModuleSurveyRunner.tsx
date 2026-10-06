"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LoaderCircle, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  SubmitModuleAnswerResult,
  UserModuleDetails,
} from "@/lib/types/module.type";
import { cn, ErrorToast, isDarkColor } from "@/lib/utils";
import { extractModuleTexts, translateModuleData } from "@/lib/module-translator";
import { translateScreenTexts } from "@/services/translate.service";
import { submitModuleAnswer } from "@/services/user-progress.service";
import AnimationWrapper from "@/components/ui/custom/animation-wrapper";
import { SurveyIntro } from "./SurveyIntro";
import { ModuleRunnerSkeleton } from "./ModuleRunnerSkeleton";
import { QuestionAnswer } from "./module-runner/QuestionAnswer";
import { QuestionPromptCard } from "./module-runner/QuestionPromptCard";
import { initialAnswer, hasAnswer } from "./module-runner/answer-utils";
import type { AnswerValue } from "./module-runner/types";

export function ModuleSurveyRunner({
  details,
  initialTranslations = {},
}: {
  details: UserModuleDetails;
  initialTranslations?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}) {
  const router = useRouter();
  const hasInitial = Boolean(
    initialTranslations && Object.keys(initialTranslations).length > 0,
  );
  const [translations, setTranslations] = useState<Record<string, string>>(
    initialTranslations || {},
  );
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(() => {
    if (hasInitial) return false;
    const texts = extractModuleTexts(details.module);
    return texts.length > 0;
  });

  useEffect(() => {
    if (hasInitial) return;

    const texts = extractModuleTexts(details.module);
    if (texts.length === 0) {
      return;
    }

    let isMounted = true;
    void translateScreenTexts(texts, "quiz_screen", "nl")
      .then((res) => {
        if (isMounted) {
          if (res && Object.keys(res).length > 0) {
            setTranslations(res);
          }
          setIsLoadingTranslations(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingTranslations(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [details.module, hasInitial]);

  const translatedData = useMemo(
    () => translateModuleData(details.module, translations),
    [details.module, translations],
  );

  const activeModule = translatedData.module;
  const userProgress = details.userProgress;

  const startingIndex = Math.min(
    userProgress.completedQuestions,
    Math.max(activeModule.questions.length - 1, 0),
  );
  const [isStarted, setIsStarted] = useState(
    userProgress.status === "in_progress",
  );
  const [isCompleted, setIsCompleted] = useState(
    userProgress.status === "completed",
  );
  const [currentIndex, setCurrentIndex] = useState(startingIndex);
  const [answer, setAnswer] = useState<AnswerValue | null>(() =>
    initialAnswer(activeModule.questions[startingIndex]),
  );
  const [result, setResult] = useState<SubmitModuleAnswerResult>();
  const [finalResult, setFinalResult] = useState<SubmitModuleAnswerResult>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = activeModule.questions[currentIndex];
  const totalQuestions = activeModule.questions.length;
  const localProgress =
    result?.progressPercentage ?? userProgress.progressPercentage;

  const handleSubmit = async (submittedAnswer: AnswerValue | null = answer) => {
    if (!question || !hasAnswer(submittedAnswer)) return;
    setIsSubmitting(true);

    try {
      let answerToSend: AnswerValue = submittedAnswer as AnswerValue;

      if (question.type === "MCQ" && typeof submittedAnswer === "string") {
        answerToSend = translatedData.translatedToOriginal(submittedAnswer);
      } else if (question.type === "Ordering" && Array.isArray(submittedAnswer)) {
        answerToSend = (submittedAnswer as string[]).map((item) =>
          translatedData.translatedToOriginal(item),
        );
      } else if (question.type === "Video" && typeof submittedAnswer === "string") {
        answerToSend = translatedData.translatedToOriginal(submittedAnswer);
      }

      const response = await submitModuleAnswer({
        moduleId: details.module._id,
        questionId: question.id,
        answer: answerToSend,
      });

      if (!response.success) throw new Error(response.message);

      const rawCorrectAnswer = response.data.correctAnswer;
      const translatedCorrectAnswer =
        typeof rawCorrectAnswer === "string"
          ? translatedData.originalToTranslated(rawCorrectAnswer)
          : rawCorrectAnswer;

      const rawExplanation = response.data.explanation;
      const translatedExplanation =
        typeof rawExplanation === "string"
          ? translatedData.originalToTranslated(rawExplanation)
          : rawExplanation;

      const isLastQuestion = currentIndex >= totalQuestions - 1;
      const shouldForceCompletion =
        isLastQuestion &&
        !(question.type === "Ordering" && response.data.isCorrect === false);

      const nextResult = shouldForceCompletion
        ? {
          ...response.data,
          correctAnswer: translatedCorrectAnswer,
          explanation: translatedExplanation,
          moduleStatus:
            response.data.moduleStatus === "completed"
              ? response.data.moduleStatus
              : "completed",
          progressPercentage: Math.max(
            response.data.progressPercentage ?? 0,
            100,
          ),
          completedQuestions: Math.max(
            response.data.completedQuestions ?? 0,
            totalQuestions,
          ),
        }
        : {
          ...response.data,
          correctAnswer: translatedCorrectAnswer,
          explanation: translatedExplanation,
        };

      setResult(nextResult);
      setFinalResult(nextResult);
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Unable to submit your answer",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryOrdering = () => {
    setResult(undefined);
  };

  const handleContinue = () => {
    if (!result) return;

    if (
      result.moduleStatus === "completed" ||
      currentIndex >= totalQuestions - 1
    ) {
      setIsCompleted(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setAnswer(initialAnswer(activeModule.questions[nextIndex]));
    setResult(undefined);
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStarted || isCompleted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCompleted, isStarted]);

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

  useEffect(() => {
    if (!result || result.explanation) return;

    const hasCorrectAnswer = Boolean(
      (question?.isScored || question?.isScored === undefined) &&
      ((result?.correctAnswer && typeof result.correctAnswer === "string" && result.correctAnswer.trim().length > 0) ||
       (question?.correctAnswer && typeof question.correctAnswer === "string" && question.correctAnswer.trim().length > 0))
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
      (!question.options || question.options.length === 0)
    ) {
      delay = 300;
    } else if (!hasCorrectAnswer) {
      delay = 300;
    }

    if (delay === null) return;

    const timer = window.setTimeout(() => {
      if (
        result.moduleStatus === "completed" ||
        currentIndex >= totalQuestions - 1
      ) {
        setIsCompleted(true);
        return;
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnswer(initialAnswer(activeModule.questions[nextIndex]));
      setResult(undefined);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [currentIndex, activeModule.questions, question, result, totalQuestions]);

  const isModuleScored = activeModule.questions.some(
    (q) => q.isScored === true || String(q.isScored) === "true",
  );

  if (isLoadingTranslations) {
    return <ModuleRunnerSkeleton />;
  }

  if (!isStarted && !isCompleted) {
    return (
      <div className="-m-3 flex flex-1 h-[calc(100%+1.5rem)] min-h-[calc(100%+1.5rem)] flex-col overflow-hidden">
        <SurveyIntro
          title={activeModule.title}
          description={activeModule.description}
          badge="Leermodule"
          imageUrl={activeModule.thumbnailImage || "/window.svg"}
          questionCount={activeModule.questions.length}
          format="Interactief"
          startLabel={userProgress.completedQuestions > 0 ? "Doorgaan" : "Starten"}
          onStart={() => setIsStarted(true)}
        />
      </div>
    );
  }

  if (isCompleted) {
    const formattedTitle = activeModule.title?.trim()
      ? `"${activeModule.title.trim()}"`
      : "deze module";

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
                  <p className="text-xl font-bold text-primary">
                    {finalResult?.moduleScore ??
                      userProgress.answers?.reduce(
                        (acc, ans) => acc + (ans.score || 0),
                        0,
                      ) ??
                      0}
                  </p>
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
                {activeModule.title?.trim()
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
              size="lg-full"
              onClick={() => router.push("/modules")}
            >
              Terug naar leerpad <ArrowRight />
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

  const displayedProgress = result
    ? result.progressPercentage
    : Math.max(
      localProgress,
      (currentIndex / Math.max(totalQuestions, 1)) * 100,
    );
  const isSimulatedCall = question.type === "Simulated Call";
  const questionBackgroundColor = /^#[0-9A-Fa-f]{6}$/.test(
    question.colorCode || "",
  )
    ? question.colorCode
    : undefined;
  const isDarkBg = isDarkColor(questionBackgroundColor);
  const isOrderingRetry =
    question.type === "Ordering" && result?.isCorrect === false;

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-secondary p-2.5 sm:p-4 text-foreground animate-fadeIn",
        isSimulatedCall && "p-0 bg-black text-white",
      )}
      style={{
        backgroundColor: isSimulatedCall ? undefined : questionBackgroundColor,
      }}
    >
      {!isSimulatedCall && (
        <div className="mb-2 shrink-0 px-1 py-1">
          <h2
            className={cn(
              "mb-1 font-heading text-base sm:text-lg font-bold leading-snug truncate",
              questionBackgroundColor
                ? isDarkBg
                  ? "text-white drop-shadow-sm"
                  : "text-zinc-950"
                : "text-secondary-foreground",
            )}
          >
            {activeModule.title}
          </h2>
          <div className="flex flex-col gap-1">
            <div className="flex items-center">
              <span
                className={cn(
                  "rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none shadow-xs",
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
              ? "relative h-full w-full overflow-hidden rounded-none bg-black p-0 pb-0"
              : "space-y-2.5",
          )}
        >
          {question.type !== "Swipe" &&
            question.type !== "Simulated Call" &&
            question.type !== "Chat Scenario" && (
              <QuestionPromptCard question={question} />
            )}

          <QuestionAnswer
            question={question}
            answer={answer}
            disabled={Boolean(result) || isSubmitting}
            onAnswer={setAnswer}
            onSwipe={(direction) => {
              setAnswer(direction);
              void handleSubmit(direction);
            }}
            onAutoSubmit={(ans) => {
              void handleSubmit(ans);
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
        <div className="mt-auto shrink-0 pt-1.5 [&_button]:bg-background [&_button]:text-foreground [&_button]:hover:bg-background/90">
          {result ? (
            isOrderingRetry ? (
              <Button
                size="lg-full"
                onClick={handleRetryOrdering}
              >
                Opnieuw proberen
                <ArrowRight />
              </Button>
            ) : (
              <Button size="lg-full" onClick={handleContinue}>
                {currentIndex === totalQuestions - 1 ||
                  result.moduleStatus === "completed"
                  ? "Bekijk resultaat"
                  : "Verder"}
                <ArrowRight />
              </Button>
            )
          ) : (
            <Button
              size="lg-full"
              aria-busy={isSubmitting}
              disabled={!hasAnswer(answer) || isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Laden...
                </>
              ) : (
                <>
                  {question?.type === "Information" ? "Verder" : "Volgende"}
                  <ArrowRight />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
