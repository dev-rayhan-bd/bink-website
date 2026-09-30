/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, MessageCircle, Sparkles, XCircle } from "lucide-react";
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
  online: "Online",
  conversationComplete: "Gesprek voltooid",
};

export function ChatScenarioQuestion({
  question,
  disabled = false,
  onAnswer,
  onAutoSubmit,
}: ChatScenarioQuestionProps) {
  // Normalize chat steps from either branching `chatSteps` or legacy `messages`/`options`
  const steps: IChatStep[] = Array.isArray(question.chatSteps) && question.chatSteps.length > 0
    ? question.chatSteps
    : [
        {
          stepId: "step-1",
          messages: (question.messages ?? []).map((msg) => ({
            sender: msg.sender || question.senderName || "Klant",
            text: msg.text || "",
            isUser: false,
          })),
          options: (question.options ?? []).map((opt, index) => ({
            optionId: `opt-${index + 1}`,
            text: opt,
            nextStepId: null,
            feedback: "",
            isCorrect: question.correctAnswer ? question.correctAnswer === opt : false,
          })),
        },
      ];

  const senderName = question.senderName || steps[0]?.messages?.[0]?.sender || "Klant";
  const senderAvatar = question.senderAvatar;

  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<IChatStepOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    isCorrect?: boolean;
  } | null>(null);
  const [userSelections, setUserSelections] = useState<UserSelection[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const activeStepTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [visibleMessages, isTyping, showOptions, feedback, scrollToBottom]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      activeStepTimeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  // Display a step with realistic typing delay
  const playStep = useCallback(
    (stepId: string) => {
      const step = steps.find((s) => s.stepId === stepId);
      if (!step) {
        setIsCompleted(true);
        return;
      }

      setCurrentStepId(stepId);
      setShowOptions(false);
      setFeedback(null);

      const stepMessages = step.messages.filter((m) => m.text.trim().length > 0);

      if (stepMessages.length === 0) {
        setShowOptions(true);
        setCurrentOptions(step.options ?? []);
        if (!step.options || step.options.length === 0) {
          setIsCompleted(true);
        }
        return;
      }

      // Chain message delivery with typing indicators
      let accumulatedDelay = 250;

      stepMessages.forEach((msg, idx) => {
        // Show typing indicator
        const typingTimer = setTimeout(() => {
          setIsTyping(true);
        }, accumulatedDelay);
        activeStepTimeoutRef.current.push(typingTimer);

        accumulatedDelay += 650 + Math.min(msg.text.length * 15, 600);

        // Deliver message & hide typing
        const messageTimer = setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((prev) => [
            ...prev,
            {
              id: `${stepId}-${idx}-${Date.now()}`,
              sender: msg.sender || senderName,
              text: msg.text,
              isUser: msg.isUser ?? false,
            },
          ]);
        }, accumulatedDelay);
        activeStepTimeoutRef.current.push(messageTimer);

        accumulatedDelay += 350;
      });

      // After all messages, display response options
      const optionsTimer = setTimeout(() => {
        setIsTyping(false);
        const optionsList = step.options ?? [];
        setCurrentOptions(optionsList);
        setShowOptions(true);

        if (optionsList.length === 0) {
          setIsCompleted(true);
        }
      }, accumulatedDelay);
      activeStepTimeoutRef.current.push(optionsTimer);
    },
    [senderName, steps],
  );

  // Initialize conversation on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const startStepId = question.initialStepId || steps[0]?.stepId || "step-1";
    playStep(startStepId);
  }, [playStep, question.initialStepId, steps]);

  // Handle participant response selection
  const handleSelectOption = async (option: IChatStepOption) => {
    if (disabled || isTyping) return;

    // 1. Hide response options immediately
    setShowOptions(false);

    // 2. Add user's selected choice to messages (Right-aligned bubble)
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
      ...userSelections,
      { stepId: currentStepId || "", optionId: option.optionId },
    ];
    setUserSelections(updatedSelections);

    // 3. Show feedback if option contains feedback
    const hasFeedback = option.feedback && option.feedback.trim().length > 0;
    if (hasFeedback) {
      setFeedback({
        text: option.feedback!.trim(),
        isCorrect: option.isCorrect,
      });
    }

    // 4. Branching navigation
    const feedbackWaitTime = hasFeedback ? 1600 : 400;

    const navTimer = setTimeout(() => {
      if (option.nextStepId) {
        playStep(option.nextStepId);
      } else {
        // Conversation reached terminal node
        setIsCompleted(true);
        setFeedback(null);
      }
    }, feedbackWaitTime);
    activeStepTimeoutRef.current.push(navTimer);
  };

  // Sync completion with parent survey runner
  useEffect(() => {
    if (isCompleted) {
      const finalPayload = userSelections.length > 0 ? userSelections : "completed";
      onAnswer(finalPayload);
      if (onAutoSubmit) {
        onAutoSubmit(finalPayload);
      }
    }
  }, [isCompleted, onAnswer, onAutoSubmit, userSelections]);

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
            <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-zinc-900 bg-emerald-500 shadow-xs" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-heading text-sm font-bold text-white">
                {senderName}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-emerald-400">
                {CHAT_LABELS.online}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
            <MessageCircle className="size-3 text-primary" />
            <span>Chat</span>
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
      <div className="flex min-h-[260px] max-h-[50dvh] flex-1 flex-col space-y-3 overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden">
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
        <div className="relative z-20 border-t border-white/10 bg-zinc-900 p-3.5 space-y-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {CHAT_LABELS.chooseResponse}
          </p>
          <div className="space-y-2 max-h-[30dvh] overflow-y-auto pr-1">
            {currentOptions.map((option, idx) => (
              <button
                key={option.optionId || `opt-${idx}`}
                type="button"
                disabled={disabled || isTyping}
                onClick={() => void handleSelectOption(option)}
                className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-white/15 bg-zinc-800/90 p-3 text-left text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-zinc-700/90 hover:border-primary/60 active:scale-[0.99] cursor-pointer disabled:pointer-events-none disabled:opacity-50"
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
