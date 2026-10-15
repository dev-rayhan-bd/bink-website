import { createHash } from "node:crypto";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Layers3 } from "lucide-react";
import { BlockedSessionRedirect } from "@/components/auth/BlockedSessionRedirect";
import { Badge } from "@/components/ui/badge";
import { FeaturedTrainingSection } from "@/components/survey/FeaturedTrainingSection";
import { WelcomeVideoOverlay } from "@/components/survey/WelcomeVideoOverlay";
import { getFeaturedTrainings } from "@/services/featured-training.service";
import { translateScreenTexts } from "@/services/translate.service";
import { getMyTrainings } from "@/services/training.service";
import { getMyProfile } from "@/services/user.service";
import type {
  FeaturedTraining,
  Topic,
  Training,
  TrainingCompany,
  UserTrainingView,
} from "@/lib/types/training.type";
import type { LearningModule } from "@/lib/types/module.type";

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

  const rawTrainings: Training[] = Array.isArray(response?.data) ? response.data : [];
  const user = profileResponse.success ? profileResponse.data : null;
  const trainingCompany =
    typeof rawTrainings[0]?.companyId === "object" && rawTrainings[0]?.companyId !== null
      ? (rawTrainings[0].companyId as TrainingCompany)
      : null;
  const branding = user?.branding?.videoUrl
    ? user.branding
    : (trainingCompany?.branding?.videoUrl ? trainingCompany.branding : user?.branding);
  const featuredResponse = featuredResult.value;
  const rawFeaturedTrainings: FeaturedTraining[] = featuredResponse?.success
    ? featuredResponse.data
    : [];

  const textsToTranslate: string[] = [];
  if (branding?.videoTitle) textsToTranslate.push(branding.videoTitle);
  if (branding?.videoDescription) textsToTranslate.push(branding.videoDescription);
  if (branding?.presenterName) textsToTranslate.push(branding.presenterName);
  if (branding?.presenterDesignation) textsToTranslate.push(branding.presenterDesignation);

  if (user?.branding?.videoTitle) textsToTranslate.push(user.branding.videoTitle);
  if (user?.branding?.videoDescription) textsToTranslate.push(user.branding.videoDescription);
  if (user?.branding?.presenterName) textsToTranslate.push(user.branding.presenterName);
  if (user?.branding?.presenterDesignation) textsToTranslate.push(user.branding.presenterDesignation);

  for (const tr of rawTrainings) {
    if (tr.title) textsToTranslate.push(tr.title);
    if (tr.description) textsToTranslate.push(tr.description);
  }
  for (const feat of rawFeaturedTrainings) {
    if (feat.customText) textsToTranslate.push(feat.customText);
    const mod = typeof feat.moduleId === "object" ? (feat.moduleId as LearningModule) : null;
    if (mod?.title) textsToTranslate.push(mod.title);
    if (mod?.description) textsToTranslate.push(mod.description);
    const tr = typeof feat.trainingId === "object" ? (feat.trainingId as Training) : null;
    if (tr?.title) textsToTranslate.push(tr.title);
    const top = typeof feat.topicId === "object" ? (feat.topicId as Topic) : null;
    if (top?.title) textsToTranslate.push(top.title);
  }

  const translations = await translateScreenTexts(
    textsToTranslate,
    "modules_screen",
    "nl",
  );

  const t = (text?: string | null) => {
    if (!text) return "";
    const trimmed = text.trim();
    return translations[trimmed] || translations[text] || text;
  };

  const translatedBranding = branding
    ? {
        ...branding,
        videoTitle: branding.videoTitle ? t(branding.videoTitle) : branding.videoTitle,
        videoDescription: branding.videoDescription
          ? t(branding.videoDescription)
          : branding.videoDescription,
        presenterName: branding.presenterName
          ? t(branding.presenterName)
          : branding.presenterName,
        presenterDesignation: branding.presenterDesignation
          ? t(branding.presenterDesignation)
          : branding.presenterDesignation,
      }
    : branding;

  const translatedUser = user
    ? {
        ...user,
        branding: user.branding
          ? {
              ...user.branding,
              videoTitle: user.branding.videoTitle
                ? t(user.branding.videoTitle)
                : user.branding.videoTitle,
              videoDescription: user.branding.videoDescription
                ? t(user.branding.videoDescription)
                : user.branding.videoDescription,
              presenterName: user.branding.presenterName
                ? t(user.branding.presenterName)
                : user.branding.presenterName,
              presenterDesignation: user.branding.presenterDesignation
                ? t(user.branding.presenterDesignation)
                : user.branding.presenterDesignation,
            }
          : user.branding,
      }
    : user;

  const trainings = rawTrainings.map((tr) => ({
    ...tr,
    title: t(tr.title),
    description: tr.description ? t(tr.description) : tr.description,
  }));

  const featuredTrainings = rawFeaturedTrainings.map((feat) => {
    const mod = typeof feat.moduleId === "object" && feat.moduleId !== null
      ? {
          ...(feat.moduleId as LearningModule),
          title: t((feat.moduleId as LearningModule).title),
          description: (feat.moduleId as LearningModule).description
            ? t((feat.moduleId as LearningModule).description)
            : (feat.moduleId as LearningModule).description,
        }
      : feat.moduleId;

    const tr = typeof feat.trainingId === "object" && feat.trainingId !== null
      ? {
          ...(feat.trainingId as Training),
          title: t((feat.trainingId as Training).title),
        }
      : feat.trainingId;

    const top = typeof feat.topicId === "object" && feat.topicId !== null
      ? {
          ...(feat.topicId as Topic),
          title: t((feat.topicId as Topic).title),
        }
      : feat.topicId;

    return {
      ...feat,
      customText: feat.customText ? t(feat.customText) : feat.customText,
      moduleId: mod,
      trainingId: tr,
      topicId: top,
    };
  });

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
        branding={translatedBranding}
        user={translatedUser}
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
            const userTraining = training as UserTrainingView;
            const isCompleted =
              Boolean((training as unknown as { isCompleted?: boolean }).isCompleted) ||
              training.status === "completed" ||
              (training as unknown as { userProgress?: { status?: string } }).userProgress?.status === "completed" ||
              (training as unknown as { progress?: { status?: string } }).progress?.status === "completed" ||
              (typeof userTraining.progressPercentage === "number" &&
                userTraining.progressPercentage >= 100) ||
              (typeof userTraining.completedModules === "number" &&
                typeof userTraining.totalModules === "number" &&
                userTraining.totalModules > 0 &&
                userTraining.completedModules >= userTraining.totalModules);

            return (
              <article
                key={training._id}
                className="overflow-hidden rounded-lg border border-border bg-secondary/20 shadow-sm transition-colors hover:border-secondary/50"
              >
                {training.thumbnailImage && (
                  <div className="relative w-full aspect-[2/1] sm:aspect-video overflow-hidden border-b bg-muted/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={training.thumbnailImage}
                      alt={training.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
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
                    {isCompleted ? (
                      <span className="flex items-center gap-1 font-medium text-primary">
                        <CheckCircle2 className="size-3.5" /> Voltooid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-medium text-muted-foreground">
                        <Clock className="size-3.5" /> Niet voltooid
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

