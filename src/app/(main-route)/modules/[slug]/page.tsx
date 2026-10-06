import { ModuleSurveyRunner } from "@/components/survey/ModuleSurveyRunner";
import type { TParams } from "@/lib/types/global.type";
import { extractModuleTexts } from "@/lib/module-translator";
import { translateScreenTexts } from "@/services/translate.service";
import { getUserModule } from "@/services/user-progress.service";
import { getMyProfile } from "@/services/user.service";

export default async function UserModulePage({
  params,
}: {
  params: TParams<{ slug: string }>;
}) {
  const { slug: moduleId } = await params;
  const [moduleResponse, profileResponse] = await Promise.all([
    getUserModule(moduleId),
    getMyProfile(),
  ]);

  if (!moduleResponse.success) {
    throw new Error(moduleResponse.message || "Unable to load this module");
  }

  const user = profileResponse.success ? profileResponse.data : null;
  const rawModule = moduleResponse.data.module;
  const textsToTranslate = extractModuleTexts(rawModule);
  const initialTranslations = await translateScreenTexts(
    textsToTranslate,
    "quiz_screen",
    "nl",
  );

  return (
    <ModuleSurveyRunner
      details={moduleResponse.data}
      initialTranslations={initialTranslations}
      user={user}
    />
  );
}

