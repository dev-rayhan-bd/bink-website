"use client";

import { useEffect, useState, useRef } from "react";
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
import { submitModuleAnswer } from "@/services/user-progress.service";
import AnimationWrapper from "@/components/ui/custom/animation-wrapper";
import { SurveyIntro } from "./SurveyIntro";
import { QuestionAnswer } from "./module-runner/QuestionAnswer";
import { QuestionPromptCard } from "./module-runner/QuestionPromptCard";
import { initialAnswer, hasAnswer } from "./module-runner/answer-utils";
import type { AnswerValue } from "./module-runner/types";

export function ModuleSurveyRunner({
  details,
}: {
  details: UserModuleDetails;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}) {
  const router = useRouter();
  const { module, userProgress } = details;
  const startingIndex = Math.min(
    userProgress.completedQuestions,
    Math.max(module.questions.length - 1, 0),
  );
  const [isStarted, setIsStarted] = useState(
    userProgress.status === "in_progress",
  );
  const [isCompleted, setIsCompleted] = useState(
    userProgress.status === "completed",
  );
  const [currentIndex, setCurrentIndex] = useState(startingIndex);
  const [answer, setAnswer] = useState<AnswerValue | null>(() =>
    initialAnswer(module.questions[startingIndex]),
  );
  const [result, setResult] = useState<SubmitModuleAnswerResult>();
  const [finalResult, setFinalResult] = useState<SubmitModuleAnswerResult>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = module.questions[currentIndex];
  const totalQuestions = module.questions.length;
  const localProgress =
    result?.progressPercentage ?? userProgress.progressPercentage;

  const handleSubmit = async (submittedAnswer: AnswerValue | null = answer) => {
    if (!question || !hasAnswer(submittedAnswer)) return;
    setIsSubmitting(true);

    try {
      const response = await submitModuleAnswer({
        moduleId: module._id,
        questionId: question.id,
        answer: submittedAnswer as AnswerValue,
      });

      if (!response.success) throw new Error(response.message);
      const isLastQuestion = currentIndex >= totalQuestions - 1;
      const shouldForceCompletion =
        isLastQuestion &&
        !(question.type === "Ordering" && response.data.isCorrect === false);
      const nextResult = shouldForceCompletion
        ? {
            ...response.data,
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
        : response.data;
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
    setAnswer(initialAnswer(module.questions[nextIndex]));
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

    let delay: number | null = null;
    if (question?.type === "Simulated Call") delay = 650;
    else if (question?.type === "Information") delay = 300;
    else if (question?.type === "Swipe") delay = 100;
    else if (question?.type === "Rating") delay = 400;
    else if (question?.type === "Free Input") delay = 400;

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
      setAnswer(initialAnswer(module.questions[nextIndex]));
      setResult(undefined);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [currentIndex, module.questions, question?.type, question?.isScored, result, totalQuestions]);

  const isModuleScored = module.questions.some(
    (q) => q.isScored === true || String(q.isScored) === "true",
  );
  const isQuestionScored = Boolean(question?.isScored);

  if (!isStarted && !isCompleted) {
    return (
      <div className="-m-3 flex flex-1 h-[calc(100%+1.5rem)] min-h-[calc(100%+1.5rem)] flex-col overflow-hidden">
        <SurveyIntro
          title={module.title}
          description={module.description}
          badge="Leermodule"
          imageUrl={module.thumbnailImage || "/window.svg"}
          questionCount={module.questions.length}
          format="Interactief"
          startLabel={userProgress.completedQuestions > 0 ? "Doorgaan" : "Start"}
          onStart={() => setIsStarted(true)}
        />
      </div>
    );
  }

  if (isCompleted) {
    const formattedTitle = module.title?.trim()
      ? `"${module.title.trim()}"`
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
                {module.title?.trim()
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
  const canShowCorrectAnswer =
    isQuestionScored &&
    result?.isCorrect !== null &&
    result?.isCorrect !== undefined &&
    ![
      "Information",
      "Rating",
      "Free Input",
      "Simulated Call",
    ].includes(question.type);
  const isOptionFeedback =
    ["MCQ", "Chat Scenario", "Video"].includes(question.type) &&
    isQuestionScored &&
    Boolean(result);
  const hasFeedbackCorrectAnswer =
    result?.correctAnswer !== undefined &&
    result?.correctAnswer !== null &&
    !(
      typeof result.correctAnswer === "string" &&
      result.correctAnswer.trim() === ""
    );
  const isOrderingRetry =
    question.type === "Ordering" && result?.isCorrect === false;
  const feedbackTitle = canShowCorrectAnswer
    ? result?.isCorrect === false
      ? "Niet helemaal goed"
      : result?.isCorrect === true
        ? "Juist antwoord"
        : "Antwoord verzonden"
    : question.type === "Information" && answer === "reviewed"
      ? "Bekeken"
      : "Antwoord verzonden";

  const getFormattedCorrectAnswer = (
    correct: AnswerValue | string | string[] | undefined,
  ) => {
    if (!correct) return "";
    if (question.type === "Swipe") {
      if (correct === "left") return question.leftLabel || "Nee";
      if (correct === "right") return question.rightLabel || "Ja";
      return String(correct);
    }
    if (Array.isArray(correct)) {
      return correct.join(" -> ");
    }
    return String(correct);
  };

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
            {module.title}
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
            (question.type !== "Information" || result.explanation) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-auto!"
            >
              <div className="space-y-3">
                {isOptionFeedback ? (
                  <div
                    className={cn(
                      "min-w-0 rounded-2xl border bg-white p-3.5 text-sm font-medium shadow-sm wrap-break-word dark:bg-card",
                      result.isCorrect === false
                        ? "border-2 border-destructive text-destructive"
                        : result.isCorrect === true
                          ? "border-2 border-success text-success"
                          : "border-border text-foreground",
                    )}
                  >
                    {result.isCorrect === false
                      ? hasFeedbackCorrectAnswer
                        ? "Helaas, het juiste antwoord is gemarkeerd."
                        : "Helaas."
                      : result.isCorrect === true
                        ? hasFeedbackCorrectAnswer
                          ? "Juist - antwoord is gemarkeerd."
                          : "Juist."
                        : "Antwoord verzonden."}
                  </div>
                ) : isQuestionScored && !["Rating", "Free Input", "Information"].includes(question.type) ? (
                  <div
                    className={cn(
                      "min-w-0 overflow-hidden rounded-2xl border bg-white p-3.5 text-sm shadow-sm wrap-break-word dark:bg-card",
                      result.isCorrect === false
                        ? "border-2 border-destructive text-destructive"
                        : result.isCorrect === true
                          ? "border-2 border-success text-foreground"
                          : "border-2 border-border text-foreground",
                    )}
                  >
                    <p className="font-semibold">{feedbackTitle}</p>
                    {isOrderingRetry && (
                      <p className="mt-2 wrap-break-word font-medium">
                        Zet de onderdelen in de juiste volgorde en probeer opnieuw.
                      </p>
                    )}
                    {canShowCorrectAnswer &&
                      !isOrderingRetry &&
                      result.isCorrect === false &&
                      result.correctAnswer && (
                        <p className="mt-2 wrap-break-word font-medium">
                          Juiste antwoord:{" "}
                          {getFormattedCorrectAnswer(result.correctAnswer)}
                        </p>
                      )}
                  </div>
                ) : null}
                {result.explanation && !isOrderingRetry && (
                  <div className="min-w-0 rounded-2xl border border-border bg-white p-3.5 text-sm shadow-sm wrap-break-word dark:bg-card">
                    <span className="font-bold text-foreground">Feedback: </span>
                    <span className="text-foreground/90">{result.explanation}</span>
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
