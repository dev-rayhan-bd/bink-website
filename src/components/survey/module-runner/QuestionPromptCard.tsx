"use client";

import { cn } from "@/lib/utils";
import { RichQuestionContent } from "@/components/ui/custom/RichQuestionContent";
import { hasQuestionContent } from "@/lib/question-content";
import type { ModuleQuestion } from "@/lib/types/module.type";
import { MediaImage } from "./media";
import type { MediaValue } from "./types";

export function QuestionPromptCard({ question }: { question: ModuleQuestion }) {
  const hasContent = hasQuestionContent(question.content);
  const blockColor = /^#[0-9A-Fa-f]{6}$/.test(question.blockColor || "")
    ? question.blockColor
    : undefined;

  return (
    <div className="mb-4 shrink-0 space-y-3 overflow-hidden bg-transparent">
      <div>
        <span className="inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-xs">
          {question.type}
        </span>
      </div>

      {question.image && (
        <div className="aspect-3/4 w-full overflow-hidden rounded-[28px] border border-black/10 bg-muted/20 shadow-lg shadow-black/5 dark:border-white/15">
          <MediaImage
            value={question.image as MediaValue}
            alt="Question visual"
            className="block h-full w-full object-cover object-center"
          />
        </div>
      )}

      {hasContent && (
        <div
          className={cn(
            "rounded-[28px] border border-black/10 p-5 shadow-lg shadow-black/5 dark:border-white/15 sm:p-6",
            blockColor ? "" : "bg-card/90 backdrop-blur-xs",
          )}
          style={blockColor ? { backgroundColor: blockColor } : undefined}
        >
          <RichQuestionContent
            value={question.content}
            className="font-heading text-base font-semibold leading-relaxed text-foreground"
          />
        </div>
      )}
    </div>
  );
}
