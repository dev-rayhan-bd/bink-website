"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TrainingAuthType } from "@/lib/types/training.type";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { authenticateTraining } from "@/services/training.service";

type JoinTrainingFormProps = {
  trainingId: string;
  authType?: string;
  inviteToken?: string;
};

const authLabels: Record<
  TrainingAuthType,
  { title: string; label: string; placeholder: string; description: string }
> = {
  passcode: {
    title: "Inloggen met toegangscode",
    label: "Toegangscode",
    placeholder: "Voer toegangscode in",
    description: "Vul je toegangscode in om deel te nemen aan deze training.",
  },
  email: {
    title: "Inloggen met e-mail",
    label: "E-mailadres",
    placeholder: "naam@voorbeeld.nl",
    description: "Vul je e-mailadres in om deel te nemen aan deze training.",
  },
  employeeId: {
    title: "Inloggen met werknemers-ID",
    label: "Werknemers-ID",
    placeholder: "EMP001",
    description: "Vul je werknemers-ID in om deel te nemen aan deze training.",
  },
  guest: {
    title: "Inloggen als gast",
    label: "Naam",
    placeholder: "Jouw naam",
    description: "Vul je naam in om deel te nemen aan deze training.",
  },
};

const isTrainingAuthType = (value?: string): value is TrainingAuthType => {
  return (
    value === "passcode" ||
    value === "email" ||
    value === "employeeId" ||
    value === "guest"
  );
};

export function JoinTrainingForm({
  trainingId,
  authType,
}: JoinTrainingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedAuthType = isTrainingAuthType(authType) ? authType : undefined;
  const copy = useMemo(
    () => (selectedAuthType ? authLabels[selectedAuthType] : undefined),
    [selectedAuthType],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAuthType) {
      ErrorToast("Deze trainingslink heeft een ongeldig verificatietype");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("credential") || "").trim();

    if (!value) {
      ErrorToast(`${copy?.label || "Gegeven"} is verplicht`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload =
        selectedAuthType === "guest"
          ? { authType: selectedAuthType, name: value }
          : { authType: selectedAuthType, identifier: value };

      const response = await authenticateTraining(trainingId, payload);

      if (!response.success) throw new Error(response.message);

      SuccessToast(response.message || "Succesvol ingelogd bij de training");
      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : "Kan niet deelnemen aan training",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedAuthType || !copy) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-2xl font-bold">
          Ongeldige trainingslink
        </h1>
        <p className="text-sm text-muted-foreground">
          Deze link mist een ondersteund verificatietype.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold">{copy.title}</h1>
        <p className="text-sm text-muted-foreground">
          {copy.description}
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="training-credential">{copy.label}</FieldLabel>
        <Input
          id="training-credential"
          name="credential"
          type={selectedAuthType === "email" ? "email" : "text"}
          placeholder={copy.placeholder}
          autoComplete={selectedAuthType === "email" ? "email" : "off"}
        />
      </Field>

      <Button type="submit" size="lg-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <ArrowRight />
        )}
        {isSubmitting ? "Bezig..." : "Naar de training"}
      </Button>
    </form>
  );
}

