"use client";

import { useEffect, useRef, useState } from "react";
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

export function MediaVideo({
  value,
  className,
  autoPlay = false,
  onEnded,
  controls = false,
  muted = false,
  loop = false,
}: {
  value: MediaValue;
  className?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [objectUrl, setObjectUrl] = useState<string>();
  const [isBuffering, setIsBuffering] = useState(false);
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
              if (isMounted) setIsBuffering(false);
            })
            .catch(() => {
              if (isMounted && !video.muted) {
                video.muted = true;
                void video.play().then(() => {
                  if (isMounted) setIsBuffering(false);
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
      if (isMounted) setIsBuffering(false);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

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
    };
  }, [src, autoPlay]);

  if (!src) return null;

  return (
    <div className="relative size-full flex items-center justify-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        controls={controls}
        playsInline
        preload="auto"
        muted={muted}
        loop={loop}
        className={className}
        onEnded={onEnded}
      />
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fadeIn">
          <div className="size-10 animate-spin rounded-full border-3 border-white/20 border-t-white" />
        </div>
      )}
    </div>
  );
}