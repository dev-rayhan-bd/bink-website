/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Copy,
  CornerDownRight,
  GitFork,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Smartphone,
  Trash2,
  User,
  Wand2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  IChatStep,
  IChatStepMessage,
  IChatStepOption,
} from "@/lib/types/module.type";

interface ChatScenarioEditorProps {
  questionIndex: number;
  questionErrors?: any;
  renderMediaInput: (params: {
    field:
      | "image"
      | "videoUrl"
      | "callerPhoto"
      | "postCallVideoUrl"
      | "senderAvatar";
    label: string;
    accept: string;
    hint?: string;
    error?: string;
  }) => React.ReactNode;
}

// Pre-built dialogue templates for 1-click inspiration
const SAMPLE_TEMPLATES: Record<
  string,
  { name: string; description: string; steps: IChatStep[] }
> = {
  customer_service: {
    name: "Customer Support & Empathy",
    description: "Handle a delayed delivery complaint with empathy and resolution.",
    steps: [
      {
        stepId: "step-1",
        messages: [
          {
            sender: "Henkie Penkie",
            text: "Hello! My package #8941 was supposed to arrive yesterday, but I haven't received anything yet. Where is it?",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-1-1",
            text: "I completely understand your frustration. Let me check the tracking status for #8941 right now!",
            nextStepId: "step-2",
            feedback: "Excellent! Empathetic, proactive, and directly addresses the customer's concern.",
            isCorrect: true,
          },
          {
            optionId: "opt-1-2",
            text: "Delivery isn't our department. You should call the delivery carrier yourself.",
            nextStepId: "step-3",
            feedback: "Unhelpful and dismissive. Always take ownership and support the customer directly.",
            isCorrect: false,
          },
        ],
      },
      {
        stepId: "step-2",
        messages: [
          {
            sender: "Henkie Penkie",
            text: "Thank you for checking! I really need these items for a presentation tomorrow.",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-2-1",
            text: "Great news! The driver had a minor delay, but your package is out for delivery and will arrive by 3:00 PM today.",
            nextStepId: null,
            feedback: "Perfect resolution with clear and reassuring delivery expectations!",
            isCorrect: true,
          },
          {
            optionId: "opt-2-2",
            text: "Well, if it doesn't arrive today, you can ask for a refund next week.",
            nextStepId: null,
            feedback: "Avoid pessimistic responses. Provide concrete real-time status and assistance.",
            isCorrect: false,
          },
        ],
      },
      {
        stepId: "step-3",
        messages: [
          {
            sender: "Henkie Penkie",
            text: "That is very disappointing service. I expected better help from your support team.",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-3-1",
            text: "I sincerely apologize for the initial misunderstanding. Please allow me to look up your order details right away.",
            nextStepId: null,
            feedback: "Great de-escalation! Apologizing and quickly pivoting to helpful action saves the customer relationship.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
  sales_objection: {
    name: "Sales Objection Handling",
    description: "Guide a hesitant lead who is worried about price vs. value.",
    steps: [
      {
        stepId: "step-1",
        messages: [
          {
            sender: "Henkie Penkie",
            text: "We really like your solution, but the upfront cost seems significantly higher than your competitors.",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-1-1",
            text: "I understand price is crucial. May I show you how our automation saves 15 hours per week, delivering ROI in 2 months?",
            nextStepId: "step-2",
            feedback: "Strong value framing! Shifts the focus from cost to return on investment.",
            isCorrect: true,
          },
          {
            optionId: "opt-1-2",
            text: "You get what you pay for. Cheap competitors have terrible software.",
            nextStepId: null,
            feedback: "Never badmouth competitors. Focus positively on your unique value propositions.",
            isCorrect: false,
          },
        ],
      },
      {
        stepId: "step-2",
        messages: [
          {
            sender: "Henkie Penkie",
            text: "That ROI timeline sounds interesting. Could we run a short trial with our core team first?",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-2-1",
            text: "Absolutely! Let's set up a 14-day guided pilot for your team starting this Thursday.",
            nextStepId: null,
            feedback: "Clear, actionable close with zero friction for the prospect.",
            isCorrect: true,
          },
        ],
      },
    ],
  },
};

export function ChatScenarioEditor({
  questionIndex,
  questionErrors,
  renderMediaInput,
}: ChatScenarioEditorProps) {
  const { register, watch, setValue } = useFormContext();

  const currentQuestion = watch(`questions.${questionIndex}`) || {};
  const isScored = Boolean(currentQuestion.isScored);
  const senderName = currentQuestion.senderName?.trim() || "Henkie Penkie";

  // Tab mode: Script Editor vs Live Simulator
  const [activeTab, setActiveTab] = useState<"editor" | "simulator">("editor");

  // Ensure chatSteps array is present and normalized
  const rawSteps: IChatStep[] =
    Array.isArray(currentQuestion.chatSteps) &&
    currentQuestion.chatSteps.length > 0
      ? currentQuestion.chatSteps
      : [
          {
            stepId: "step-1",
            messages: [
              {
                sender: currentQuestion.senderName || "Henkie Penkie",
                text: currentQuestion.messages?.[0]?.text || "",
                isUser: false,
              },
            ],
            options: (currentQuestion.options || ["", ""]).map(
              (opt: string, i: number) => ({
                optionId: `opt-1-${i + 1}`,
                text: typeof opt === "string" ? opt : "",
                nextStepId: null,
                feedback: "",
                isCorrect: i === 0,
              }),
            ),
          },
        ];

  const [activeStepId, setActiveStepId] = useState<string>(
    currentQuestion.initialStepId || rawSteps[0]?.stepId || "step-1",
  );
  const [viewAllSteps, setViewAllSteps] = useState(false);

  // Live Simulator state
  const [simCurrentStepId, setSimCurrentStepId] = useState<string>("step-1");
  const [simHistory, setSimHistory] = useState<
    Array<{
      type: "bot" | "user" | "feedback";
      text: string;
      sender?: string;
      isCorrect?: boolean;
    }>
  >([]);
  const [simIsFinished, setSimIsFinished] = useState(false);

  const activeStepIndex = rawSteps.findIndex((s) => s.stepId === activeStepId);
  const safeActiveIndex = activeStepIndex >= 0 ? activeStepIndex : 0;
  const activeStep = rawSteps[safeActiveIndex] || rawSteps[0];

  const updateSteps = (newSteps: IChatStep[], newActiveId?: string) => {
    setValue(`questions.${questionIndex}.chatSteps`, newSteps, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!currentQuestion.initialStepId && newSteps.length > 0) {
      setValue(`questions.${questionIndex}.initialStepId`, newSteps[0].stepId, {
        shouldDirty: true,
      });
    }
    if (newActiveId) {
      setActiveStepId(newActiveId);
    }
  };

  // Add a new step and automatically link the previous step to it
  const handleAddStep = (autoLinkFromIndex?: number) => {
    const nextStepNum = rawSteps.length + 1;
    const newStepId = `step-${nextStepNum}`;
    const newStep: IChatStep = {
      stepId: newStepId,
      messages: [
        {
          sender: senderName,
          text: "",
          isUser: false,
        },
      ],
      options: [
        {
          optionId: `opt-${nextStepNum}-1`,
          text: "",
          nextStepId: null,
          feedback: "",
          isCorrect: isScored,
        },
      ],
    };

    const linkIndex =
      typeof autoLinkFromIndex === "number"
        ? autoLinkFromIndex
        : safeActiveIndex;

    const updatedRaw = rawSteps.map((s, idx) => {
      if (
        idx === linkIndex &&
        s.options &&
        s.options.length > 0 &&
        !s.options[0].nextStepId
      ) {
        return {
          ...s,
          options: [
            { ...s.options[0], nextStepId: newStepId },
            ...s.options.slice(1),
          ],
        };
      }
      return s;
    });

    const nextSteps = [...updatedRaw, newStep];
    updateSteps(nextSteps, newStepId);
  };

  // Duplicate an existing step
  const handleDuplicateStep = (stepIdx: number) => {
    const sourceStep = rawSteps[stepIdx];
    if (!sourceStep) return;

    const nextStepNum = rawSteps.length + 1;
    const newStepId = `step-${nextStepNum}`;
    const duplicatedStep: IChatStep = {
      stepId: newStepId,
      messages: sourceStep.messages.map((m) => ({ ...m })),
      options: (sourceStep.options || []).map((o, idx) => ({
        ...o,
        optionId: `opt-${nextStepNum}-${idx + 1}-${Date.now().toString(36).slice(-3)}`,
        nextStepId: null,
      })),
    };

    const nextSteps = [...rawSteps, duplicatedStep];
    updateSteps(nextSteps, newStepId);
  };

  const handleDeleteStep = (stepIdToDelete: string) => {
    if (rawSteps.length <= 1) return;
    const nextSteps = rawSteps.filter((s) => s.stepId !== stepIdToDelete);
    const nextActive = nextSteps[0]?.stepId || "step-1";
    updateSteps(nextSteps, nextActive);
  };

  // Load a pre-built dialogue template
  const handleLoadTemplate = (templateKey: keyof typeof SAMPLE_TEMPLATES) => {
    const tpl = SAMPLE_TEMPLATES[templateKey];
    if (!tpl) return;
    const customizedSteps = tpl.steps.map((step) => ({
      ...step,
      messages: step.messages.map((m) => ({
        ...m,
        sender: senderName,
      })),
    }));
    updateSteps(customizedSteps, "step-1");
  };

  // Reset to a clean fresh 2-step scenario
  const handleResetClean = () => {
    const cleanSteps: IChatStep[] = [
      {
        stepId: "step-1",
        messages: [
          {
            sender: senderName,
            text: "",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-1-1",
            text: "",
            nextStepId: "step-2",
            feedback: "",
            isCorrect: true,
          },
          {
            optionId: "opt-1-2",
            text: "",
            nextStepId: null,
            feedback: "",
            isCorrect: false,
          },
        ],
      },
      {
        stepId: "step-2",
        messages: [
          {
            sender: senderName,
            text: "",
            isUser: false,
          },
        ],
        options: [
          {
            optionId: "opt-2-1",
            text: "",
            nextStepId: null,
            feedback: "",
            isCorrect: true,
          },
        ],
      },
    ];
    updateSteps(cleanSteps, "step-1");
  };

  // Add message bubble inside step
  const handleAddMessage = (stepIdx: number) => {
    const targetStep = rawSteps[stepIdx];
    if (!targetStep) return;
    const updatedMessages: IChatStepMessage[] = [
      ...targetStep.messages,
      {
        sender: senderName,
        text: "",
        isUser: false,
      },
    ];
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, messages: updatedMessages } : s,
    );
    updateSteps(nextSteps);
  };

  const handleDeleteMessage = (stepIdx: number, msgIndex: number) => {
    const targetStep = rawSteps[stepIdx];
    if (!targetStep || targetStep.messages.length <= 1) return;
    const updatedMessages = targetStep.messages.filter(
      (_, idx) => idx !== msgIndex,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, messages: updatedMessages } : s,
    );
    updateSteps(nextSteps);
  };

  const handleMessageChange = (
    stepIdx: number,
    msgIndex: number,
    text: string,
  ) => {
    const targetStep = rawSteps[stepIdx];
    if (!targetStep) return;
    const updatedMessages = targetStep.messages.map((m, idx) =>
      idx === msgIndex ? { ...m, text } : m,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, messages: updatedMessages } : s,
    );
    updateSteps(nextSteps);
  };

  // Add reply choice
  const handleAddOption = (stepIdx: number) => {
    const targetStep = rawSteps[stepIdx];
    if (!targetStep) return;
    const newOptNum = (targetStep.options?.length || 0) + 1;
    const newOption: IChatStepOption = {
      optionId: `opt-${stepIdx + 1}-${newOptNum}-${Date.now().toString(36).slice(-3)}`,
      text: "",
      nextStepId: null,
      feedback: "",
      isCorrect: false,
    };
    const updatedOptions = [...(targetStep.options || []), newOption];
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, options: updatedOptions } : s,
    );
    updateSteps(nextSteps);
  };

  const handleDeleteOption = (stepIdx: number, optIndex: number) => {
    const targetStep = rawSteps[stepIdx];
    if (!targetStep) return;
    const updatedOptions = (targetStep.options || []).filter(
      (_, idx) => idx !== optIndex,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, options: updatedOptions } : s,
    );
    updateSteps(nextSteps);
  };

  const handleOptionChange = (
    stepIdx: number,
    optIndex: number,
    field: keyof IChatStepOption,
    value: any,
  ) => {
    const targetStep = rawSteps[stepIdx];
    if (!targetStep) return;

    // Quick creation of next step from dropdown
    if (field === "nextStepId" && value === "__create_new__") {
      const nextStepNum = rawSteps.length + 1;
      const newStepId = `step-${nextStepNum}`;
      const newStep: IChatStep = {
        stepId: newStepId,
        messages: [{ sender: senderName, text: "", isUser: false }],
        options: [
          {
            optionId: `opt-${nextStepNum}-1`,
            text: "",
            nextStepId: null,
            feedback: "",
            isCorrect: isScored,
          },
        ],
      };
      const updatedOptions = (targetStep.options || []).map((opt, idx) =>
        idx === optIndex ? { ...opt, nextStepId: newStepId } : opt,
      );
      const nextSteps = rawSteps.map((s, idx) =>
        idx === stepIdx ? { ...s, options: updatedOptions } : s,
      );
      updateSteps([...nextSteps, newStep], newStepId);
      return;
    }

    const updatedOptions = (targetStep.options || []).map((opt, idx) =>
      idx === optIndex ? { ...opt, [field]: value } : opt,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, options: updatedOptions } : s,
    );
    updateSteps(nextSteps);
  };

  // Direct 1-click button to create and attach next step to a specific option
  const handleCreateStepForOption = (stepIdx: number, optIdx: number) => {
    const nextStepNum = rawSteps.length + 1;
    const newStepId = `step-${nextStepNum}`;
    const newStep: IChatStep = {
      stepId: newStepId,
      messages: [{ sender: senderName, text: "", isUser: false }],
      options: [
        {
          optionId: `opt-${nextStepNum}-1`,
          text: "",
          nextStepId: null,
          feedback: "",
          isCorrect: isScored,
        },
      ],
    };

    const targetStep = rawSteps[stepIdx];
    if (!targetStep) return;

    const updatedOptions = (targetStep.options || []).map((opt, idx) =>
      idx === optIdx ? { ...opt, nextStepId: newStepId } : opt,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === stepIdx ? { ...s, options: updatedOptions } : s,
    );
    updateSteps([...nextSteps, newStep], newStepId);
  };

  // ── Simulator Logic ──
  const startSimulator = () => {
    const initialId = currentQuestion.initialStepId || rawSteps[0]?.stepId || "step-1";
    setSimCurrentStepId(initialId);
    setSimIsFinished(false);
    const firstStep = rawSteps.find((s) => s.stepId === initialId) || rawSteps[0];
    if (firstStep) {
      setSimHistory(
        firstStep.messages.map((m) => ({
          type: "bot",
          text: m.text || "(Empty bot message)",
          sender: m.sender || senderName,
        })),
      );
    } else {
      setSimHistory([]);
    }
  };

  const handleSimChooseOption = (option: IChatStepOption) => {
    if (simIsFinished) return;

    const nextHistory = [
      ...simHistory,
      {
        type: "user" as const,
        text: option.text || "(Empty choice)",
      },
    ];

    if (option.feedback) {
      nextHistory.push({
        type: "feedback" as const,
        text: option.feedback,
        isCorrect: option.isCorrect,
      });
    }

    if (!option.nextStepId) {
      // End conversation
      setSimHistory(nextHistory);
      setSimIsFinished(true);
      return;
    }

    const nextStep = rawSteps.find((s) => s.stepId === option.nextStepId);
    if (!nextStep) {
      setSimHistory(nextHistory);
      setSimIsFinished(true);
      return;
    }

    // Add next step bot messages
    nextStep.messages.forEach((m) => {
      nextHistory.push({
        type: "bot" as const,
        text: m.text || "(Empty bot message)",
        sender: m.sender || senderName,
      });
    });

    setSimCurrentStepId(nextStep.stepId);
    setSimHistory(nextHistory);

    if (!nextStep.options || nextStep.options.length === 0) {
      setSimIsFinished(true);
    }
  };

  // Render a Single Step Conversation Block
  const renderStepBlock = (step: IChatStep, stepIdx: number) => {
    const isStart =
      stepIdx === 0 || step.stepId === currentQuestion.initialStepId;
    const optionCount = step.options?.length || 0;

    return (
      <div
        key={step.stepId}
        className="overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-sm transition-all hover:border-primary/40"
      >
        {/* Step Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-xs">
              {stepIdx + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Step {stepIdx + 1}
                </h4>
                {isStart ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="size-3" />
                    Conversation Start
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    ID: {step.stepId}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isStart
                  ? "The opening dialogue that the learner sees first."
                  : `Conversation continuation reached from earlier choices.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDuplicateStep(stepIdx)}
              className="cursor-pointer text-xs"
              title="Duplicate this step"
            >
              <Copy className="size-3.5" />
              <span>Duplicate</span>
            </Button>

            {rawSteps.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteStep(step.stepId)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer text-xs"
                title="Delete this step"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* ── Section A: Character Speech Bubbles ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-3.5" />
                </div>
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                  What {senderName} Says (Character Message)
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddMessage(stepIdx)}
                className="cursor-pointer text-xs font-medium"
              >
                <Plus className="size-3" />
                <span>+ Follow-up Bubble</span>
              </Button>
            </div>

            <div className="space-y-3">
              {step.messages.map((msg, msgIdx) => (
                <div
                  key={`msg-${step.stepId}-${msgIdx}`}
                  className="group relative flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4 transition-all focus-within:border-primary/60 focus-within:bg-card"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-2xs">
                    <Bot className="size-4" />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {senderName}{" "}
                        {step.messages.length > 1 && (
                          <span className="text-[10px] font-normal text-muted-foreground">
                            (Bubble #{msgIdx + 1})
                          </span>
                        )}
                      </span>
                      {step.messages.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteMessage(stepIdx, msgIdx)}
                          className="text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Remove bubble"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>

                    <Textarea
                      value={msg.text}
                      onChange={(e) =>
                        handleMessageChange(stepIdx, msgIdx, e.target.value)
                      }
                      placeholder={`Type the message ${senderName} says to the learner...`}
                      className="min-h-[75px] text-xs leading-relaxed bg-background"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Connector: Flow arrow pointing to choices */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-border/80" />
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
              <CornerDownRight className="size-3.5 text-primary" />
              <span>Learner responds with one of {optionCount} choices below</span>
            </div>
            <div className="h-px flex-1 bg-border/80" />
          </div>

          {/* ── Section B: Learner Response Choices ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground">
                  <User className="size-3.5" />
                </div>
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                  Learner Reply Options ({optionCount})
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddOption(stepIdx)}
                className="cursor-pointer text-xs font-medium"
              >
                <Plus className="size-3" />
                <span>+ Add Reply Choice</span>
              </Button>
            </div>

            {optionCount === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">
                  No reply choices added yet.
                </p>
                <p className="mt-1">
                  Without choices, the chat ends immediately after {senderName}&apos;s message.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddOption(stepIdx)}
                  className="mt-3 cursor-pointer text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add First Reply Choice</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(step.options || []).map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const hasTargetStep = Boolean(opt.nextStepId);
                  const targetStepNumber = rawSteps.findIndex(
                    (s) => s.stepId === opt.nextStepId,
                  );

                  return (
                    <div
                      key={opt.optionId || `opt-${step.stepId}-${optIdx}`}
                      className="rounded-2xl border border-border bg-muted/20 p-4 shadow-2xs transition-all focus-within:border-primary/50"
                    >
                      {/* Choice Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                            {letter}
                          </span>
                          <span className="font-heading text-xs font-bold text-foreground">
                            Choice {letter}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isScored && (
                            <label className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground cursor-pointer hover:bg-muted transition-all">
                              <input
                                type="checkbox"
                                checked={Boolean(opt.isCorrect)}
                                onChange={(e) =>
                                  handleOptionChange(
                                    stepIdx,
                                    optIdx,
                                    "isCorrect",
                                    e.target.checked,
                                  )
                                }
                                className="size-3.5 rounded accent-primary cursor-pointer"
                              />
                              <span>
                                {opt.isCorrect
                                  ? "✅ Correct Answer"
                                  : "Mark as Correct"}
                              </span>
                            </label>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteOption(stepIdx, optIdx)}
                            className="text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete this choice"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Choice Input Fields */}
                      <div className="space-y-3">
                        {/* Choice Text */}
                        <div>
                          <FieldLabel className="text-[11px] font-semibold text-muted-foreground">
                            Choice Text (What the learner clicks)
                          </FieldLabel>
                          <Input
                            value={opt.text}
                            onChange={(e) =>
                              handleOptionChange(
                                stepIdx,
                                optIdx,
                                "text",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Sure! Let me check your order tracking right now."
                            className="text-xs bg-background"
                          />
                        </div>

                        {/* Branching / Destination Setting */}
                        <div className="rounded-xl border border-border/80 bg-background/80 p-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <GitFork className="size-3.5 text-primary" />
                              <span className="text-[11px] font-bold text-foreground">
                                What happens when learner clicks Choice {letter}?
                              </span>
                            </div>

                            {hasTargetStep && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                <ArrowRight className="size-3" />
                                Leads to Step {targetStepNumber + 1}
                              </span>
                            )}
                            {!hasTargetStep && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                🏁 Ends Conversation
                              </span>
                            )}
                          </div>

                          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <Select
                              value={opt.nextStepId ?? "__end__"}
                              onValueChange={(val) =>
                                handleOptionChange(
                                  stepIdx,
                                  optIdx,
                                  "nextStepId",
                                  val === "__end__" ? null : val,
                                )
                              }
                            >
                              <SelectTrigger className="text-xs bg-background">
                                <SelectValue placeholder="Choose destination..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__end__">
                                  🛑 Finish &amp; End Conversation
                                </SelectItem>
                                <SelectItem
                                  value="__create_new__"
                                  className="font-semibold text-primary"
                                >
                                  ➕ Create &amp; Connect to New Step
                                </SelectItem>
                                {rawSteps
                                  .map((s, fullIdx) => ({ s, fullIdx }))
                                  .filter(({ s }) => s.stepId !== step.stepId)
                                  .map(({ s, fullIdx }) => {
                                    const preview = (
                                      s.messages?.[0]?.text || ""
                                    ).trim();
                                    return (
                                      <SelectItem
                                        key={s.stepId}
                                        value={s.stepId}
                                      >
                                        → Step {fullIdx + 1}: &quot;
                                        {preview
                                          ? `${preview.slice(0, 24)}${preview.length > 24 ? "..." : ""}`
                                          : `(Step ${fullIdx + 1})`}
                                        &quot;
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>

                            {!opt.nextStepId && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCreateStepForOption(stepIdx, optIdx)
                                }
                                className="cursor-pointer text-[11px] font-semibold text-primary border-primary/40 hover:bg-primary/5"
                                title="Instantly create and link the next step for this answer"
                              >
                                <Plus className="size-3" />
                                <span>+ Create Next Step for this</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Optional Explanation Feedback */}
                        <div>
                          <FieldLabel className="text-[11px] font-medium text-muted-foreground">
                            Explanation Feedback (Optional: shown to learner after selecting this choice)
                          </FieldLabel>
                          <Input
                            value={opt.feedback || ""}
                            onChange={(e) =>
                              handleOptionChange(
                                stepIdx,
                                optIdx,
                                "feedback",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Great empathetic response! Empathy helps de-escalate tension."
                            className="text-xs bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Find the step currently simulated
  const simCurrentStep = rawSteps.find(
    (s) => s.stepId === simCurrentStepId,
  );

  return (
    <div className="space-y-6">
      {/* ── Top Control Bar: Mode Tabs & Quick Templates ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
          <Button
            type="button"
            variant={activeTab === "editor" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("editor")}
            className="cursor-pointer text-xs font-semibold"
          >
            <Layers className="size-3.5" />
            <span>Dialogue Script Editor</span>
          </Button>

          <Button
            type="button"
            variant={activeTab === "simulator" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("simulator");
              startSimulator();
            }}
            className="cursor-pointer text-xs font-semibold"
          >
            <Smartphone className="size-3.5" />
            <span>Live Interactive Simulator</span>
          </Button>
        </div>

        {/* Quick Template Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            onValueChange={(val) => {
              if (val === "reset_clean") {
                handleResetClean();
              } else if (val in SAMPLE_TEMPLATES) {
                handleLoadTemplate(val as keyof typeof SAMPLE_TEMPLATES);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs font-semibold border-dashed cursor-pointer">
              <div className="flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-primary" />
                <SelectValue placeholder="⚡ Load Dialogue Template..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_service">
                🛒 Customer Support &amp; Empathy (3 Steps)
              </SelectItem>
              <SelectItem value="sales_objection">
                💼 Sales Objection Handling (2 Steps)
              </SelectItem>
              <SelectItem value="reset_clean">
                🔄 Start Fresh (Clean 2-Step Baseline)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeTab === "editor" ? (
        <div className="space-y-6">
          {/* ── Section 1: Character & Sender Profile ── */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all">
            <div className="mb-4 flex items-center gap-2.5 border-b border-border/60 pb-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="size-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground">
                  Chat Persona &amp; Character Profile
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define the character name and photo that the learner interacts with.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <Field data-invalid={Boolean(questionErrors?.senderName)}>
                <FieldLabel className="text-xs font-semibold">
                  Character Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  placeholder="e.g. Henkie Penkie or Customer Support"
                  aria-invalid={Boolean(questionErrors?.senderName)}
                  {...register(`questions.${questionIndex}.senderName`)}
                />
                {questionErrors?.senderName?.message && (
                  <FieldError>{questionErrors.senderName.message}</FieldError>
                )}
              </Field>

              <div>
                {renderMediaInput({
                  field: "senderAvatar",
                  label: "Character Photo / Avatar",
                  accept: "image/*",
                  hint: "Square avatar image shown in the live chat header.",
                  error: questionErrors?.senderAvatar?.message,
                })}
              </div>
            </div>
          </div>

          {/* ── Section 2: Conversation Storyboard & Timeline ── */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GitFork className="size-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Dialogue Flow ({rawSteps.length}{" "}
                    {rawSteps.length === 1 ? "Step" : "Steps"})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Click any step below to edit, or toggle &quot;Full Script&quot; to view everything together.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={viewAllSteps ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewAllSteps(!viewAllSteps)}
                  className="cursor-pointer text-xs"
                >
                  <Layers className="size-3.5" />
                  <span>
                    {viewAllSteps
                      ? "Single Step View"
                      : "View All Steps (Full Script)"}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStep(safeActiveIndex)}
                  className="cursor-pointer gap-1.5 border-dashed hover:border-primary hover:bg-primary/5 text-xs font-semibold"
                >
                  <Plus className="size-3.5 text-primary" />
                  <span>+ Add Step {rawSteps.length + 1}</span>
                </Button>
              </div>
            </div>

            {/* Stepper Timeline Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {rawSteps.map((step, idx) => {
                const isActive = step.stepId === activeStep.stepId;
                const isStart =
                  idx === 0 || step.stepId === currentQuestion.initialStepId;
                const previewMsg =
                  (step.messages?.[0]?.text || "").trim() || "No message...";
                const optCount = step.options?.length || 0;

                return (
                  <div key={step.stepId} className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStepId(step.stepId);
                        setViewAllSteps(false);
                      }}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition-all cursor-pointer shadow-2xs",
                        isActive && !viewAllSteps
                          ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30"
                          : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isActive && !viewAllSteps
                            ? "bg-primary-foreground text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                        )}
                      >
                        {idx + 1}
                      </span>

                      <span className="font-heading text-xs font-bold">
                        {isStart ? "📍 Start" : `Step ${idx + 1}`}
                      </span>

                      <span
                        className={cn(
                          "max-w-[100px] truncate text-[10px]",
                          isActive && !viewAllSteps
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        &quot;{previewMsg}&quot;
                      </span>

                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[9px] font-semibold",
                          isActive && !viewAllSteps
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {optCount} {optCount === 1 ? "choice" : "choices"}
                      </span>
                    </button>

                    {idx < rawSteps.length - 1 && (
                      <ArrowRight className="size-3 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Section 3: Step Content (Single or Full Script) ── */}
          {viewAllSteps ? (
            <div className="space-y-6">
              {rawSteps.map((step, sIdx) => renderStepBlock(step, sIdx))}
            </div>
          ) : (
            activeStep && renderStepBlock(activeStep, safeActiveIndex)
          )}

          {/* Bottom Fast Action: Add Next Step */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-4 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddStep(safeActiveIndex)}
              className="cursor-pointer gap-2 font-semibold text-xs text-primary hover:border-primary hover:bg-primary/5"
            >
              <Plus className="size-4" />
              <span>+ Add Step {rawSteps.length + 1} to Conversation</span>
            </Button>
          </div>
        </div>
      ) : (
        /* ── LIVE INTERACTIVE SIMULATOR TAB ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Smartphone className="size-5 text-primary" />
              <div>
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Interactive Live Simulator
                </h4>
                <p className="text-xs text-muted-foreground">
                  Test your dialogue branching exactly as a learner will experience it on mobile!
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startSimulator}
              className="cursor-pointer text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>Restart Test</span>
            </Button>
          </div>

          {/* Mobile Frame Simulation */}
          <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border-4 border-foreground/10 bg-background shadow-xl">
            {/* Mobile Header */}
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground font-bold text-sm">
                <Bot className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-heading text-sm font-bold truncate">
                  {senderName}
                </h5>
                <p className="text-[10px] text-primary-foreground/80">
                  Interactive Simulator
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={startSimulator}
                className="text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            </div>

            {/* Chat Message Scroll View */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {simHistory.map((item, idx) => {
                if (item.type === "bot") {
                  return (
                    <div key={`sim-msg-${idx}`} className="flex items-start gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        <Bot className="size-3.5" />
                      </div>
                      <div className="max-w-[80%] rounded-2xl rounded-tl-xs bg-card border border-border/80 px-3.5 py-2.5 text-xs text-card-foreground shadow-2xs leading-relaxed">
                        {item.text}
                      </div>
                    </div>
                  );
                }
                if (item.type === "user") {
                  return (
                    <div
                      key={`sim-msg-${idx}`}
                      className="flex justify-end items-start gap-2"
                    >
                      <div className="max-w-[80%] rounded-2xl rounded-tr-xs bg-primary px-3.5 py-2.5 text-xs font-medium text-primary-foreground shadow-2xs leading-relaxed">
                        {item.text}
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        <User className="size-3.5" />
                      </div>
                    </div>
                  );
                }
                if (item.type === "feedback") {
                  return (
                    <div
                      key={`sim-msg-${idx}`}
                      className={cn(
                        "rounded-xl border p-3 text-xs shadow-2xs",
                        item.isCorrect
                          ? "border-success/30 bg-success/10 text-success-foreground"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {item.isCorrect ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-success" />
                            <span>Correct Response</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3.5 text-muted-foreground" />
                            <span>Feedback</span>
                          </>
                        )}
                      </div>
                      <p className="leading-relaxed">{item.text}</p>
                    </div>
                  );
                }
                return null;
              })}

              {simIsFinished && (
                <div className="rounded-2xl border border-border bg-card p-4 text-center space-y-2">
                  <span className="text-xl">🎉</span>
                  <p className="text-xs font-bold text-foreground">
                    Conversation Finished!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    The dialogue reached the conclusion.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startSimulator}
                    className="cursor-pointer text-xs"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Test Again
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Options Drawer */}
            <div className="border-t border-border bg-card p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                {simIsFinished
                  ? "Conversation Ended"
                  : "Choose your response:"}
              </div>

              {!simIsFinished && simCurrentStep && (
                <div className="space-y-1.5">
                  {(simCurrentStep.options || []).map((opt, optIdx) => (
                    <button
                      key={opt.optionId || `sim-opt-${optIdx}`}
                      type="button"
                      onClick={() => handleSimChooseOption(opt)}
                      className="flex w-full items-center gap-2 rounded-xl border border-border bg-background p-2.5 text-left text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.99] cursor-pointer shadow-2xs"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="flex-1 leading-snug">
                        {opt.text || `(Option ${String.fromCharCode(65 + optIdx)})`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
