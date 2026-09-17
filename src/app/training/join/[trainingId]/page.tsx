import { JoinTrainingForm } from "@/components/training/JoinTrainingForm";
import type { TParams, TSearchParams } from "@/lib/types/global.type";
import { getTraining } from "@/services/training.service";
import { getCompany } from "@/services/company.service";
import type { TrainingCompany } from "@/lib/types/training.type";

export default async function JoinTrainingPage({
  params,
  searchParams,
}: {
  params: TParams<{ trainingId: string }>;
  searchParams: TSearchParams;
}) {
  const [{ trainingId }, query] = await Promise.all([params, searchParams]);
  const authType = typeof query.authType === "string" ? query.authType : undefined;

  let logoUrl: string | undefined;
  let companyName: string | undefined;

  try {
    const trainingRes = await getTraining(trainingId).catch(() => null);
    if (trainingRes?.success && trainingRes.data) {
      const company = trainingRes.data.companyId;
      if (typeof company === "object" && company !== null) {
        logoUrl = (company as TrainingCompany).branding?.logo || (company as TrainingCompany).image;
        companyName = (company as TrainingCompany).firstName;
      } else if (typeof company === "string" && company) {
        const companyRes = await getCompany(company).catch(() => null);
        if (companyRes?.success && companyRes.data) {
          logoUrl = companyRes.data.branding?.logo || companyRes.data.image;
          companyName = companyRes.data.firstName;
        }
      }
    }
  } catch {
    // Ignore error
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center px-6 py-8">
      {logoUrl && (
        <div className="mb-10 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={companyName || "Bedrijfslogo"}
            className="h-12 max-h-16 max-w-48 object-contain"
          />
        </div>
      )}
      <JoinTrainingForm trainingId={trainingId} authType={authType} />
    </main>
  );
}
