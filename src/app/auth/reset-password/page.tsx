"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthPageLinks } from "@/components/auth/AuthPageLinks";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { resetPassword } from "@/services/auth.service";

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return ErrorToast("Email address is missing");
    setIsPending(true);
    try {
      const response = await resetPassword({ identifier, otp, newPassword: password });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Password reset successfully");
      router.replace("/auth/login");
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to reset password");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground justify-between font-sans relative pb-10 w-full">
      
      {/* Top Header Section */}
      <div className="w-full pt-8 px-6 relative">
        <Link href="/auth/verify-otp" className="inline-block">
          <div className="w-10 h-10 bg-muted/40 rounded-sm flex items-center justify-center hover:bg-muted/60 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </div>
        </Link>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full py-10">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3">
            <Image
              src="/acme-logo.svg"
              alt="Act Inc Logo"
              width={36}
              height={36}
              priority
              style={{ height: "auto" }}
            />
            <span className="text-2xl font-bold font-heading tracking-tight text-foreground">
              Act Inc
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
          <div className="space-y-2">
            <h1 className="text-[28px] font-bold font-heading tracking-tight text-foreground leading-[1.2]">
              Nieuw wachtwoord instellen
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kies een nieuw wachtwoord om weer in te loggen op jouw account.
            </p>
          </div>

          <FieldGroup className="space-y-4">
            <Field>
              <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Verificatiecode (OTP)" maxLength={6} required />
            </Field>
            <Field>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nieuw wachtwoord"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </Field>
          </FieldGroup>

            <Button
              type="submit"
              size="lg-full"
              disabled={isPending}
            >
              {isPending ? "OPSLAAN..." : "WACHTWOORD INSTELLEN"}
            </Button>
        </form>
        <AuthPageLinks />
      </div>

      {/* Bottom Footer Section */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-widest text-muted-foreground font-bold uppercase">
        <span>POWERED BY</span>
        <Image
          src="/acme-inc.svg"
          alt="Act Inc Logo"
          width={60}
          height={16}
          className="opacity-70 dark:invert"
        />
      </div>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

