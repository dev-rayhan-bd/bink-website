"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Phone, ChevronUp } from "lucide-react";
import { formatBrandingVideoTitle, getParticipantFirstName } from "@/lib/utils";

interface WelcomeCallScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  onComplete: () => void;
}

export function WelcomeCallScreen({
  user,
  onComplete,
}: WelcomeCallScreenProps) {
  const [status, setStatus] = useState<"calling" | "playing">("calling");

  // Drag state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startYRef.current;

    // Only allow dragging up, limit to -200px
    if (deltaY < 0 && deltaY > -200) {
      setDragY(deltaY);
    }

    // If dragged up by 120px, answer the call
    if (deltaY <= -120) {
      setIsDragging(false);
      setStatus("playing");
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Reset position if not answered
    setDragY(0);
  };

  const logoSrc = user?.branding?.logoUrl || "/acme-inc.svg";
  const secondaryColor = user?.branding?.secondaryColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative w-full max-w-120 h-dvh bg-background text-foreground flex flex-col overflow-hidden shadow-2xl border-x border-border animate-in fade-in duration-300">
        {status === "playing" ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Video container */}
            <div className="flex-1 relative bg-black/90 flex flex-col justify-center items-center overflow-hidden min-h-0">
              {/* Logo overlay */}
              <div className="absolute top-4 left-4 z-10 p-2 bg-background/70 backdrop-blur-md rounded-lg border border-border shadow-sm">
                <Image
                  src={logoSrc}
                  alt="Company Logo"
                  width={90}
                  height={28}
                  className="h-auto w-auto object-contain dark:invert"
                />
              </div>

              <video
                src={user?.branding?.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[55dvh] object-contain bg-black"
              />
            </div>

            {/* Bottom details card (System theme colors) */}
            <div className="bg-card text-card-foreground border-t border-border p-5 flex flex-col gap-4 overflow-y-auto shrink-0 max-h-[50dvh]">
              <div className="space-y-1.5">
                <p
                  className="text-xs font-bold tracking-widest uppercase text-primary"
                  style={secondaryColor ? { color: secondaryColor } : undefined}
                >
                  Welcome Message
                </p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {formatBrandingVideoTitle(
                    user?.branding?.videoTitle,
                    getParticipantFirstName(user),
                    "en",
                  )}
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {user?.branding?.videoDescription ||
                    "We're asking everyone in our organization to take part in this short training. It's about creating a workplace where everyone feels respected and heard."}
                </p>
              </div>

              <div className="bg-muted/50 border border-border p-3.5 rounded-lg flex flex-col gap-0.5 w-full">
                <p className="font-semibold text-sm text-foreground">
                  {user?.branding?.presenterName || "Presenter"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {user?.branding?.presenterDesignation || "Programme Lead"}
                </p>
              </div>

              <button
                type="button"
                onClick={onComplete}
                style={secondaryColor ? { backgroundColor: secondaryColor } : undefined}
                className="w-full bg-primary text-primary-foreground font-bold tracking-wide uppercase px-6 py-3.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                Skip to the program <span className="text-base leading-none">→</span>
              </button>
            </div>
          </div>
        ) : (
          /* Incoming Call state */
          <div className="flex-1 flex flex-col items-center justify-between py-12 px-6 h-full animate-in slide-in-from-bottom-full duration-500">
            <div className="flex flex-col items-center gap-10 mt-8">
              <p className="text-muted-foreground text-base font-medium tracking-wide">
                Incoming call...
              </p>

              <div className="relative">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-border bg-card shadow-xl flex items-center justify-center p-4 relative z-10">
                  <Image
                    src={logoSrc}
                    alt="Company Logo"
                    width={90}
                    height={90}
                    className="object-contain dark:invert"
                  />
                </div>
                {/* Animated rings */}
                <div
                  className="absolute inset-0 rounded-full border border-primary/40 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
              </div>

              <h1 className="text-3xl font-bold text-foreground tracking-tight text-center px-4">
                {user?.branding?.presenterName || "Company Presenter"}
              </h1>
            </div>

            <div className="flex flex-col items-center gap-4 mb-8 touch-none">
              <div className="flex flex-col items-center gap-[-4px] text-muted-foreground/60 mb-2 animate-bounce">
                <ChevronUp className="w-7 h-7 opacity-50 -mb-3" />
                <ChevronUp className="w-7 h-7 opacity-75 -mb-3" />
                <ChevronUp className="w-7 h-7 opacity-100" />
              </div>

              <div
                ref={buttonRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ transform: `translateY(${dragY}px)` }}
                className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-transform duration-75 ease-out"
              >
                <Phone className="w-9 h-9 text-white fill-white animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
