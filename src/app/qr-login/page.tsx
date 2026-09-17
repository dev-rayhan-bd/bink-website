"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { qrLogin } from "@/services/auth.service";

function QrLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAttempted = useRef(false);
  const qrToken = searchParams.get("token");
  const [errorMessage, setErrorMessage] = useState(() =>
    qrToken ? "" : "This QR login link is invalid."
  );

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    if (!qrToken) return;

    const authenticate = async () => {
      const result = await qrLogin({ qrToken });

      if (!result.success) {
        setErrorMessage(result.message);
        ErrorToast(result.message);
        return;
      }

      SuccessToast(result.message);
      router.replace("/");
      router.refresh();
    };

    void authenticate();
  }, [qrToken, router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center px-6 text-center">
      <div className="mb-10 flex items-center gap-3">
        <Image src="/acme-logo.svg" alt="Act Inc" width={36} height={36} priority />
        <span className="font-heading text-2xl font-bold">Act Inc</span>
      </div>

      {errorMessage ? (
        <div className="w-full space-y-5">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold">QR-inloggen mislukt</h1>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button asChild size="lg-full">
            <Link href="/auth/login">Naar inloggen</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold">Je wordt ingelogd</h1>
            <p className="text-sm text-muted-foreground">
              Even geduld terwijl we jouw QR-code verifiëren.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function QrLoginPage() {
  return (
    <Suspense>
      <QrLoginContent />
    </Suspense>
  );
}

