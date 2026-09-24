import { createHash } from "node:crypto";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Layers3 } from "lucide-react";
import { BlockedSessionRedirect } from "@/components/auth/BlockedSessionRedirect";
import { Badge } from "@/components/ui/badge";
import { FeaturedTrainingSection } from "@/components/survey/FeaturedTrainingSection";
import { WelcomeVideoOverlay } from "@/components/survey/WelcomeVideoOverlay";
import { getFeaturedTrainings } from "@/services/featured-training.service";
import { getMyTrainings } from "@/services/training.service";
import { getMyProfile } from "@/services/user.service";

export default async function ModulesPage() {
  const [response, profileResponse, featuredResult] = await Promise.all([
    getMyTrainings().catch(() => ({ success: false, message: "Unauthorized", data: [] })),
    getMyProfile().catch(() => ({ success: false, message: "Unauthorized", data: null })),
    getFeaturedTrainings()
      .then((value) => ({ value, errorMessage: undefined }))
      .catch((error: unknown) => ({
        value: null,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Niet mogelijk om uitgelichte training te laden.",
      })),
  ]);

  const blockedResponse = [response, profileResponse].find(
    (result) => !result.success && /blocked/i.test(result.message || ""),
  );

  if (blockedResponse) {
    return <BlockedSessionRedirect />;
  }

  if (!response.success) {
    redirect("/auth/login");
  }

  const trainings = response.data;
  const user = profileResponse.success ? profileResponse.data : null;
  const branding = user?.branding;
  const featuredResponse = featuredResult.value;
  const featuredTrainings = featuredResponse?.success
    ? featuredResponse.data
    : [];
  const featuredErrorMessage =
    featuredResult.errorMessage ||
    (featuredResponse && !featuredResponse.success
      ? featuredResponse.message || "Niet mogelijk om uitgelichte training te laden."
      : undefined);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const fallbackSessionId = user?._id || user?.companyId || "anonymous";
  const loginSessionId = accessToken
    ? createHash("sha256").update(accessToken).digest("hex").slice(0, 20)
    : fallbackSessionId;

  const totalModules = trainings.reduce(
    (sum, training) => sum + (training.totalModules ?? 0),
    0,
  );

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4 pb-8 animate-fadeIn overflow-y-auto">
      <WelcomeVideoOverlay
        branding={branding}
        user={user}
        loginSessionId={loginSessionId}
      />

      <section className="relative shrink-0 overflow-hidden rounded-lg border border-primary/20 bg-primary p-4 text-primary-foreground shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-widest">
              TOEGEWEZEN TRAININGEN
            </span>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Jouw leerpad
            </h1>
          </div>

          <div className="flex items-center justify-around bg-background py-3 text-center shadow-sm">
            <div className="flex-1">
              <p className="text-2xl font-bold text-primary">
                {trainings.length}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {trainings.length === 1 ? "Training" : "Trainingen"}
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

      <FeaturedTrainingSection
        featuredTrainings={featuredTrainings}
        errorMessage={featuredErrorMessage}
      />

      <section className="flex-1 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-bold">Alle trainingen</h2>
          <p className="text-xs text-muted-foreground">
            Ga verder met de trainingen die aan jouw team zijn toegewezen.
          </p>
        </div>

        {trainings.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border bg-card px-6 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen />
            </div>
            <h2 className="font-heading text-lg font-bold">
              Nog geen trainingen toegewezen
            </h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Trainingen die aan jouw team zijn toegewezen verschijnen hier.
            </p>
          </div>
        ) : (
          trainings.map((training) => {
            const topicCount = training.topicCount ?? training.topics?.length ?? 0;
            const moduleCount = training.totalModules ?? 0;

            return (
              <article
                key={training._id}
                className="overflow-hidden rounded-lg border border-border bg-secondary/20 shadow-sm transition-colors hover:border-secondary/50"
              >
                {training.thumbnailImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={training.thumbnailImage}
                    alt={training.title}
                    className="h-36 w-full border-b object-cover"
                  />
                )}

                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          training.status === "published" ? "active" : "outline"
                        }
                      >
                        {training.status === "published" ? "Gepubliceerd" : training.status}
                      </Badge>
                      <Badge variant="secondary">
                        {topicCount} {topicCount === 1 ? "onderwerp" : "onderwerpen"}
                      </Badge>
                    </div>
                    <Link
                      href={`/modules/training/${training._id}`}
                      className="group flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Openen
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-heading text-lg font-bold leading-tight text-foreground">
                      {training.title}
                    </h2>
                    <p className="line-clamp-2 text-xs leading-normal text-muted-foreground">
                      {training.description ||
                        "Voltooi deze training om je leerroute te vervolgen."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-md border bg-background p-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Layers3 className="size-4" /> {moduleCount}{" "}
                      {moduleCount === 1 ? "module" : "modules"}
                    </span>
                    {training.status === "published" && (
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <CheckCircle2 className="size-3.5" /> Klaar
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

