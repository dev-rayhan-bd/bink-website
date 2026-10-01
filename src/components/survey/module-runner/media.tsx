"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaValue } from "./types";

export function MediaImage({
  value,
  alt = "",
  className,
  onLoad,
}: {
  value: MediaValue;
  alt?: string;
  className?: string;
  onLoad?: () => void;
}) {
  const [objectUrl, setObjectUrl] = useState<string>();
  const src = value instanceof File ? objectUrl : value;

  useEffect(() => {
    if (!(value instanceof File)) return;

    const nextUrl = URL.createObjectURL(value);
    const timer = window.setTimeout(() => setObjectUrl(nextUrl), 0);

    return () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(nextUrl);
    };
  }, [value]);

  if (!src) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onLoad={onLoad} />;
}

const formatVideoTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export function MediaVideo({
  value,
  className,
  autoPlay = false,
  onEnded,
  showControls = true,
  muted = false,
  loop = false,
}: {
  value: MediaValue;
  className?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  controls?: boolean;
  showControls?: boolean;
  muted?: boolean;
  loop?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectUrl, setObjectUrl] = useState<string>();
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(muted);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const src = value instanceof File ? objectUrl : value;

  useEffect(() => {
    if (!(value instanceof File)) return;

    const nextUrl = URL.createObjectURL(value);
    const timer = window.setTimeout(() => setObjectUrl(nextUrl), 0);

    return () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(nextUrl);
    };
  }, [value]);

  const showControlsTemporarily = useCallback(() => {
    setAreControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setAreControlsVisible(false);
      }
    }, 2800);
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let isMounted = true;

    const attemptPlay = () => {
      if (!isMounted || !video || !autoPlay) return;

      if (video.readyState >= 3) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (isMounted) {
                setIsBuffering(false);
                setIsPlaying(true);
              }
            })
            .catch(() => {
              if (isMounted && !video.muted) {
                video.muted = true;
                setIsMuted(true);
                void video.play().then(() => {
                  if (isMounted) {
                    setIsBuffering(false);
                    setIsPlaying(true);
                  }
                });
              }
            });
        }
      } else {
        setIsBuffering(true);
      }
    };

    const handleCanPlay = () => {
      if (autoPlay) attemptPlay();
    };

    const handleWaiting = () => {
      if (isMounted) setIsBuffering(true);
    };

    const handlePlaying = () => {
      if (isMounted) {
        setIsBuffering(false);
        setIsPlaying(true);
      }
    };

    const handlePause = () => {
      if (isMounted) {
        setIsPlaying(false);
        setAreControlsVisible(true);
      }
    };

    const handleTimeUpdate = () => {
      if (isMounted && video) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (isMounted && video) {
        setDuration(video.duration);
      }
    };

    const handleEnded = () => {
      if (isMounted) {
        setIsPlaying(false);
        setAreControlsVisible(true);
        onEnded?.();
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("durationchange", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    if (autoPlay) {
      if (video.readyState >= 3) {
        attemptPlay();
      } else {
        setIsBuffering(true);
      }
    }

    return () => {
      isMounted = false;
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("durationchange", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [src, autoPlay, onEnded]);

  if (!src) return null;

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      void video.play();
    } else {
      video.pause();
    }
    showControlsTemporarily();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    showControlsTemporarily();
  };

  const skipTime = (seconds: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const target = Math.min(
      Math.max(0, video.currentTime + seconds),
      duration || video.duration || 0,
    );
    video.currentTime = target;
    setCurrentTime(target);
    showControlsTemporarily();
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    showControlsTemporarily();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => showControlsTemporarily()}
      className="group relative size-full flex items-center justify-center overflow-hidden bg-black select-none"
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="auto"
        muted={isMuted}
        loop={loop}
        className={cn("size-full object-contain", className)}
      />

      {/* Center Buffering Spinner */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-fadeIn">
          <div className="size-11 animate-spin rounded-full border-3 border-white/20 border-t-white" />
        </div>
      )}

      {/* Floating Center Play Button when Paused */}
      {showControls && !isPlaying && !isBuffering && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute z-20 flex size-16 items-center justify-center rounded-full bg-black/65 text-white border border-white/25 shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Video afspelen"
        >
          <Play className="size-8 fill-white translate-x-0.5 text-white" />
        </button>
      )}

      {/* Bottom Interactive Video Controller Bar */}
      {showControls && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-30 flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/55 to-transparent transition-all duration-300",
            areControlsVisible || !isPlaying
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress / Scrubber Range Bar */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1 flex items-center group/track cursor-pointer py-1.5">
              {/* Background Track */}
              <div className="relative w-full h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-[width] duration-75"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Native Scrubber Input for Dragging & Seeking */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Video voortgang"
              />
            </div>

            {/* Time label */}
            <span className="text-[11px] sm:text-xs font-semibold tabular-nums text-white/90 shrink-0">
              {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
            </span>
          </div>

          {/* Controller Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
                aria-label={isPlaying ? "Pauzeren" : "Afspelen"}
              >
                {isPlaying ? (
                  <Pause className="size-4 fill-white" />
                ) : (
                  <Play className="size-4 fill-white translate-x-0.5" />
                )}
              </button>

              {/* -10s Jump Back */}
              <button
                type="button"
                onClick={(e) => skipTime(-10, e)}
                className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold backdrop-blur-sm gap-0.5"
                title="10 seconden terug"
                aria-label="10 seconden terug"
              >
                <RotateCcw className="size-3.5" />
                <span className="text-[10px]">10</span>
              </button>

              {/* +10s Jump Forward */}
              <button
                type="button"
                onClick={(e) => skipTime(10, e)}
                className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold backdrop-blur-sm gap-0.5"
                title="10 seconden vooruit"
                aria-label="10 seconden vooruit"
              >
                <RotateCw className="size-3.5" />
                <span className="text-[10px]">10</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Volume / Mute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm"
                aria-label={isMuted ? "Geluid aanzetten" : "Geluid dempen"}
              >
                {isMuted ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}