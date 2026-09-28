"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log technical error with digest for debugging
    console.error("Application error:", error);
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-[80dvh] w-full flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Er ging iets mis
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          Probeer het opnieuw. Lukt het niet? Vernieuw de pagina of neem contact met ons op.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={handleReset} size="default">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    </div>
  );
}

