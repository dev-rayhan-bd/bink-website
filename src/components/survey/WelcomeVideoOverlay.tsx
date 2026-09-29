/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  RotateCw,
} from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showMutedHint, setShowMutedHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "rewind" | "forward";
    id: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const processedSessionKeyRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTimeRef = useRef<number>(0);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHoldingStateRef = useRef<boolean>(false);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize display based on session storage
  useEffect(() => {
    if (!branding?.videoUrl) return;

    const sessionKey = getWelcomeSessionKey(loginSessionId, user);

    if (processedSessionKeyRef.current === sessionKey) return;
    processedSessionKeyRef.current = sessionKey;

    try {
      for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
        const key = sessionStorage.key(index);

        if (key?.startsWith(WELCOME_SESSION_PREFIX) && key !== sessionKey) {
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

  // Handle Autoplay & Sound
  useEffect(() => {
    if (!show || !branding?.videoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch(() => {
          // Browser prevented unmuted autoplay; fallback to muted autoplay with notification
          video.muted = true;
          setIsMuted(true);
          setShowMutedHint(true);
          void video.play().then(() => {
            setIsPlaying(true);
          });
        });
    }
  }, [show, branding?.videoUrl]);

  // 60FPS Smooth progress bar tracking
  useEffect(() => {
    if (!show) return;

    const syncProgress = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        setProgress(Math.min(100, Math.max(0, pct)));
      }
      rafRef.current = requestAnimationFrame(syncProgress);
    };

    rafRef.current = requestAnimationFrame(syncProgress);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [show]);

  const handleSkip = useCallback(() => {
    setShow(false);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    const ambient = ambientVideoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      if (ambient && ambient.paused) {
        ambient.currentTime = video.currentTime;
        void ambient.play().catch(() => {});
      }
      setIsPlaying(true);
    } else {
      video.pause();
      if (ambient && !ambient.paused) {
        ambient.pause();
      }
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setShowMutedHint(false);
    }
  }, []);

  const triggerFeedback = useCallback((type: "rewind" | "forward") => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback({ type, id: Date.now() });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
    }, 650);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownTimeRef.current = Date.now();
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    isHoldingStateRef.current = false;

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }

    // Long press (>220ms) triggers Story "Hold to Pause"
    holdTimerRef.current = setTimeout(() => {
      isHoldingStateRef.current = true;
      setIsHolding(true);
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        if (ambientVideoRef.current) ambientVideoRef.current.pause();
      }
    }, 220);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // If it was a hold gesture, release to resume
    if (isHoldingStateRef.current) {
      isHoldingStateRef.current = false;
      setIsHolding(false);
      if (videoRef.current && videoRef.current.paused) {
        void videoRef.current.play();
        if (ambientVideoRef.current) {
          ambientVideoRef.current.currentTime = videoRef.current.currentTime;
          void ambientVideoRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }
      return;
    }

    // Quick tap interaction: Left 28% (Rewind), Right 28% (Fast Forward), Center (Play/Pause)
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const width = rect.width;
    const tapRatio = tapX / width;

    const video = videoRef.current;
    if (!video) return;

    if (tapRatio < 0.28) {
      // Tap Left: Rewind 5 seconds
      video.currentTime = Math.max(0, video.currentTime - 5);
      if (ambientVideoRef.current) {
        ambientVideoRef.current.currentTime = video.currentTime;
      }
      triggerFeedback("rewind");
    } else if (tapRatio > 0.72) {
      // Tap Right: Forward 5 seconds
      if (video.duration && video.currentTime + 5 >= video.duration) {
        handleSkip();
      } else {
        video.currentTime = Math.min(video.duration || 9999, video.currentTime + 5);
        if (ambientVideoRef.current) {
          ambientVideoRef.current.currentTime = video.currentTime;
        }
        triggerFeedback("forward");
      }
    } else {
      // Tap Center: Play / Pause toggle
      togglePlay();
    }
  };

  const handlePointerCancel = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isHoldingStateRef.current) {
      isHoldingStateRef.current = false;
      setIsHolding(false);
      if (videoRef.current && videoRef.current.paused) {
        void videoRef.current.play();
        if (ambientVideoRef.current) {
          ambientVideoRef.current.currentTime = videoRef.current.currentTime;
          void ambientVideoRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }
    }
  };

  if (!show || !branding?.videoUrl) return null;

  const participantFirstName = getParticipantFirstName(user);
  const greeting = formatBrandingVideoTitle(
    branding?.videoTitle,
    participantFirstName,
    "nl",
  );

  const logoSrc = branding?.logo || "/acme-inc.svg";

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-120 flex-col justify-between overflow-hidden bg-black text-white animate-fadeIn select-none font-sans">
      {/* Dynamic Ambient Background Glow from Video */}
      <video
        ref={ambientVideoRef}
        src={branding.videoUrl}
        aria-hidden="true"
        tabIndex={-1}
        playsInline
        muted
        className="pointer-events-none absolute inset-0 size-full scale-125 object-cover opacity-50 blur-3xl brightness-75 transition-opacity duration-500"
      />

      {/* Main Interactive Video Area with Story Gesture Zone */}
      <div
        className="absolute inset-0 size-full flex items-center justify-center bg-transparent overflow-hidden cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <video
          ref={videoRef}
          src={branding.videoUrl}
          className="relative z-0 size-full max-h-full object-contain"
          playsInline
          onEnded={handleSkip}
          onPlay={() => {
            setIsPlaying(true);
            if (ambientVideoRef.current && ambientVideoRef.current.paused) {
              ambientVideoRef.current.currentTime = videoRef.current?.currentTime || 0;
              void ambientVideoRef.current.play().catch(() => {});
            }
          }}
          onPause={() => {
            setIsPlaying(false);
            if (ambientVideoRef.current && !ambientVideoRef.current.paused) {
              ambientVideoRef.current.pause();
            }
          }}
        />

        {/* Story Hold Indicator */}
        {isHolding && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md border border-white/15 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <Pause className="size-3.5 fill-white" />
            <span>Gepauzeerd</span>
          </div>
        )}

        {/* Center Play Button Overlay (when paused and not holding) */}
        {!isPlaying && !isHolding && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity">
            <div className="flex size-18 items-center justify-center rounded-full bg-white/20 text-white border border-white/40 backdrop-blur-md shadow-2xl transition-transform hover:scale-110 active:scale-95">
              <Play className="ml-1 size-9 fill-white" />
            </div>
          </div>
        )}

        {/* Rewind Feedback Pill */}
        {feedback?.type === "rewind" && (
          <div
            key={feedback.id}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center size-16 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/25 pointer-events-none animate-in fade-in zoom-in-75 duration-200"
          >
            <RotateCcw className="size-6" />
            <span className="text-[10px] font-bold tracking-tight">-5s</span>
          </div>
        )}

        {/* Forward Feedback Pill */}
        {feedback?.type === "forward" && (
          <div
            key={feedback.id}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center size-16 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/25 pointer-events-none animate-in fade-in zoom-in-75 duration-200"
          >
            <RotateCw className="size-6" />
            <span className="text-[10px] font-bold tracking-tight">+5s</span>
          </div>
        )}
      </div>

      {/* Top Instagram Story Header Overlay */}
      <div className="relative z-20 flex flex-col bg-gradient-to-b from-black/85 via-black/50 to-transparent pt-3 pb-6 px-3.5 space-y-2.5 pointer-events-auto">
        {/* Instagram Story Progress Bar */}
        <div className="w-full">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/30 backdrop-blur-xs">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* User Story Profile & Control Actions */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Profile & Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative size-10 rounded-full p-[2px] bg-gradient-to-tr from-primary via-primary/80 to-secondary shrink-0 shadow-md">
              <div className="size-full rounded-full overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt={branding.presenterName || "Logo"}
                  className="size-full object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate drop-shadow-sm">
                  {branding.presenterName || "Welkomstboodschap"}
                </span>
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full shadow-xs shrink-0">
                  WELKOM
                </span>
              </div>
              <span className="text-[11px] text-white/80 font-medium leading-tight truncate drop-shadow-xs">
                {branding.presenterDesignation || "Borging Programma"}
              </span>
            </div>
          </div>

          {/* Story Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              aria-label={isMuted ? "Geluid aanzetten" : "Geluid dempen"}
              className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              {isMuted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? "Pauzeren" : "Afspelen"}
              className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              {isPlaying ? (
                <Pause className="size-4" />
              ) : (
                <Play className="ml-0.5 size-4 fill-white" />
              )}
            </button>

            {/* Close / Skip Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              aria-label="Sluiten"
              className="flex size-8 items-center justify-center rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tap for sound banner (if browser auto-muted) */}
        {showMutedHint && isMuted && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="self-center mt-1 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/25 shadow-xl animate-bounce cursor-pointer"
          >
            <VolumeX className="size-3.5" />
            <span>Tik voor geluid</span>
          </div>
        )}
      </div>

      {/* Bottom Story Information & Action CTA Overlay */}
      <div className="relative z-20 flex flex-col bg-gradient-to-t from-black/95 via-black/70 via-40% to-transparent p-5 pb-6 pt-12 space-y-4 pointer-events-auto">
        {/* Title & Caption */}
        <div className="space-y-1.5">
          <h1 className="font-heading text-lg sm:text-xl font-bold leading-tight text-white drop-shadow-md">
            {greeting}
          </h1>

          {branding.videoDescription ? (
            <p className="text-xs sm:text-sm leading-relaxed text-white/90 line-clamp-3 drop-shadow-sm">
              {branding.videoDescription}
            </p>
          ) : (
            <p className="text-xs text-white/70 leading-relaxed drop-shadow-sm">
              Bekijk de welkomstvideo en klik hieronder om direct met jouw programma te starten.
            </p>
          )}
        </div>

        {/* Bottom CTA Button & Branding */}
        <div className="space-y-3 pt-1">
          <div>
            <Button
              size="story-cta"
              onClick={handleSkip}
            >
              DOOR NAAR HET PROGRAMMA <ArrowRight className="size-4" />
            </Button>
          </div>

          <BrandFooter variant="white" />
        </div>
      </div>
    </div>
  );
}
