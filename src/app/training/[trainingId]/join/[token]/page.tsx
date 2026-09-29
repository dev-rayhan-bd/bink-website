/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoinTrainingForm } from "@/components/training/JoinTrainingForm";
import type { TParams, TSearchParams } from "@/lib/types/global.type";
import { getCompany } from "@/services/company.service";
import { getTraining, getTrainingInviteByToken } from "@/services/training.service";
import type { TrainingCompany } from "@/lib/types/training.type";

export default async function TrainingTokenJoinPage({
  params,
  searchParams,
}: {
  params: TParams<{ trainingId: string; token: string }>;
  searchParams: TSearchParams;
}) {
  const { trainingId, token } = await params;
  const resolvedSearchParams = await searchParams;

  let logoUrl: string | undefined;
  let companyName: string | undefined;
  let trainingData = null;

  try {
    if (token) {
      const tokenRes = await getTrainingInviteByToken(token).catch(() => null);
      if (tokenRes?.success && tokenRes.data) {
        trainingData = tokenRes.data;
      }
    }

    let company = trainingData?.companyId;
    if (!company && trainingId) {
      const trainingRes = await getTraining(trainingId).catch(() => null);
      if (trainingRes?.success && trainingRes.data) {
        company = trainingRes.data.companyId;
        if (!trainingData) {
          trainingData = trainingRes.data;
        }
      }
    }

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
  } catch {
    // Ignore error
  }

  const authType =
    (resolvedSearchParams.authType as string) ||
    (typeof trainingData?.authType === "string" ? trainingData.authType : undefined) ||
    "guest";

  const effectiveTrainingId = trainingId || (trainingData && "_id" in trainingData ? String(trainingData._id) : "");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center px-6 py-8">
      {logoUrl && (
        <div className="mb-8 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={companyName || "Bedrijfslogo"}
            className="h-14 max-h-20 max-w-52 object-contain"
          />
        </div>
      )}
      <JoinTrainingForm
        trainingId={effectiveTrainingId}
        authType={authType as any}
        inviteToken={token}
      />
    </main>
  );
}

