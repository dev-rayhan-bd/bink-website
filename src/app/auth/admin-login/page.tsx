"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthPageLinks } from "@/components/auth/AuthPageLinks";
import { BrandFooter } from "@/components/common/BrandFooter";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { adminLogin } from "@/services/admin.service";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    try {
      const result = await adminLogin({ identifier, password });
      if (!result.success) {
        ErrorToast(result.message);
        return;
      }

      SuccessToast(result.message);
      router.replace("/super-admin");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.",
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

        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
          <div className="mb-6 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage the Act Inc platform.
            </p>
          </div>

          <FieldGroup>
            <Field>
              <div className="relative flex items-center">
                <Input
                  name="identifier"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  className="pr-10"
                />
                <Mail className="pointer-events-none absolute right-3.5 h-5 w-5 text-muted-foreground/60" />
              </div>
            </Field>

            <Field className="space-y-2">
              <div className="relative flex items-center">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-1 text-right">
                <Link
                  href="/auth/admin-forgot-password"
                  className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Forgot Password?
                </Link>
              </div>
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Log In"}
            {!isPending && <ArrowRight />}
          </Button>
        </form>

        <AuthPageLinks showUserLogin />
      </section>

      <BrandFooter />
    </main>
  );
}