import {
  BarChart3,
  ListChecks,
  MessageSquareText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RichQuestionContent } from "@/components/ui/custom/RichQuestionContent";
import { hasQuestionContent } from "@/lib/question-content";
import type {
  ModuleAnalyticsAnswer,
  ModuleQuestionAnalyticsData,
} from "@/lib/types/analytics.type";
import type { LearningModule, ModuleQuestion } from "@/lib/types/module.type";

type ModuleQuestionAnalyticsProps = {
  analytics: ModuleQuestionAnalyticsData;
  module?: LearningModule | null;
};

const answersMatch = (
  answer: ModuleAnalyticsAnswer,
  expected: string | string[] | undefined,
) => {
  if (expected === undefined) return false;

  if (Array.isArray(answer) && Array.isArray(expected)) {
    return (
      answer.length === expected.length &&
      answer.every((item, index) => item === expected[index])
    );
  }

  return answer === expected;
};

const isExpectedResponse = (
  answer: ModuleAnalyticsAnswer,
  question?: ModuleQuestion,
) => {
  if (!question?.isScored) return false;

  if (question.type === "Swipe") {
    return Boolean(question.correctDirection && answer === question.correctDirection);
  }

  if (question.type === "Ordering") {
    return answersMatch(answer, question.items);
  }

  return answersMatch(answer, question.correctAnswer);
};

const formatAnswer = (
  answer: ModuleAnalyticsAnswer,
  question?: ModuleQuestion,
) => {
  if (Array.isArray(answer)) {
    return answer.map((item, index) => `${index + 1}. ${item}`).join(" → ");
  }

  if (question?.type === "Swipe") {
    if (answer === "left") return question.leftLabel || "Left";
    if (answer === "right") return question.rightLabel || "Right";
  }

  return String(answer);
};

export function ModuleQuestionAnalytics({
  analytics,
  module,
}: ModuleQuestionAnalyticsProps) {
  const questionMap = new Map(
    (module?.questions || []).map((question) => [question.id, question]),
  );
  const totalAnswerRecords = analytics.stats.reduce(
    (sum, statistic) => sum + statistic.totalAnswers,
    0,
  );
  const participantReach = analytics.stats.reduce(
    (highest, statistic) => Math.max(highest, statistic.totalAnswers),
    0,
  );

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListChecks className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Questions
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{analytics.stats.length}</p>
        </div>

        <div className="rounded-md border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Participant reach
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{participantReach}</p>
        </div>

        <div className="rounded-md border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquareText className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Answer records
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalAnswerRecords}</p>
        </div>
      </section>

      {analytics.stats.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed bg-card p-6 text-center">
          <BarChart3 className="mb-3 size-10 text-primary" />
          <h2 className="font-heading text-lg font-bold">No responses yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Question response distributions will appear after learners submit
            this module.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {analytics.stats.map((statistic, index) => {
            const question = questionMap.get(statistic.questionId);
            const responses = [...statistic.responses].sort(
              (first, second) => second.count - first.count,
            );
            const displayContent = statistic.content || question?.content || "";

            return (
              <article
                key={statistic.questionId}
                className="space-y-4 rounded-md border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Badge variant="secondary">{statistic.type}</Badge>
                      {question?.isScored && (
                        <Badge variant="active">Scored</Badge>
                      )}
                    </div>
                    {hasQuestionContent(displayContent) ? (
                      <RichQuestionContent
                        value={displayContent}
                        className="font-heading text-base font-bold leading-snug sm:text-lg"
                      />
                    ) : (
                      <h2 className="font-heading text-base font-bold leading-snug sm:text-lg">
                        {statistic.type} response
                      </h2>
                    )}
                  </div>

                  <div className="shrink-0 rounded-md bg-secondary/40 px-3 py-2 text-center">
                    <p className="text-lg font-bold">{statistic.totalAnswers}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Total answers
                    </p>
                  </div>
                </div>

                {responses.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    No answer distribution is available for this question.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {responses.map((response, responseIndex) => {
                      const percentage = Math.min(
                        100,
                        Math.max(0, response.percentage),
                      );
                      const expected = isExpectedResponse(
                        response.answer,
                        question,
                      );

                      return (
                        <div
                          key={`${statistic.questionId}-${responseIndex}`}
                          className="space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="wrap-break-word font-medium leading-snug">
                                {formatAnswer(response.answer, question)}
                              </p>
                              {expected && (
                                <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-primary">
                                  Expected answer
                                </span>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-bold">
                                {Number(response.percentage.toFixed(2))}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {response.count} responses
                              </p>
                            </div>
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-secondary/50">
                            <div
                              className="h-full rounded-full bg-primary transition-[width]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
