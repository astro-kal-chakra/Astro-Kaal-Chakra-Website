"use client";

import { Camera, ChevronDown, Globe, Info, Lock, Mic, MonitorSmartphone, RotateCcw, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Select } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Skeleton";
import { AstrologerIdentity, SessionMeter } from "../SessionParts";
import { HELP_BROWSERS, MicLevelMeter, StreamVideo, useBrowserKind } from "./MediaBits";
import { label as t } from "@/lib/labels";

/** Shown when camera / mic access is blocked: per-browser unblock steps. */
function PermissionHelp({ voiceOnly, onRetry, retrying }) {
  const current = useBrowserKind();
  const ordered = [...HELP_BROWSERS].sort((a, b) => (a === current ? -1 : b === current ? 1 : 0));

  return (
    <div className="space-y-4" role="alert">
      <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        <p className="flex items-center gap-2 font-semibold">
          <Lock className="size-5 shrink-0" aria-hidden />
          {(voiceOnly ? "Microphone is blocked" : "Camera or microphone is blocked")}
        </p>
        <p className="mt-1 text-sm">Your browser is blocking access. Follow the steps for your browser below, then tap “Try again”.</p>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {ordered.map((b) => (
          <details key={b} open={b === current} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Globe className="size-4 text-muted" aria-hidden />
                {t(`session.call.help.${b}.name`)}
                {b === current && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-800 dark:text-brand-200">
                    Your browser
                  </span>
                )}
              </span>
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ol className="list-decimal space-y-1 px-4 pb-4 pl-9 text-sm text-muted">
              {[1, 2, 3].map((n) => (
                <li key={n}>{t(`session.call.help.${b}.step${n}`)}</li>
              ))}
            </ol>
          </details>
        ))}
      </div>

      <Button size="lg" className="w-full" onClick={onRetry} loading={retrying}>
        <RotateCcw className="size-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}

function DeviceProblem({ status, onRetry, retrying }) {
  return (
    <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
      <p className="font-semibold">{t(`session.call.problem.${status}Title`)}</p>
      <p className="mt-1 text-sm">{t(`session.call.problem.${status}Text`)}</p>
      {status !== "unsupported" && (
        <Button variant="outline" className="mt-3" onClick={onRetry} loading={retrying}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}

function DeviceSelect({ id, label, icon: Icon, options, value, onChange, fallback }) {
  if (!options.length) return null;
  return (
    <Field
      label={
        <span className="flex items-center gap-1.5">
          <Icon className="size-4 text-muted" aria-hidden />
          {label}
        </span>
      }
      htmlFor={id}
    >
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((d, i) => (
          <option key={d.id} value={d.id}>
            {d.label || `${fallback} ${i + 1}`}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** Permission step → device check → join. */
export function PreJoin({ astrologer, voiceOnly, media, live, onJoin, joining }) {
  const { status, stream, devices, selected, request, selectDevice } = media;
  const canPickSpeaker = typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype;
  const ready = status === "ready" && stream;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4">
          <AstrologerIdentity
            astrologer={astrologer}
            className="flex-1"
            subtitle={(voiceOnly ? "Voice call" : "Video call")}
          />
          <SessionMeter elapsed={live.elapsed} balance={live.balance} freeRemaining={live.freeRemaining} className="hidden sm:flex" />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-4 px-4 pb-32 pt-5">
          <h1 className="font-display text-xl font-semibold">Get ready to join</h1>

          {(status === "idle" || (status === "requesting" && !stream)) && (
            <Card className="p-5 text-center">
              <div className="mx-auto flex w-fit gap-3">
                {!voiceOnly && (
                  <span className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-200">
                    <Camera className="size-7" aria-hidden />
                  </span>
                )}
                <span className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-200">
                  <Mic className="size-7" aria-hidden />
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold">
                {(voiceOnly ? "Allow microphone" : "Allow camera and microphone")}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
                {`Your browser will ask for permission so ${astrologer.name} can see and hear you. Nothing is recorded.`}
              </p>
              <Button size="lg" className="mt-5 min-w-52" onClick={() => request()} loading={status === "requesting"}>
                Allow access
              </Button>
            </Card>
          )}

          {status === "denied" && <PermissionHelp voiceOnly={voiceOnly} onRetry={() => request()} />}
          {["notfound", "inuse", "unsupported", "error"].includes(status) && (
            <DeviceProblem status={status} onRetry={() => request()} />
          )}

          {stream && (
            <Card className="overflow-hidden">
              {!voiceOnly && (
                <div className="relative aspect-video bg-brand-950">
                  <StreamVideo stream={stream} label="Your camera preview" />
                  {status === "requesting" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Spinner className="border-white/40 border-t-white" />
                    </div>
                  )}
                  {!stream.getVideoTracks().length && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                      <VideoOff className="size-8" aria-hidden />
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4 p-4">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <Mic className="size-4 text-muted" aria-hidden />
                    Say something to test your microphone
                  </p>
                  <MicLevelMeter stream={stream} label="Microphone level" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {!voiceOnly && (
                    <DeviceSelect
                      id="cam-select"
                      label="Camera"
                      icon={Video}
                      options={devices.videoinput}
                      value={selected.cam}
                      onChange={(id) => selectDevice("cam", id)}
                      fallback="Camera"
                    />
                  )}
                  <DeviceSelect
                    id="mic-select"
                    label="Microphone"
                    icon={Mic}
                    options={devices.audioinput}
                    value={selected.mic}
                    onChange={(id) => selectDevice("mic", id)}
                    fallback="Microphone"
                  />
                  {canPickSpeaker && (
                    <DeviceSelect
                      id="speaker-select"
                      label="Speaker"
                      icon={MonitorSmartphone}
                      options={devices.audiooutput}
                      value={selected.speaker || devices.audiooutput[0]?.id || ""}
                      onChange={(id) => selectDevice("speaker", id)}
                      fallback="Speaker"
                    />
                  )}
                </div>
              </div>
            </Card>
          )}

          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2 rounded-2xl bg-surface-muted p-3">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              Keep this tab open and your screen on during the call. Switching apps on a phone may pause your camera.
            </li>
            <li className="flex gap-2 rounded-2xl bg-surface-muted p-3">
              <Globe className="mt-0.5 size-4 shrink-0" aria-hidden />
              Works best on the latest Chrome, Safari, Edge or Firefox.
            </li>
          </ul>
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <Button size="lg" variant="success" className={cn("w-full")} onClick={onJoin} disabled={!ready} loading={joining}>
            {voiceOnly ? <Mic className="size-5" aria-hidden /> : <Video className="size-5" aria-hidden />}
            Join call
          </Button>
          {!ready && <p className="mt-2 text-center text-xs text-muted">Allow access to your microphone to join.</p>}
        </div>
      </div>
    </div>
  );
}
