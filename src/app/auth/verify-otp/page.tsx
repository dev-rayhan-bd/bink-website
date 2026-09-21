"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthPageLinks } from "@/components/auth/AuthPageLinks";
import { BrandFooter } from "@/components/common/BrandFooter";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ErrorToast, SuccessToast } from "@/lib/utils";
import { resendOtp, verifyRegistrationOtp } from "@/services/auth.service";

function VerifyOtpForm() {
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
      const response = await verifyRegistrationOtp({ identifier, otp });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "Account verified successfully");
      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to verify OTP");
    } finally {
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    if (!identifier) return ErrorToast("Email address is missing");
    try {
      const response = await resendOtp({ identifier });
      if (!response.success) throw new Error(response.message);
      SuccessToast(response.message || "OTP sent successfully");
    } catch (error: unknown) {
      ErrorToast(error instanceof Error ? error.message : "Unable to resend OTP");
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground justify-between font-sans relative pb-10 w-full">
      
      {/* Top Header Section */}
      <div className="w-full pt-8 px-6 relative">
        <Link href="/auth/forgot-password" className="inline-block">
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
              Verifieer jouw code
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We hebben een code gestuurd naar {identifier || "jouw e-mailadres"}. Vul deze hieronder in om verder te gaan.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center w-full">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                className="w-full flex justify-between gap-2"
                containerClassName="w-full"
              >
                <InputOTPGroup className="w-full flex justify-between gap-2">
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl rounded-md bg-muted/30 border-muted" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl rounded-md bg-muted/30 border-muted" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl rounded-md bg-muted/30 border-muted" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl rounded-md bg-muted/30 border-muted" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl rounded-md bg-muted/30 border-muted" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl rounded-md bg-muted/30 border-muted" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="text-center text-xs text-muted-foreground">
              Geen code ontvangen? <button type="button" onClick={handleResend} className="text-primary hover:underline font-medium">Code opnieuw versturen.</button>
            </div>
          </div>

            <Button
              type="submit"
              size="lg-full"
              disabled={isPending || otp.length !== 6}
            >
              {isPending ? "VERIFIËREN..." : "CODE VERIFIËREN"}
            </Button>
        </form>
        <AuthPageLinks />
      </div>

      <BrandFooter />
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}

