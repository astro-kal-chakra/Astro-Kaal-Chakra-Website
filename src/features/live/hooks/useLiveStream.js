"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { liveService } from "@/lib/api/services/live.service";

/**
 * Plays the astrologer's live broadcast (Agora "live" mode, audience role) into `videoRef`.
 * state: connecting | waiting (joined, astrologer's video not here yet) | playing | unavailable (no Agora) | error
 * `soundBlocked`: the browser refused to start the sound by itself; call `unmute()` from a click.
 */
export function useLiveStream(roomId, enabled) {
  const videoRef = useRef(null);
  const audioTrack = useRef(null);
  const [state, setState] = useState("connecting");
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let client = null;

    (async () => {
      try {
        const creds = await liveService.getRtcCredentials(roomId);
        if (cancelled) return;
        if (!creds.appId || creds.appId === "AGORA_NOT_CONFIGURED") return setState("unavailable");
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
        if (cancelled) return;
        AgoraRTC.setLogLevel(3);
        AgoraRTC.onAutoplayFailed = () => setSoundBlocked(true);
        client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        await client.setClientRole("audience", { level: 1 }); // low-latency audience
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (cancelled) return;
          if (mediaType === "video") {
            if (videoRef.current) user.videoTrack.play(videoRef.current, { fit: "cover" });
            setState("playing");
          } else {
            audioTrack.current = user.audioTrack;
            user.audioTrack.play();
          }
        });
        client.on("user-unpublished", (_user, mediaType) => mediaType === "video" && setState("waiting"));
        client.on("user-left", () => {
          audioTrack.current = null;
          setState("waiting");
        });
        await client.join(creds.appId, creds.channel, creds.token || null, creds.uid);
        if (!cancelled) setState((s) => (s === "playing" ? s : "waiting"));
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
      audioTrack.current = null;
      if (client) {
        client.removeAllListeners();
        client.leave().catch(() => {});
      }
    };
  }, [roomId, enabled]);

  const unmute = useCallback(() => {
    audioTrack.current?.play();
    setSoundBlocked(false);
  }, []);

  return { videoRef, state: enabled ? state : "ended", soundBlocked, unmute };
}
