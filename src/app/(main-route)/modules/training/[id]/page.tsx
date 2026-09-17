import Link from "next/link";
import { ArrowRight, BookOpen, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TParams } from "@/lib/types/global.type";
import type { Topic, UserTrainingView } from "@/lib/types/training.type";
import { getTrainingTopics, getUserTrainingView } from "@/services/training.service";

const TrainingUnavailable = ({ message }: { message: string }) => (
  <div className="flex flex-1 min-h-0 flex-col gap-4 pb-8 animate-fadeIn overflow-y-auto pr-1">
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border bg-card px-6 text-center">
      <BookOpen className="mb-3 size-9 text-primary" />
      <h1 className="font-heading text-xl font-bold">Training niet beschikbaar</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export default async function TrainingModulesPage({
  params,
}: {
  params: TParams<{ id: string }>;
}) {
  const { id } = await params;
  const [trainingResult, topicsResult] = await Promise.allSettled([
    getUserTrainingView(id),
    getTrainingTopics(id),
  ]);

  if (trainingResult.status === "rejected") {
    const message =
      trainingResult.reason instanceof Error
        ? trainingResult.reason.message
        : "Niet mogelijk om deze training te laden.";

    return <TrainingUnavailable message={message} />;
  }

  const trainingResponse = trainingResult.value;
  const topicsResponse =
    topicsResult.status === "fulfilled" ? topicsResult.value : undefined;

  if (!trainingResponse?.success) {
    return (
      <TrainingUnavailable
        message={trainingResponse?.message || "Niet mogelijk om deze training te laden."}
      />
    );
  }

  const training = trainingResponse.data as UserTrainingView;
  const topics: Topic[] =
    topicsResponse?.success && topicsResponse.data.length > 0
      ? topicsResponse.data
      : training.topics || [];

  const totalModules = topics.reduce(
    (acc, t) => acc + (t.moduleCount ?? t.modules?.length ?? 0),
    0,
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 pb-8 animate-fadeIn overflow-y-auto">
      <section className="overflow-hidden rounded-lg border border-primary/20 bg-primary shadow-sm text-primary-foreground">
        {training.thumbnailImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={training.thumbnailImage}
            alt={training.title}
            className="h-32 w-full object-cover bg-background"
          />
        )}
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              {training.status === "published" ? "Gepubliceerd" : training.status}
            </Badge>
            <Badge variant="secondary">
              {topics.length} {topics.length === 1 ? "onderwerp" : "onderwerpen"}
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold">{training.title}</h1>
            <p className="text-sm text-primary-foreground/80">
              {training.description || "Training overzicht"}
            </p>
          </div>

          <div className="flex items-center justify-around rounded-md bg-background py-3 text-center shadow-sm">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary">
                {topics.length}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {topics.length === 1 ? "Onderwerp" : "Onderwerpen"}
              </p>
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary">
                {totalModules}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {totalModules === 1 ? "Module" : "Modules"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {topics.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border bg-card px-6 text-center">
            <BookOpen className="mb-3 size-9 text-primary" />
            <h2 className="font-heading text-lg font-bold">Geen onderwerpen beschikbaar</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Onderwerpen verschijnen hier zodra deze training is geconfigureerd.
            </p>
          </div>
        ) : (
          topics.map((topic) => {
            const moduleCount = topic.moduleCount ?? topic.modules?.length ?? 0;

            return (
              <Link
                key={topic._id}
                href={`/modules/training/${id}/topics/${topic._id}`}
                className="group block rounded-lg border border-border bg-secondary/20 p-5 shadow-sm transition-colors hover:border-secondary/50"
              >
                <article className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Onderwerp {(topic.order ?? 0) + 1}</Badge>
                      <Badge variant="secondary">
                        {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                      </Badge>
                    </div>
                    <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-heading text-xl font-bold leading-tight">
                      {topic.title}
                    </h2>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {topic.description || "Geen beschrijving"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Layers3 className="size-4 text-secondary" />
                    Open onderwerp om modules te bekijken
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
