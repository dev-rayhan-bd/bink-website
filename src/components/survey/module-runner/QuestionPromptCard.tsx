"use client";

import { cn } from "@/lib/utils";
import { RichQuestionContent } from "@/components/ui/custom/RichQuestionContent";
import { hasQuestionContent } from "@/lib/question-content";
import type { ModuleQuestion } from "@/lib/types/module.type";
import { MediaImage } from "./media";
import type { MediaValue } from "./types";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "Meerkeuzevraag",
  Information: "Informatie",
  Ordering: "Volgorde",
  Swipe: "Swipe",
  Rating: "Beoordeling",
  "Free Input": "Open vraag",
  Video: "Video",
  "Simulated Call": "Gesprekssimulatie",
  "Chat Scenario": "Chatscenario",
};

export function QuestionPromptCard({ question }: { question: ModuleQuestion }) {
  const hasContent = hasQuestionContent(question.content);
  const blockColor = /^#[0-9A-Fa-f]{6}$/.test(question.blockColor || "")
    ? question.blockColor
    : undefined;

  const typeLabel = QUESTION_TYPE_LABELS[question.type] || question.type;

  return (
    <div className="mb-2 shrink-0 space-y-2.5 pt-1 overflow-visible bg-transparent">
      <div className="flex items-center pt-0.5">
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs whitespace-nowrap">
          {typeLabel}
        </span>
      </div>

      {(question.image || hasContent) && (
        <div
          className={cn(
            "overflow-hidden rounded-[24px] border border-black/10 shadow-md shadow-black/5 dark:border-white/15",
            blockColor ? "" : "bg-card text-card-foreground",
          )}
          style={blockColor ? { backgroundColor: blockColor } : undefined}
        >
          {question.image && (
            <div
              className={cn(
                "relative w-full overflow-hidden shrink-0",
                hasContent ? "aspect-16/10 max-h-[28dvh] sm:max-h-[32dvh]" : "aspect-4/3 min-h-[200px] max-h-[36dvh]",
              )}
            >
              <MediaImage
                value={question.image as MediaValue}
                alt="Vraag afbeelding"
                className="block h-full w-full object-cover object-center"
              />
            </div>
          )}

          {hasContent && (
            <div className="p-5 sm:p-6">
              <RichQuestionContent
                value={question.content}
                className="font-heading text-base font-semibold leading-relaxed text-card-foreground sm:text-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

