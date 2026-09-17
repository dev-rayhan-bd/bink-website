/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const WELCOME_SESSION_PREFIX = "welcome-video-shown:";

const getWelcomeSessionKey = (loginSessionId: string, user: any) => {
  const fallbackUserId =
    user?._id ||
    user?.guestId ||
    user?.employeeId ||
    user?.companyId ||
    "anonymous";

  return `${WELCOME_SESSION_PREFIX}${loginSessionId || fallbackUserId}`;
};

export function WelcomeVideoOverlay({
  branding,
  user,
  loginSessionId,
}: {
  branding: any;
  user: any;
  loginSessionId: string;
}) {
  const [show, setShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const processedSessionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!branding?.videoUrl) return;

    const sessionKey = getWelcomeSessionKey(loginSessionId, user);

    // React Strict Mode runs effects twice in development. Process each login
    // session key only once so the second pass cannot suppress the overlay.
    if (processedSessionKeyRef.current === sessionKey) return;
    processedSessionKeyRef.current = sessionKey;

    try {
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);

        if (
          key?.startsWith(WELCOME_SESSION_PREFIX) &&
          key !== sessionKey
        ) {
          sessionStorage.removeItem(key);
        }
      }

      if (sessionStorage.getItem(sessionKey) === "1") return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // Continue showing the video when session storage is unavailable.
    }

    const timer = window.setTimeout(() => {
      setShow(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [branding?.videoUrl, loginSessionId, user]);

  if (!show || !branding?.videoUrl) return null;

  const handleSkip = () => {
    setShow(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      void videoRef.current.play();
    }
  };

  const participantName =
    user?.firstName ||
    (user?.fullName && user.fullName !== "User" ? user.fullName : "") ||
    (user?.name && user.name !== "User" ? user.name : "");

  const greeting = participantName
    ? `Hoi ${participantName}, welkom bij het programma`
    : "Hoi, welkom bij het programma";

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-120 flex-col justify-between overflow-hidden bg-black text-white animate-fadeIn select-none">
      {/* 9:16 Full-screen Vertical Stories Video */}
      <div className="absolute inset-0 size-full flex items-center justify-center bg-black overflow-hidden" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={branding.videoUrl}
          className="size-full object-contain"
          playsInline
          autoPlay
          onEnded={handleSkip}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label="Welkomstvideo afspelen"
              className="flex size-18 items-center justify-center rounded-full bg-white/25 text-white border border-white/50 backdrop-blur-md shadow-2xl transition-transform hover:scale-110 active:scale-95"
            >
              <Play className="ml-1 size-9 fill-white" />
            </button>
          </div>
        )}
      </div>

      {/* Top Header Overlay with Gradient */}
      <div className="relative z-10 p-5 pt-8 bg-gradient-to-b from-black/85 via-black/40 to-transparent space-y-2 pointer-events-none">
        <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-md">
          WELKOM
        </span>
        <h1 className="font-heading text-xl sm:text-2xl font-bold leading-tight text-white drop-shadow-md">
          {greeting}
        </h1>

        {(branding.presenterName || branding.presenterDesignation) && (
          <div className="inline-flex flex-col rounded-lg bg-black/40 backdrop-blur-md px-3 py-1.5 border border-white/15 text-xs text-white/90">
            {branding.presenterName && (
              <span className="font-semibold">{branding.presenterName}</span>
            )}
            {branding.presenterDesignation && (
              <span className="text-[11px] text-white/70">{branding.presenterDesignation}</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Overlay with Gradient */}
      <div className="relative z-10 p-5 pb-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-4">
        {branding.videoDescription && (
          <p className="text-xs sm:text-sm leading-relaxed text-white/90 line-clamp-3 drop-shadow-sm">
            {branding.videoDescription}
          </p>
        )}

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full text-sm font-bold uppercase tracking-wider shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSkip}
          >
            DOOR NAAR HET PROGRAMMA <ArrowRight className="ml-2 size-4" />
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-white/70">
            <span>MOGELIJK GEMAAKT DOOR</span>
            <Image
              src="/acme-inc.svg"
              alt="Act Inc"
              width={60}
              height={16}
              className="h-3.5 w-auto object-contain brightness-0 invert opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
