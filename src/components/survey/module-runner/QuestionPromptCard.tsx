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
  const rawTextLength = (question.content || "").length;
  const isLongContent = rawTextLength > 100;

  return (
    <div className="shrink-0 space-y-1.5 overflow-visible bg-transparent">
      <div className="flex items-center">
        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-black/75 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-md border border-white/20 whitespace-nowrap">
          {typeLabel}
        </span>
      </div>

      {(question.image || hasContent) && (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-black/10 shadow-xs dark:border-white/15",
            blockColor ? "" : "bg-card text-card-foreground",
          )}
          style={blockColor ? { backgroundColor: blockColor } : undefined}
        >
          {question.image && (
            <div
              className={cn(
                "relative w-full overflow-hidden shrink-0 bg-black/5",
                hasContent
                  ? "max-h-[120px] sm:max-h-[160px] aspect-video"
                  : "max-h-[180px] sm:max-h-[220px] aspect-video",
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
            <div className="p-3.5 sm:p-4">
              <RichQuestionContent
                value={question.content}
                className={cn(
                  "font-heading font-semibold leading-snug text-card-foreground",
                  isLongContent ? "text-xs sm:text-sm" : "text-sm sm:text-base",
                )}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
