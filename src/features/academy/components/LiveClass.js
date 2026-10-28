"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useLocalMedia } from "@/features/session/hooks/useLocalMedia";
import { cn } from "@/lib/utils/cn";

const STATUS_TEXT = {
  denied: "Camera/microphone blocked. Allow access in your browser's address bar, then try again.",
  notfound: "No camera or microphone found on this device.",
  inuse: "Your camera is being used by another app. Close it and try again.",
  unsupported: "Video needs a secure (https) page and a modern browser.",
  error: "Couldn't start your camera. Please try again.",
};

/**
 * Live video class: schedule → device check (camera preview, mic/cam toggles) → join → waiting room.
 * DEMO: the trainer's live room isn't connected yet (needs the backend's video-room API, as in 1:1 calls).
 */
export function LiveClass({ course }) {
  const [step, setStep] = useState("info"); // info | check | joined

  if (step === "info") {
    return (
      <div className="rounded-2xl border border-line p-5">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-gold-400" aria-hidden />
          <div>
            <p className="font-semibold">{`${course.live.day} · ${course.live.time}`}</p>
            <p className="text-sm text-muted">{`${course.live.length} live video class with ${course.trainer.name}. Ask questions, share your screen and practise charts together.`}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setStep("check")}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-400 dark:text-brand-950"
        >
          <Video className="size-4" aria-hidden /> Join live class
        </button>
      </div>
    );
  }

  return <DeviceRoom course={course} joined={step === "joined"} onJoin={() => setStep("joined")} onLeave={() => setStep("info")} />;
}

function DeviceRoom({ course, joined, onJoin, onLeave }) {
  const { status, stream, request } = useLocalMedia({ video: true });
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  useEffect(() => {
    if (status === "idle") request();
  }, [status, request]);

  useEffect(() => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = mic));
    stream?.getVideoTracks().forEach((t) => (t.enabled = cam));
  }, [stream, mic, cam]);

  const ctrl = (on) =>
    cn("flex size-11 items-center justify-center rounded-full transition", on ? "bg-white/15 text-white hover:bg-white/25" : "bg-red-600 text-white hover:bg-red-700");

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="relative aspect-video bg-neutral-900">
        {status === "ready" && cam ? (
          // callback ref: re-attaches the stream whenever the preview re-mounts (camera toggled back on)
          <video ref={(el) => el && stream && el.srcObject !== stream && (el.srcObject = stream)} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-white/80">
            {status === "requesting" || status === "idle" ? (
              <>
                <Loader2 className="size-6 animate-spin" aria-hidden /> Starting your camera…
              </>
            ) : STATUS_TEXT[status] ? (
              <>
                <p>{STATUS_TEXT[status]}</p>
                <button type="button" onClick={() => request()} className="rounded-full bg-white/15 px-4 py-1.5 font-semibold hover:bg-white/25">
                  Try again
                </button>
              </>
            ) : (
              <p>Camera is off</p>
            )}
          </div>
        )}

        {joined && (
          <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 text-sm text-white">
            <span className="size-2 animate-pulse rounded-full bg-amber-400" aria-hidden />
            {`Waiting for ${course.trainer.name} to start the class…`}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent p-4">
          <button type="button" onClick={() => setMic((v) => !v)} className={ctrl(mic)} aria-label={mic ? "Mute microphone" : "Unmute microphone"}>
            {mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>
          <button type="button" onClick={() => setCam((v) => !v)} className={ctrl(cam)} aria-label={cam ? "Turn camera off" : "Turn camera on"}>
            {cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
          {joined && (
            <button type="button" onClick={onLeave} className={ctrl(false)} aria-label="Leave class">
              <PhoneOff className="size-5" />
            </button>
          )}
        </div>
      </div>

      {!joined && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted">Check your camera and microphone, then join.</p>
          <div className="flex gap-2">
            <button type="button" onClick={onLeave} className="h-10 rounded-full border border-line px-4 text-sm font-semibold hover:bg-surface-muted">
              Cancel
            </button>
            <button type="button" onClick={onJoin} className="h-10 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-400 dark:text-brand-950">
              Join now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
