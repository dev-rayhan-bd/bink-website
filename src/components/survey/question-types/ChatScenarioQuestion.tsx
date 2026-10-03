/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaImage } from "../module-runner/media";
import type { AnswerValue, MediaValue } from "../module-runner/types";
import type { IChatStep, IChatStepOption, ModuleQuestion } from "@/lib/types/module.type";

interface ChatScenarioQuestionProps {
  question: ModuleQuestion;
  disabled?: boolean;
  onAnswer: (answer: AnswerValue) => void;
  onAutoSubmit?: (answer: AnswerValue) => void;
}

interface VisibleMessage {
  id: string;
  sender: string;
  text: string;
  isUser: boolean;
}

interface UserSelection {
  stepId: string;
  optionId: string;
}

const CHAT_LABELS = {
  chooseResponse: "KIES JE REACTIE",
  typing: "aan het typen...",
  conversationComplete: "Gesprek voltooid",
};

export function ChatScenarioQuestion({
  question,
  disabled = false,
  onAnswer,
  onAutoSubmit,
}: ChatScenarioQuestionProps) {
  const senderName = question.senderName?.trim() || "Henkie Penkie";
  const senderAvatar = question.senderAvatar;

  // Normalize chat steps from branching `chatSteps` or legacy `messages`/`options`
  const steps = useMemo<IChatStep[]>(() => {
    // 1. If branching chatSteps exist
    if (Array.isArray(question.chatSteps) && question.chatSteps.length > 0) {
      return question.chatSteps.map((step, sIdx) => {
        const stepId = step.stepId || `step-${sIdx + 1}`;

        // Normalize messages
        const messages = (Array.isArray(step.messages) ? step.messages : [])
          .map((m: unknown) => {
            const mObj = (typeof m === "object" && m !== null ? m : {}) as Record<string, unknown>;
            return {
              sender: typeof mObj.sender === "string" ? mObj.sender : senderName,
              text: typeof mObj.text === "string" ? mObj.text : typeof m === "string" ? m : "",
              isUser: Boolean(mObj.isUser),
            };
          })
          .filter((m) => m.text.trim().length > 0);

        // Normalize options
        const options: IChatStepOption[] = (Array.isArray(step.options) ? step.options : [])
          .map((opt: unknown, oIdx: number) => {
            if (typeof opt === "object" && opt !== null) {
              const optObj = opt as Record<string, unknown>;
              return {
                optionId: typeof optObj.optionId === "string" ? optObj.optionId : `opt-${sIdx + 1}-${oIdx + 1}`,
                text: typeof optObj.text === "string" ? optObj.text : "",
                nextStepId: typeof optObj.nextStepId === "string" ? optObj.nextStepId : null,
                feedback: typeof optObj.feedback === "string" ? optObj.feedback : "",
                isCorrect: typeof optObj.isCorrect === "boolean" ? optObj.isCorrect : oIdx === 0,
              };
            }
            return {
              optionId: `opt-${sIdx + 1}-${oIdx + 1}`,
              text: String(opt || ""),
              nextStepId: null,
              feedback: "",
              isCorrect: oIdx === 0,
            };
          })
          .filter((o) => o.text.trim().length > 0);

        // Fallback message for the first step if no non-empty text was provided
        const fallbackMessages =
          messages.length > 0
            ? messages
            : sIdx === 0
              ? [
                {
                  sender: senderName,
                  text:
                    question.content && question.content.trim().length > 0
                      ? question.content.trim()
                      : "Hallo, dit is een test.",
                  isUser: false,
                },
              ]
              : [];

        return {
          stepId,
          messages: fallbackMessages,
          options,
        };
      });
    }

    // 2. Legacy fallback from question.messages / question.options / question.content
    const legacyOptions: IChatStepOption[] = Array.isArray(question.options)
      ? question.options
        .map((opt: unknown, index: number) => {
          if (typeof opt === "object" && opt !== null) {
            const optObj = opt as Record<string, unknown>;
            return {
              optionId: typeof optObj.optionId === "string" ? optObj.optionId : `opt-1-${index + 1}`,
              text: typeof optObj.text === "string" ? optObj.text : "",
              nextStepId: typeof optObj.nextStepId === "string" ? optObj.nextStepId : null,
              feedback: typeof optObj.feedback === "string" ? optObj.feedback : "",
              isCorrect:
                typeof optObj.isCorrect === "boolean" ? optObj.isCorrect : index === 0,
            };
          }
          return {
            optionId: `opt-1-${index + 1}`,
            text: String(opt || ""),
            nextStepId: null,
            feedback: "",
            isCorrect: question.correctAnswer
              ? question.correctAnswer === opt
              : index === 0,
          };
        })
        .filter((o) => o.text.trim().length > 0)
      : [];

    const legacyMessages = Array.isArray(question.messages) && question.messages.length > 0
      ? question.messages
        .map((m) => ({
          sender: m.sender || senderName,
          text: typeof m.text === "string" ? m.text : "",
          isUser: Boolean(m.isUser),
        }))
        .filter((m) => m.text.trim().length > 0)
      : [];

    return [
      {
        stepId: "step-1",
        messages:
          legacyMessages.length > 0
            ? legacyMessages
            : [
              {
                sender: senderName,
                text:
                  question.content && question.content.trim().length > 0
                    ? question.content.trim()
                    : "Hallo, dit is een test.",
                isUser: false,
              },
            ],
        options: legacyOptions,
      },
    ];
  }, [
    question.chatSteps,
    question.options,
    question.messages,
    question.content,
    question.correctAnswer,
    senderName,
  ]);

  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<IChatStepOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect?: boolean;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeStepTimeoutRef = useRef<NodeJS.Timeout[]>([]);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;

  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit;

  const userSelectionsRef = useRef<UserSelection[]>([]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [visibleMessages, isTyping, showOptions, feedback, scrollToBottom]);

  // Display a step with snappy typing delays
  const playStep = useCallback(
    (stepId: string) => {
      activeStepTimeoutRef.current.forEach(clearTimeout);
      activeStepTimeoutRef.current = [];

      const currentSteps = stepsRef.current;
      const step =
        currentSteps.find((s) => s.stepId === stepId) ||
        currentSteps.find((s) => s.stepId === question.initialStepId) ||
        currentSteps[0];

      if (!step) {
        setIsCompleted(true);
        setIsTyping(false);
        const finalSelections =
          userSelectionsRef.current.length > 0
            ? userSelectionsRef.current
            : "completed";
        onAnswerRef.current(finalSelections);
        onAutoSubmitRef.current?.(finalSelections);
        return;
      }

      setCurrentStepId(step.stepId);
      setShowOptions(false);
      setFeedback(null);

      const stepMessages = (step.messages || []).filter(
        (m) => m && typeof m.text === "string" && m.text.trim().length > 0,
      );

      const optionsList = (step.options || []).filter(
        (o) => o && typeof o.text === "string" && o.text.trim().length > 0,
      );

      if (stepMessages.length === 0) {
        setIsTyping(false);
        setCurrentOptions(optionsList);
        setShowOptions(true);
        if (optionsList.length === 0) {
          setIsCompleted(true);
          const finalSelections =
            userSelectionsRef.current.length > 0
              ? userSelectionsRef.current
              : "completed";
          onAnswerRef.current(finalSelections);
          onAutoSubmitRef.current?.(finalSelections);
        }
        return;
      }

      let accumulatedDelay = 80;

      stepMessages.forEach((msg, idx) => {
        const typingTimer = setTimeout(() => {
          setIsTyping(true);
        }, accumulatedDelay);
        activeStepTimeoutRef.current.push(typingTimer);

        const typingDuration = 250 + Math.min(msg.text.length * 6, 250);
        accumulatedDelay += typingDuration;

        const messageTimer = setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((prev) => [
            ...prev,
            {
              id: `${step.stepId}-${idx}-${Date.now()}-${Math.random()}`,
              sender: msg.sender || senderName,
              text: msg.text,
              isUser: Boolean(msg.isUser),
            },
          ]);
        }, accumulatedDelay);
        activeStepTimeoutRef.current.push(messageTimer);

        accumulatedDelay += 120;
      });

      const optionsTimer = setTimeout(() => {
        setIsTyping(false);
        setCurrentOptions(optionsList);
        setShowOptions(true);

        if (optionsList.length === 0) {
          setIsCompleted(true);
          const finalSelections =
            userSelectionsRef.current.length > 0
              ? userSelectionsRef.current
              : "completed";
          onAnswerRef.current(finalSelections);
          onAutoSubmitRef.current?.(finalSelections);
        }
      }, accumulatedDelay);
      activeStepTimeoutRef.current.push(optionsTimer);
    },
    [question.initialStepId, senderName],
  );

  // Initialize conversation on mount / question change
  useEffect(() => {
    activeStepTimeoutRef.current.forEach(clearTimeout);
    activeStepTimeoutRef.current = [];

    setVisibleMessages([]);
    userSelectionsRef.current = [];
    setIsCompleted(false);
    setFeedback(null);
    setShowOptions(false);
    setIsTyping(false);

    const currentSteps = stepsRef.current;
    const startStepId =
      (question.initialStepId &&
        currentSteps.some((s) => s.stepId === question.initialStepId)
        ? question.initialStepId
        : undefined) ||
      currentSteps[0]?.stepId ||
      "step-1";

    playStep(startStepId);

    return () => {
      activeStepTimeoutRef.current.forEach(clearTimeout);
      activeStepTimeoutRef.current = [];
    };
  }, [question.id, question.initialStepId, playStep]);

  // Handle participant response selection
  const handleSelectOption = (option: IChatStepOption) => {
    if (disabled || isTyping || isCompleted) return;

    setShowOptions(false);

    // Add user's choice to messages
    setVisibleMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "Jij",
        text: option.text,
        isUser: true,
      },
    ]);

    const updatedSelections = [
      ...userSelectionsRef.current,
      { stepId: currentStepId || "", optionId: option.optionId },
    ];
    userSelectionsRef.current = updatedSelections;

    const hasFeedback = Boolean(
      option.feedback && option.feedback.trim().length > 0,
    );
    if (hasFeedback) {
      setFeedback({
        text: option.feedback!.trim(),
        isCorrect: option.isCorrect,
      });
    }

    const currentSteps = stepsRef.current;
    const currentStepIndex = currentSteps.findIndex(
      (s) => s.stepId === currentStepId,
    );

    let targetStepId: string | null = null;
    if (
      option.nextStepId &&
      option.nextStepId !== "__end__" &&
      option.nextStepId !== "null"
    ) {
      const stepFound = currentSteps.find(
        (s) => s.stepId === option.nextStepId,
      );
      if (stepFound) {
        targetStepId = stepFound.stepId;
      }
    }

    if (
      !targetStepId &&
      option.nextStepId !== "__end__" &&
      currentStepIndex >= 0 &&
      currentStepIndex < currentSteps.length - 1
    ) {
      const nextSequentialStep = currentSteps[currentStepIndex + 1];
      if (nextSequentialStep) {
        targetStepId = nextSequentialStep.stepId;
      }
    }

    const feedbackWaitTime = hasFeedback ? 1300 : 400;

    const navTimer = setTimeout(() => {
      if (targetStepId) {
        playStep(targetStepId);
      } else {
        setIsCompleted(true);
        setFeedback(null);
        onAnswerRef.current(updatedSelections);
        onAutoSubmitRef.current?.(updatedSelections);
      }
    }, feedbackWaitTime);
    activeStepTimeoutRef.current.push(navTimer);
  };

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col space-y-4">
      {/* ── Context Image (if present) ── */}
      {question.image && (
        <div className="relative w-full overflow-hidden rounded-md border border-border/80 max-h-[24dvh] shrink-0 bg-black/5">
          <MediaImage
            value={question.image as MediaValue}
            alt="Context"
            className="block h-full w-full object-cover object-center"
          />
        </div>
      )}

      {/* ── Chat Messages Stream (Screenshot Style: Avatar Circle + Sky Blue Speech Bubble) ── */}
      <div
        ref={chatScrollContainerRef}
        className="flex min-h-[90px] flex-col space-y-3.5"
      >
        {visibleMessages.map((msg) => {
          if (!msg.isUser) {
            // Character message: Pink ring avatar + Sky Blue / Cyan rectangular bubble
            return (
              <div
                key={msg.id}
                className="flex items-start gap-3 animate-in fade-in duration-200"
              >
                {/* Avatar with pink ring */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary overflow-hidden shadow-2xs">
                  {senderAvatar ? (
                    typeof senderAvatar === "string" ? (
                      <img
                        src={senderAvatar}
                        alt={senderName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <MediaImage
                        value={senderAvatar as MediaValue}
                        alt={senderName}
                        className="size-full object-cover"
                      />
                    )
                  ) : (
                    <div className="size-4 rounded-full border-2 border-primary" />
                  )}
                </div>

                {/* Character Cyan Speech Bubble (matching screenshot) */}
                <div className="rounded-xs bg-secondary px-4 py-2.5 text-xs sm:text-sm font-medium text-secondary-foreground shadow-2xs leading-relaxed max-w-[85%] whitespace-pre-wrap wrap-break-word">
                  {msg.text}
                </div>
              </div>
            );
          }

          // User response bubble: Right-aligned primary bubble
          return (
            <div
              key={msg.id}
              className="flex justify-end animate-in fade-in duration-200"
            >
              <div className="rounded-xs bg-primary px-4 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-2xs leading-relaxed max-w-[85%] whitespace-pre-wrap wrap-break-word">
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Character Typing Bubble */}
        {isTyping && (
          <div className="flex items-start gap-3 animate-in fade-in duration-150">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
              <div className="size-4 rounded-full border-2 border-primary" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xs bg-secondary px-4 py-3 shadow-2xs">
              <span className="size-1.5 rounded-full bg-secondary-foreground/70 animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 rounded-full bg-secondary-foreground/70 animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 rounded-full bg-secondary-foreground/70 animate-bounce" />
            </div>
          </div>
        )}

        {/* Feedback Alert with high-contrast solid card background */}
        {feedback && (
          <div
            className={cn(
              "rounded-md border-2 bg-card p-3.5 text-xs sm:text-sm leading-relaxed font-semibold shadow-sm transition-all animate-in fade-in zoom-in-95 duration-200",
              feedback.isCorrect === true &&
              "border-success text-card-foreground",
              feedback.isCorrect === false &&
              "border-destructive text-card-foreground",
              feedback.isCorrect === undefined &&
              "border-primary text-card-foreground",
            )}
          >
            <div className="flex items-start gap-2.5">
              {feedback.isCorrect === true && (
                <CheckCircle2 className="size-4.5 shrink-0 text-success mt-0.5" />
              )}
              {feedback.isCorrect === false && (
                <XCircle className="size-4.5 shrink-0 text-destructive mt-0.5" />
              )}
              {feedback.isCorrect === undefined && (
                <Sparkles className="size-4.5 shrink-0 text-primary mt-0.5" />
              )}
              <span className="flex-1">{feedback.text}</span>
            </div>
          </div>
        )}

        {/* Completed banner with high-contrast solid card background */}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2.5 rounded-md border-2 border-success bg-card py-3.5 px-4 text-xs sm:text-sm font-bold text-card-foreground shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="size-4.5 text-success shrink-0" />
            <span>{CHAT_LABELS.conversationComplete}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Response Choices Container Card (Exact Screenshot Design) ── */}
      {showOptions && currentOptions.length > 0 && !isCompleted && (
        <div className="rounded-md border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-3 animate-in fade-in duration-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            {CHAT_LABELS.chooseResponse}
          </p>

          <div className="space-y-2.5">
            {currentOptions.map((option, idx) => (
              <button
                key={option.optionId || `opt-${idx}`}
                type="button"
                disabled={disabled || isTyping}
                onClick={() => handleSelectOption(option)}
                className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-xs border border-border/80 bg-background px-4 py-3 text-left text-xs sm:text-sm font-medium text-foreground transition-all duration-150 hover:border-primary/80 hover:bg-primary/5 active:scale-[0.99] cursor-pointer disabled:pointer-events-none disabled:opacity-50 shadow-2xs"
              >
                <span className="min-w-0 flex-1 leading-snug whitespace-pre-wrap wrap-break-word">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
