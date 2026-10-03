"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";

/** <video> bound to a MediaStream. Local previews are muted + mirrored. */
export function StreamVideo({ stream, mirrored = true, className, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream || null;
    if (stream) el.play?.().catch(() => {});
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      aria-label={label}
      className={cn("size-full object-cover", mirrored && "-scale-x-100", className)}
    />
  );
}

/**
 * Live microphone level via the Web Audio API. Writes straight to the DOM
 * on each animation frame (no React re-render per frame).
 */
export function MicLevelMeter({ stream, label, className }) {
  const barRef = useRef(null);

  useEffect(() => {
    const track = stream?.getAudioTracks()[0];
    const Ctx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
    if (!track || !Ctx) return;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(new MediaStream([track]));
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    ctx.resume?.().catch(() => {});
    const data = new Uint8Array(analyser.fftSize);
    let raf = 0;
    const loop = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const level = Math.min(1, Math.sqrt(sum / data.length) * 4);
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${track.enabled ? level : 0})`;
        barRef.current.parentElement?.setAttribute("aria-valuenow", String(Math.round(level * 100)));
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      ctx.close().catch(() => {});
    };
  }, [stream]);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div
        ref={barRef}
        className="h-full origin-left rounded-full bg-gradient-to-r from-online via-gold-400 to-red-500 transition-transform duration-75"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ----------------------------- browser detection ---------------------------- */

const noop = () => () => {};

function detectBrowser() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return "iosSafari";
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Android/.test(ua) && /Chrome\//.test(ua)) return "android";
  if (/Chrome\//.test(ua) && !/OPR\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua)) return "safari";
  return "other";
}

/** "chrome" | "edge" | "firefox" | "safari" | "iosSafari" | "android" | "other" (server: "other"). */
export const useBrowserKind = () => useSyncExternalStore(noop, detectBrowser, () => "other");

export const HELP_BROWSERS = ["chrome", "edge", "firefox", "safari", "iosSafari", "android"];
