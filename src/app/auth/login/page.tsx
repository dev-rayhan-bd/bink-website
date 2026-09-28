"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthPageLinks } from "@/components/auth/AuthPageLinks";
import { BrandFooter } from "@/components/common/BrandFooter";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPending(true);

    try {
      const response = await login({ identifier: email, password });
      if (!response.success) throw new Error(response.message);

      SuccessToast(response.message || "Succesvol ingelogd");
      router.replace(response.data.user?.role === "company" ? "/company" : "/");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error
          ? error.message
          : "Inloggen mislukt. Probeer het opnieuw.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full flex-col justify-between bg-background px-6 py-10 font-sans text-foreground sm:px-10">
      <div />

      <section className="mx-auto flex w-full max-w-sm flex-col justify-center">
        <div className="mb-10 flex items-center justify-center">
          <Image
            src="/acme-inc.svg"
            alt="Act Inc"
            width={150}
            height={50}
            priority
            className="h-auto w-37.5 max-w-full dark:invert"
          />
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fadeIn">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Inloggen op je account
            </h1>
          </div>

          <FieldGroup>
            <Field>
              <div className="relative flex items-center">
                <Input
                  type="email"
                  placeholder="E-mailadres"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pr-10"
                />
                <Mail className="absolute right-3.5 h-5 w-5 text-muted-foreground/60" />
              </div>
            </Field>

            <Field className="space-y-2">
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Wachtwoord"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg-full" disabled={isPending}>
            {isPending ? "Inloggen..." : "Inloggen"}
            {!isPending && <ArrowRight />}
          </Button>
        </form>

        <AuthPageLinks />
      </section>

      <BrandFooter />
    </main>
  );
}


