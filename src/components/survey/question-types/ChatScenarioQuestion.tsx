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
  const senderName = question.senderName?.trim() || "Klant";
  const senderAvatar = question.senderAvatar;

  // Normalize chat steps from branching `chatSteps` or legacy `messages`/`options`
  const steps = useMemo<IChatStep[]>(() => {
    // 1. If branching chatSteps exist
    if (Array.isArray(question.chatSteps) && question.chatSteps.length > 0) {
      return question.chatSteps.map((step, sIdx) => {
        const stepId = step.stepId || `step-${sIdx + 1}`;

        // Normalize messages
        const messages = (Array.isArray(step.messages) ? step.messages : [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((m: any) => ({
            sender: m?.sender || senderName,
            text: typeof m?.text === "string" ? m.text : typeof m === "string" ? m : "",
            isUser: Boolean(m?.isUser),
          }))
          .filter((m) => m.text.trim().length > 0);

        // Normalize options
        const options: IChatStepOption[] = (Array.isArray(step.options) ? step.options : [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((opt: any, oIdx: number) => {
            if (typeof opt === "object" && opt !== null) {
              return {
                optionId: opt.optionId || `opt-${sIdx + 1}-${oIdx + 1}`,
                text: typeof opt.text === "string" ? opt.text : "",
                nextStepId: opt.nextStepId || null,
                feedback: typeof opt.feedback === "string" ? opt.feedback : "",
                isCorrect: typeof opt.isCorrect === "boolean" ? opt.isCorrect : oIdx === 0,
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
                        : "Hallo, hoe kan ik je helpen?",
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
                      : "Hallo, hoe kan ik je helpen?",
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
    // Small timeout to allow DOM layout to settle before scrolling
    const timer = setTimeout(() => {
      scrollToBottom(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [visibleMessages, isTyping, showOptions, feedback, scrollToBottom]);

  // Display a step with snappy typing delays
  const playStep = useCallback(
    (stepId: string) => {
      // Clear any pending timers from previous steps
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

      let accumulatedDelay = 100;

      stepMessages.forEach((msg, idx) => {
        // 1. Start typing indicator
        const typingTimer = setTimeout(() => {
          setIsTyping(true);
        }, accumulatedDelay);
        activeStepTimeoutRef.current.push(typingTimer);

        // Typing duration based on text length (snappy 300ms - 600ms)
        const typingDuration = 300 + Math.min(msg.text.length * 8, 300);
        accumulatedDelay += typingDuration;

        // 2. Reveal message and stop typing
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

        // Small gap between messages
        accumulatedDelay += 150;
      });

      // 3. Reveal response options after last message
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

    // 1. Check if option has an explicit nextStepId pointing to an existing step
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

    // 2. If no explicit nextStepId and not explicitly set to __end__, advance to next sequential step in the tree
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
    <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-black/10 bg-zinc-950 text-white shadow-xl dark:border-white/15">
      {/* ── Chat Header (Messenger Style) ── */}
      <div className="relative z-20 flex items-center justify-between border-b border-white/10 bg-zinc-900/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with live online dot */}
          <div className="relative size-10 shrink-0">
            <div className="size-full overflow-hidden rounded-full border border-white/20 bg-zinc-800">
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
                <div className="flex size-full items-center justify-center bg-gradient-to-tr from-primary/80 to-primary text-sm font-bold text-white uppercase">
                  {senderName.slice(0, 2)}
                </div>
              )}
            </div>
            {/* Green Online Dot */}
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-zinc-900 bg-emerald-500 shadow-xs" />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <span className="truncate font-heading text-sm font-bold text-white">
              {senderName}
            </span>
          </div>
        </div>
      </div>

      {/* ── Context Image (D3 requirement) ── */}
      {question.image && (
        <div className="relative w-full overflow-hidden border-b border-white/10 max-h-[22dvh] shrink-0 bg-black">
          <MediaImage
            value={question.image as MediaValue}
            alt="Context"
            className="block h-full w-full object-cover object-center"
          />
        </div>
      )}

      {/* ── Scenario Instruction / Description Pill ── */}
      {question.content && question.content.trim().length > 0 && (
        <div className="border-b border-white/5 bg-zinc-900/40 px-4 py-2 text-center text-xs text-zinc-300">
          <span className="font-medium text-white/90">{question.content}</span>
        </div>
      )}

      {/* ── Chat Messages Scroll Area ── */}
      <div
        ref={chatScrollContainerRef}
        className="flex min-h-[140px] max-h-[55dvh] flex-1 flex-col space-y-3 overflow-y-auto overscroll-contain p-4 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {visibleMessages.map((msg, index) => {
          const isFirstInGroup =
            index === 0 || visibleMessages[index - 1]?.sender !== msg.sender;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200",
                msg.isUser ? "items-end" : "items-start",
              )}
            >
              {/* Sender Name above other person's first bubble */}
              {!msg.isUser && isFirstInGroup && (
                <span className="mb-1 ml-1 text-[11px] font-semibold text-zinc-400">
                  {msg.sender}
                </span>
              )}

              <div
                className={cn(
                  "max-w-[82%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word shadow-md",
                  msg.isUser
                    ? "rounded-2xl rounded-tr-xs bg-primary font-medium text-primary-foreground"
                    : "rounded-2xl rounded-tl-xs border border-white/10 bg-zinc-800/90 text-zinc-100",
                )}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator (D6) */}
        {isTyping && (
          <div className="flex items-start gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-white/10 bg-zinc-800/90 px-3.5 py-2.5 shadow-sm">
              <span className="size-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="size-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="size-2 rounded-full bg-zinc-400 animate-bounce" />
              <span className="ml-1 text-[11px] font-medium text-zinc-400">
                {CHAT_LABELS.typing}
              </span>
            </div>
          </div>
        )}

        {/* Feedback Toast after response selection (D6) */}
        {feedback && (
          <div
            className={cn(
              "my-2 rounded-xl p-3 text-xs leading-relaxed font-medium shadow-md transition-all animate-in fade-in zoom-in-95 duration-200",
              feedback.isCorrect === true &&
                "border border-emerald-500/40 bg-emerald-950/70 text-emerald-300",
              feedback.isCorrect === false &&
                "border border-rose-500/40 bg-rose-950/70 text-rose-300",
              feedback.isCorrect === undefined &&
                "border border-primary/40 bg-primary/20 text-white",
            )}
          >
            <div className="flex items-start gap-2">
              {feedback.isCorrect === true && (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              )}
              {feedback.isCorrect === false && (
                <XCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              {feedback.isCorrect === undefined && (
                <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
              )}
              <span className="flex-1">{feedback.text}</span>
            </div>
          </div>
        )}

        {/* Completed banner */}
        {isCompleted && (
          <div className="my-2 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 py-2.5 text-xs font-bold text-emerald-400 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <span>{CHAT_LABELS.conversationComplete}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Response Choices (Bottom Sheet / Buttons) ── */}
      {showOptions && currentOptions.length > 0 && !isCompleted && (
        <div className="relative z-20 shrink-0 border-t border-white/10 bg-zinc-900 p-3 space-y-2 animate-in slide-in-from-bottom-3 duration-200">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {CHAT_LABELS.chooseResponse}
          </p>
          <div className="space-y-2 max-h-[46dvh] overflow-y-auto pr-1">
            {currentOptions.map((option, idx) => (
              <button
                key={option.optionId || `opt-${idx}`}
                type="button"
                disabled={disabled || isTyping}
                onClick={() => handleSelectOption(option)}
                className="group flex w-full min-w-0 items-center justify-between gap-2.5 rounded-xl border border-white/15 bg-zinc-800/90 px-3.5 py-2.5 text-left text-xs sm:text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-zinc-700/90 hover:border-primary/60 active:scale-[0.99] cursor-pointer disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="min-w-0 flex-1 leading-snug whitespace-pre-wrap wrap-break-word">
                  {option.text}
                </span>
                <span className="size-5 shrink-0 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[10px] text-zinc-400 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
