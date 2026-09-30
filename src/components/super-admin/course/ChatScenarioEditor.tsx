/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { GitFork, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { IChatStep, IChatStepOption } from "@/lib/types/module.type";

interface ChatScenarioEditorProps {
  questionIndex: number;
  questionErrors?: any;
  renderMediaInput: (params: {
    field: "image" | "videoUrl" | "callerPhoto" | "postCallVideoUrl" | "senderAvatar";
    label: string;
    accept: string;
    hint?: string;
    error?: string;
  }) => React.ReactNode;
}

export function ChatScenarioEditor({
  questionIndex,
  questionErrors,
  renderMediaInput,
}: ChatScenarioEditorProps) {
  const { register, watch, setValue } = useFormContext();

  const currentQuestion = watch(`questions.${questionIndex}`) || {};
  const isScored = Boolean(currentQuestion.isScored);
  const senderName = currentQuestion.senderName || "Henkie Penkie";

  // Ensure chatSteps array is present and normalized
  const rawSteps: IChatStep[] = Array.isArray(currentQuestion.chatSteps) && currentQuestion.chatSteps.length > 0
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
          options: (currentQuestion.options || ["", ""]).map((opt: string, i: number) => ({
            optionId: `opt-1-${i + 1}`,
            text: typeof opt === "string" ? opt : "",
            nextStepId: null,
            feedback: "",
            isCorrect: i === 0,
          })),
        },
      ];

  const [activeStepId, setActiveStepId] = useState<string>(
    currentQuestion.initialStepId || rawSteps[0]?.stepId || "step-1",
  );

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

  const handleAddStep = () => {
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

    const nextSteps = [...rawSteps, newStep];
    updateSteps(nextSteps, newStepId);
  };

  const handleDeleteStep = (stepIdToDelete: string) => {
    if (rawSteps.length <= 1) return;
    const nextSteps = rawSteps.filter((s) => s.stepId !== stepIdToDelete);
    const nextActive = nextSteps[0]?.stepId || "step-1";
    updateSteps(nextSteps, nextActive);
  };

  // Add a message to active step (D1 requirement)
  const handleAddMessage = () => {
    const updatedMessages = [
      ...activeStep.messages,
      {
        sender: senderName,
        text: "",
        isUser: false,
      },
    ];
    const nextSteps = rawSteps.map((s, idx) =>
      idx === safeActiveIndex ? { ...s, messages: updatedMessages } : s,
    );
    updateSteps(nextSteps);
  };

  const handleDeleteMessage = (msgIndex: number) => {
    if (activeStep.messages.length <= 1) return;
    const updatedMessages = activeStep.messages.filter((_, idx) => idx !== msgIndex);
    const nextSteps = rawSteps.map((s, idx) =>
      idx === safeActiveIndex ? { ...s, messages: updatedMessages } : s,
    );
    updateSteps(nextSteps);
  };

  const handleMessageChange = (
    msgIndex: number,
    field: "sender" | "text",
    value: string,
  ) => {
    const updatedMessages = activeStep.messages.map((m, idx) =>
      idx === msgIndex ? { ...m, [field]: value } : m,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === safeActiveIndex ? { ...s, messages: updatedMessages } : s,
    );
    updateSteps(nextSteps);
  };

  // Add option to active step
  const handleAddOption = () => {
    const newOptNum = (activeStep.options?.length || 0) + 1;
    const newOption: IChatStepOption = {
      optionId: `opt-${safeActiveIndex + 1}-${newOptNum}-${Date.now().toString(36).slice(-3)}`,
      text: "",
      nextStepId: null,
      feedback: "",
      isCorrect: false,
    };
    const updatedOptions = [...(activeStep.options || []), newOption];
    const nextSteps = rawSteps.map((s, idx) =>
      idx === safeActiveIndex ? { ...s, options: updatedOptions } : s,
    );
    updateSteps(nextSteps);
  };

  const handleDeleteOption = (optIndex: number) => {
    const updatedOptions = (activeStep.options || []).filter((_, idx) => idx !== optIndex);
    const nextSteps = rawSteps.map((s, idx) =>
      idx === safeActiveIndex ? { ...s, options: updatedOptions } : s,
    );
    updateSteps(nextSteps);
  };

  const handleOptionChange = (
    optIndex: number,
    field: keyof IChatStepOption,
    value: any,
  ) => {
    // If selecting "(New Step)", automatically create a new step and link it!
    if (field === "nextStepId" && value === "__create_new__") {
      const nextStepNum = rawSteps.length + 1;
      const newStepId = `step-${nextStepNum}`;
      const newStep: IChatStep = {
        stepId: newStepId,
        messages: [{ sender: senderName, text: "", isUser: false }],
        options: [],
      };
      const updatedOptions = (activeStep.options || []).map((opt, idx) =>
        idx === optIndex ? { ...opt, nextStepId: newStepId } : opt,
      );
      const nextSteps = rawSteps.map((s, idx) =>
        idx === safeActiveIndex ? { ...s, options: updatedOptions } : s,
      );
      updateSteps([...nextSteps, newStep]);
      return;
    }

    const updatedOptions = (activeStep.options || []).map((opt, idx) =>
      idx === optIndex ? { ...opt, [field]: value } : opt,
    );
    const nextSteps = rawSteps.map((s, idx) =>
      idx === safeActiveIndex ? { ...s, options: updatedOptions } : s,
    );
    updateSteps(nextSteps);
  };

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card/60 p-4 shadow-xs">
      {/* ── Meta Fields (Sender Profile & Avatar) ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(questionErrors?.senderName)}>
          <FieldLabel>
            Sender Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            placeholder="e.g. Henkie Penkie"
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
            label: "Sender Avatar",
            accept: "image/*",
            hint: "Square avatar photo (JPG/PNG). Displayed in chat header and bubbles.",
            error: questionErrors?.senderAvatar?.message,
          })}
        </div>
      </div>

      {/* ── Branching Conversation Flow Builder ── */}
      <div className="space-y-4 rounded-xl border border-border bg-background/80 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="size-4 text-primary" />
            <span className="font-heading text-sm font-bold text-foreground">
              Conversation Steps (Tree Flow)
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStep}
            className="border-dashed hover:border-primary"
          >
            <Plus className="size-3.5" />
            <span>Add Step</span>
          </Button>
        </div>

        {/* ── Step Selector Tabs ── */}
        <div className="flex flex-wrap gap-2">
          {rawSteps.map((step, idx) => {
            const isActive = step.stepId === activeStep.stepId;
            const isStart = idx === 0 || step.stepId === currentQuestion.initialStepId;
            const previewText = step.messages?.[0]?.text?.slice(0, 16) || "Empty message";

            return (
              <button
                key={step.stepId}
                type="button"
                onClick={() => setActiveStepId(step.stepId)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs",
                  isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>
                  {isStart ? "📍 " : ""}Step {idx + 1} ({step.stepId})
                </span>
                <span className="max-w-[100px] truncate text-[10px] opacity-75">
                  &quot;{previewText}&quot;
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Active Step Editor ── */}
        {activeStep && (
          <div className="space-y-5 rounded-lg border border-border bg-card/40 p-4 pt-3">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">
                  Editing: {activeStep.stepId}
                </span>
                {safeActiveIndex === 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Initial Step
                  </span>
                )}
              </div>

              {rawSteps.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStep(activeStep.stepId)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Step</span>
                </Button>
              )}
            </div>

            {/* ── Messages in this Step (D1 requirement) ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Messages in this step
                </FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMessage}
                >
                  <Plus className="size-3.5" />
                  <span>Add Message</span>
                </Button>
              </div>

              <div className="space-y-3">
                {activeStep.messages.map((msg, msgIdx) => (
                  <div
                    key={`msg-${msgIdx}`}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-2xs sm:flex-row sm:items-start"
                  >
                    <div className="w-full sm:w-1/3">
                      <FieldLabel className="text-[11px]">Sender</FieldLabel>
                      <Input
                        value={msg.sender || senderName}
                        onChange={(e) =>
                          handleMessageChange(msgIdx, "sender", e.target.value)
                        }
                        placeholder="Sender name"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <FieldLabel className="text-[11px]">Message Content</FieldLabel>
                      <Textarea
                        value={msg.text}
                        onChange={(e) =>
                          handleMessageChange(msgIdx, "text", e.target.value)
                        }
                        placeholder="Type the message bubble text..."
                        className="min-h-[64px] text-xs leading-relaxed"
                      />
                    </div>
                    {activeStep.messages.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteMessage(msgIdx)}
                        className="mt-6 text-destructive hover:bg-destructive/10"
                        title="Delete message"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Response Options for this Step (Branching choices) ── */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Response Options (Choices &amp; Branching)
                </FieldLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  <Plus className="size-3.5" />
                  <span>Add Option</span>
                </Button>
              </div>

              {(activeStep.options || []).length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No response options configured for this step. Reaching this step will end the conversation.
                </div>
              ) : (
                <div className="space-y-3">
                  {(activeStep.options || []).map((opt, optIdx) => (
                    <div
                      key={opt.optionId || `opt-${optIdx}`}
                      className="space-y-3 rounded-lg border border-border bg-background p-3.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                        <span className="font-heading text-xs font-bold text-foreground">
                          Option {optIdx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteOption(optIdx)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Delete option"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Option Text */}
                        <div className="sm:col-span-2">
                          <FieldLabel className="text-[11px]">Option Text</FieldLabel>
                          <Input
                            value={opt.text}
                            onChange={(e) =>
                              handleOptionChange(optIdx, "text", e.target.value)
                            }
                            placeholder="e.g. I sincerely apologize. Let me look into this right away."
                            className="text-xs"
                          />
                        </div>

                        {/* Next Step Branching Dropdown (D4) */}
                        <div>
                          <FieldLabel className="text-[11px]">
                            Next Step (Branching)
                          </FieldLabel>
                          <Select
                            value={opt.nextStepId ?? "__end__"}
                            onValueChange={(val) =>
                              handleOptionChange(
                                optIdx,
                                "nextStepId",
                                val === "__end__" ? null : val,
                              )
                            }
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Select target step..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__end__">
                                🛑 (End Conversation)
                              </SelectItem>
                              <SelectItem
                                value="__create_new__"
                                className="font-semibold text-primary"
                              >
                                ➕ (Create &amp; Link New Step)
                              </SelectItem>
                              {rawSteps
                                .filter((s) => s.stepId !== activeStep.stepId)
                                .map((s, sIdx) => (
                                  <SelectItem key={s.stepId} value={s.stepId}>
                                    → Step {sIdx + 1} ({s.stepId})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Is Correct Checkbox (D5) */}
                        {isScored && (
                          <div className="flex items-end pb-1.5">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted">
                              <input
                                type="checkbox"
                                checked={Boolean(opt.isCorrect)}
                                onChange={(e) =>
                                  handleOptionChange(
                                    optIdx,
                                    "isCorrect",
                                    e.target.checked,
                                  )
                                }
                                className="size-4 rounded accent-primary cursor-pointer"
                              />
                              <span>✅ Correct Response</span>
                            </label>
                          </div>
                        )}

                        {/* Feedback Text Input */}
                        <div className="sm:col-span-2">
                          <FieldLabel className="text-[11px]">
                            Feedback (shown after selecting this choice)
                          </FieldLabel>
                          <Input
                            value={opt.feedback || ""}
                            onChange={(e) =>
                              handleOptionChange(optIdx, "feedback", e.target.value)
                            }
                            placeholder="e.g. Excellent empathetic response!"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
