"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthPageLinks } from "@/components/auth/AuthPageLinks";
import { BrandFooter } from "@/components/common/BrandFooter";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const response = await forgotPassword({ identifier: email });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "OTP sent successfully");
      router.push(`/auth/reset-password?identifier=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to send OTP");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground justify-between font-sans relative pb-10 w-full">
      
      {/* Top Header Section */}
      <div className="w-full pt-8 px-6 relative">
        <Link href="/auth/login" className="inline-block">
          <div className="w-10 h-10 bg-muted/40 rounded-sm flex items-center justify-center hover:bg-muted/60 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </div>
        </Link>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full py-10">
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

        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
          <div className="space-y-2">
            <h1 className="text-[28px] font-bold font-heading tracking-tight text-foreground leading-[1.2]">
              Wachtwoord vergeten?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vul je e-mailadres in en we sturen je een code om je wachtwoord opnieuw in te stellen.
            </p>
          </div>

          <FieldGroup className="space-y-4">
            <Field>
              <div className="relative flex items-center">
                <Input
                  type="email"
                  placeholder="E-mailadres"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                />
                <Mail className="absolute right-3.5 w-5 h-5 text-muted-foreground/60" />
              </div>
            </Field>
          </FieldGroup>

            <Button
              type="submit"
              size="lg-full"
              disabled={isPending}
            >
              {isPending ? "VERZENDEN..." : "CODE VERZENDEN"}
            </Button>
        </form>
        <AuthPageLinks />
      </div>

      <BrandFooter />
    </div>
  );
}

