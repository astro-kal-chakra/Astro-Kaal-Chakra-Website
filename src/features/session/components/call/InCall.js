"use client";

import { Mic, MicOff, PhoneOff, SwitchCamera, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Skeleton";
import { AstrologerIdentity, LowBalanceBanner, SessionMeter } from "../SessionParts";
import { StreamVideo } from "./MediaBits";

function ControlButton({ label, pressed, onClick, children, danger, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "flex size-14 items-center justify-center rounded-full transition-colors disabled:opacity-40 focus-visible:outline-gold-400",
        danger
          ? "size-16 bg-red-600 text-white hover:bg-red-700"
          : pressed
            ? "bg-white text-brand-950 hover:bg-white/90"
            : "bg-white/15 text-white backdrop-blur hover:bg-white/25"
      )}
    >
      {children}
    </button>
  );
}

/**
 * In-call UI. Always dark (video looks best on black) in both themes.
 * Remote tile: astrologer avatar until remote video arrives (rtcClient renders
 * into `remoteRef` once the SDK is wired up).
 */
export function InCall({
  astrologer,
  voiceOnly,
  stream,
  live,
  rtcState,
  remote,
  remoteRef,
  controls,
  onToggleMic,
  onToggleCam,
  onToggleSpeaker,
  onSwitchCamera,
  canSwitchCamera,
  onEnd,
  reconnecting,
}) {
  const { micOn, camOn, speakerOn } = controls;

  const remoteStatus = !remote.joined
    ? `Waiting for ${astrologer.name} to join…`
    : voiceOnly
      ? "On voice call"
      : !remote.hasVideo
        ? "Camera is off"
        : null;

  return (
    <div className="dark relative flex min-h-0 flex-1 flex-col overflow-hidden bg-brand-950 text-white">
      {/* Remote */}
      <div className="absolute inset-0">
        <div ref={remoteRef} className={cn("size-full", !(remote.hasVideo && !voiceOnly) && "hidden")} />
        {!(remote.hasVideo && !voiceOnly) && (
          <div className="flex size-full flex-col items-center justify-center bg-cosmic px-6 text-center">
            <div className="relative flex size-44 items-center justify-center">
              {remote.joined && (
                <span className="absolute inset-0 animate-ping rounded-full bg-gold-400/15 [animation-duration:2.5s] motion-reduce:animate-none" aria-hidden />
              )}
              <Avatar src={astrologer.avatarUrl} name={astrologer.name} size={128} />
            </div>
            <p className="mt-5 font-display text-2xl font-semibold">{astrologer.name}</p>
            {remoteStatus && (
              <div className="mt-1 flex items-center gap-2 text-sm text-white/70" role="status">
                {!remote.joined && <Spinner className="size-4 border-white/30 border-t-white" />}
                {remoteStatus}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 bg-gradient-to-b from-black/60 to-transparent pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4">
          <AstrologerIdentity
            astrologer={astrologer}
            size={36}
            tone="dark"
            className="flex-1"
            subtitle={(voiceOnly ? "Voice call" : "Video call")}
          />
          <SessionMeter elapsed={live.elapsed} balance={live.balance} freeRemaining={live.freeRemaining} tone="dark" />
        </div>
        {live.lowBalance && (
          <div className="mx-auto mt-3 max-w-3xl px-4">
            <LowBalanceBanner secondsLeft={live.secondsLeft} className="rounded-xl border" />
          </div>
        )}
      </div>

      {/* Self view */}
      {!voiceOnly && (
        <div className="absolute right-3 top-28 z-10 aspect-[3/4] w-28 overflow-hidden rounded-2xl border border-white/20 bg-brand-900 shadow-2xl sm:w-40">
          {camOn && stream?.getVideoTracks().length ? (
            <StreamVideo stream={stream} label="Your video" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 text-white/70">
              <VideoOff className="size-6" aria-hidden />
              <span className="text-xs">Camera off</span>
            </div>
          )}
          {!micOn && (
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-red-600 p-1" aria-label="Muted">
              <MicOff className="size-3" aria-hidden />
            </span>
          )}
        </div>
      )}

      {/* Reconnecting */}
      {reconnecting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm" role="status" aria-live="assertive">
          <Spinner className="size-10 border-white/30 border-t-white" />
          <p className="mt-4 text-lg font-semibold">Reconnecting…</p>
          <p className="mt-1 max-w-xs text-sm text-white/70">{"Your connection dropped. The call will resume automatically — please don't close this tab."}</p>
        </div>
      )}

      {/* Controls */}
      <div className="relative z-30 mt-auto bg-gradient-to-t from-black/70 to-transparent pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10">
        <p className="sr-only" role="status">
          {rtcState === "CONNECTED" ? "Call connected" : "Connecting call"}
        </p>
        <div className="mx-auto flex max-w-md items-center justify-center gap-3 px-4 sm:gap-4">
          <ControlButton label={micOn ? "Mute microphone" : "Unmute microphone"} pressed={!micOn} onClick={onToggleMic}>
            {micOn ? <Mic className="size-6" aria-hidden /> : <MicOff className="size-6" aria-hidden />}
          </ControlButton>
          {!voiceOnly && (
            <ControlButton label={camOn ? "Turn camera off" : "Turn camera on"} pressed={!camOn} onClick={onToggleCam}>
              {camOn ? <Video className="size-6" aria-hidden /> : <VideoOff className="size-6" aria-hidden />}
            </ControlButton>
          )}
          {!voiceOnly && canSwitchCamera && (
            <ControlButton label="Switch camera" onClick={onSwitchCamera} disabled={!camOn}>
              <SwitchCamera className="size-6" aria-hidden />
            </ControlButton>
          )}
          <ControlButton
            label={speakerOn ? "Mute speaker" : "Unmute speaker"}
            pressed={!speakerOn}
            onClick={onToggleSpeaker}
          >
            {speakerOn ? <Volume2 className="size-6" aria-hidden /> : <VolumeX className="size-6" aria-hidden />}
          </ControlButton>
          <ControlButton label="End call" onClick={onEnd} danger>
            <PhoneOff className="size-7" aria-hidden />
          </ControlButton>
        </div>
      </div>
    </div>
  );
}
