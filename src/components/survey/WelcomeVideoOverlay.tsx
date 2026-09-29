/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandFooter } from "@/components/common/BrandFooter";
import { formatBrandingVideoTitle, getParticipantFirstName } from "@/lib/utils";

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
  const bgVideoRef = useRef<HTMLVideoElement>(null);
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
      bgVideoRef.current?.pause();
    } else {
      void videoRef.current.play();
      void bgVideoRef.current?.play();
    }
  };

  const syncBgVideo = () => {
    if (videoRef.current && bgVideoRef.current) {
      if (Math.abs(bgVideoRef.current.currentTime - videoRef.current.currentTime) > 0.3) {
        bgVideoRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  const participantFirstName = getParticipantFirstName(user);
  const greeting = formatBrandingVideoTitle(
    branding?.videoTitle,
    participantFirstName,
    "nl",
  );

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-120 flex-col overflow-hidden bg-black text-white animate-fadeIn select-none relative">
      {/* 9:16 Full-screen Vertical Video Player Container */}
      <div className="absolute inset-0 size-full overflow-hidden bg-black cursor-pointer" onClick={togglePlay}>
        {/* Ambient Blurred Video Background for 9:16 fill when playing landscape clips */}
        <video
          ref={bgVideoRef}
          src={branding.videoUrl}
          className="absolute inset-0 size-full object-cover blur-2xl scale-125 opacity-50 pointer-events-none select-none"
          muted
          playsInline
        />

        {/* Primary Foreground Video */}
        <video
          ref={videoRef}
          src={branding.videoUrl}
          className="relative z-10 size-full object-cover"
          playsInline
          autoPlay
          onTimeUpdate={syncBgVideo}
          onEnded={handleSkip}
          onPlay={() => {
            setIsPlaying(true);
            void bgVideoRef.current?.play();
          }}
          onPause={() => {
            setIsPlaying(false);
            bgVideoRef.current?.pause();
          }}
        />

        {/* Center Glass Play Button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label="Welkomstvideo afspelen"
              className="flex size-18 items-center justify-center rounded-full bg-white/25 text-white border border-white/50 backdrop-blur-md shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Play className="ml-1 size-9 fill-white" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Top Header Overlay with Dedicated Skip Button */}
      <div className="absolute top-0 inset-x-0 z-30 p-5 pt-8 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-start justify-between gap-3 pointer-events-auto">
        <div className="space-y-2 max-w-[75%]">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-md">
              WELKOM
            </span>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl font-bold leading-tight text-white drop-shadow-md">
            {greeting}
          </h1>

          {(branding.presenterName || branding.presenterDesignation) && (
            <div className="inline-flex flex-col rounded-lg bg-black/50 backdrop-blur-md px-3 py-1.5 border border-white/15 text-xs text-white/90">
              {branding.presenterName && (
                <span className="font-semibold">{branding.presenterName}</span>
              )}
              {branding.presenterDesignation && (
                <span className="text-[11px] text-white/70">{branding.presenterDesignation}</span>
              )}
            </div>
          )}
        </div>

        {/* Top-Right Story Skip Button */}
        <div>
          <Button
            variant="story-skip"
            size="sm"
            onClick={handleSkip}
            aria-label="Overslaan"
          >
            Overslaan <X className="size-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Floating Bottom Action Overlay with Gradient */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-5 pb-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-4 pointer-events-auto">
        {branding.videoDescription && (
          <p className="text-xs sm:text-sm leading-relaxed text-white/90 line-clamp-3 drop-shadow-md">
            {branding.videoDescription}
          </p>
        )}

        <div className="space-y-3">
          <Button
            variant="story-primary"
            size="xl-full"
            onClick={handleSkip}
          >
            DOOR NAAR HET PROGRAMMA <ArrowRight className="ml-1 size-5" />
          </Button>

          <div>
            <BrandFooter variant="white" />
          </div>
        </div>
      </div>
    </div>
  );
}

