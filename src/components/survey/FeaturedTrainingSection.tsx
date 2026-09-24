import Link from "next/link";
import { AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FeaturedTraining, Topic, Training } from "@/lib/types/training.type";

type FeaturedTrainingSectionProps = {
  featuredTrainings: FeaturedTraining[];
  errorMessage?: string;
};

const getModuleId = (item: FeaturedTraining) =>
  typeof item.moduleId === "string" ? item.moduleId : item.moduleId._id;

export function FeaturedTrainingSection({
  featuredTrainings,
  errorMessage,
}: FeaturedTrainingSectionProps) {
  const uniqueItems = new Map<string, FeaturedTraining>();

  for (const item of featuredTrainings) {
    if (!item.isActive || item.isDeleted) continue;
    const moduleId = getModuleId(item);
    if (!uniqueItems.has(moduleId)) uniqueItems.set(moduleId, item);
  }

  const activeItems = Array.from(uniqueItems.values());

  if (activeItems.length === 0 && !errorMessage) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <div>
          <h2 className="font-heading text-lg font-bold">Uitgelichte training</h2>
          <p className="text-xs text-muted-foreground">
            Speciaal geselecteerd voor jouw team.
          </p>
        </div>
      </div>

      {errorMessage && activeItems.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="space-y-3">
        {activeItems.map((item) => {
          const moduleId = getModuleId(item);
          const moduleData =
            typeof item.moduleId === "string" ? null : item.moduleId;
          const training =
            typeof item.trainingId === "string"
              ? null
              : (item.trainingId as Training);
          const topic =
            typeof item.topicId === "string" ? null : (item.topicId as Topic);
          const qCount = moduleData?.questions?.length ?? 0;

          return (
            <article
              key={moduleId}
              className="overflow-hidden rounded-lg border-2 border-primary/30 bg-primary/5 shadow-sm"
            >
              {moduleData?.thumbnailImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={moduleData.thumbnailImage}
                  alt={moduleData.title}
                  className="h-40 w-full border-b object-cover"
                />
              )}

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="active">Uitgelicht</Badge>
                  {training?.title && (
                    <Badge variant="outline">{training.title}</Badge>
                  )}
                  {topic?.title && (
                    <Badge variant="secondary">{topic.title}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">
                    {item.customText || "Aanbevolen voor jouw team"}
                  </p>
                  <h3 className="font-heading text-xl font-bold leading-tight">
                    {moduleData?.title || "Uitgelichte module"}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {moduleData?.description ||
                      "Open deze module om verder te leren."}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
                  <span className="text-xs text-muted-foreground">
                    {moduleData
                      ? `${qCount} ${qCount === 1 ? "vraag" : "vragen"}`
                      : "Belangrijke module"}
                  </span>
                  <Link
                    href={`/modules/${moduleId}`}
                    className="group flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    Start uitgelichte module
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
