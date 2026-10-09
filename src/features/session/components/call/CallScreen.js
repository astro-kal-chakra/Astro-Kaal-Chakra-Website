"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { sessionService } from "@/lib/api/services/session.service";
import { useToast } from "@/providers/ToastProvider";
import { useLeaveWarning } from "../../hooks/useLeaveWarning";
import { useLiveSession } from "../../hooks/useLiveSession";
import { useLocalMedia } from "../../hooks/useLocalMedia";
import { END_REASONS, SESSION_MODES } from "../../lib/sessionEvents";
import { createRtcClient } from "../../lib/rtcClient";
import { MockSimulatorPanel } from "../MockSimulatorPanel";
import { EndSessionModal, SessionEndedPanel, SessionScreenState } from "../SessionParts";
import { InCall } from "./InCall";
import { PreJoin } from "./PreJoin";

export function CallScreen({ sessionId, voiceOnly: voiceParam }) {
  const router = useRouter();
  const { toast } = useToast();
  const online = useNetworkStatus();

  const [session, setSession] = useState(undefined);
  const voiceOnly = voiceParam || session?.mode === SESSION_MODES.CALL; // "call" = voice only
  const media = useLocalMedia({ video: !voiceOnly });
  const live = useLiveSession(session);
  const { ended, connected } = live;

  const [phase, setPhase] = useState("prejoin"); // prejoin | incall
  const [joining, setJoining] = useState(false);
  const [rtcState, setRtcState] = useState("DISCONNECTED");
  const [remote, setRemote] = useState({ joined: false, hasVideo: false });
  const [controls, setControls] = useState({ micOn: true, camOn: true, speakerOn: true });
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endedByMe, setEndedByMe] = useState(false);

  const rtcRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    let alive = true;
    sessionService
      .get(sessionId)
      .then((s) => alive && setSession(s))
      .catch(() => alive && setSession(null));
    return () => {
      alive = false;
    };
  }, [sessionId]);

  // Leave the media channel when the session ends or the page unmounts.
  useEffect(() => {
    if (ended && rtcRef.current) {
      rtcRef.current.leave();
      rtcRef.current = null;
    }
  }, [ended]);
  useEffect(() => () => rtcRef.current?.leave(), []);

  const isLive = !ended && session?.status === "active";
  useLeaveWarning(isLive);

  const join = async () => {
    if (joining || !media.stream) return;
    setJoining(true);
    try {
      const creds = await sessionService.getRtcCredentials(sessionId);
      const rtc = createRtcClient();
      rtcRef.current = rtc;
      rtc.on("connection-state", ({ state }) => setRtcState(state));
      rtc.on("remote-joined", ({ hasVideo }) => setRemote({ joined: true, hasVideo: Boolean(hasVideo) }));
      rtc.on("remote-video", ({ hasVideo }) => setRemote((r) => ({ ...r, hasVideo })));
      rtc.on("remote-left", () => setRemote({ joined: false, hasVideo: false }));
      rtc.on("autoplay-blocked", () =>
        toast({ id: "rtc-autoplay", type: "warning", title: "Tap anywhere to hear the call", message: "Your browser paused the sound until you interact with the page." })
      );
      await rtc.join(creds);
      await rtc.publish({ stream: media.stream });
      if (media.selected.speaker) await rtc.setPlaybackDevice(media.selected.speaker);
      rtc.setMicEnabled(controls.micOn);
      rtc.setCameraEnabled(controls.camOn);
      setPhase("incall");
    } catch {
      toast({ type: "error", title: "Couldn't join the call", message: "Please try again. If the problem continues, contact support." });
      rtcRef.current?.leave();
      rtcRef.current = null;
    } finally {
      setJoining(false);
    }
  };

  // The remote video container exists only in the in-call view: hand it to the RTC client once shown
  useEffect(() => {
    if (phase === "incall" && remoteRef.current) rtcRef.current?.playRemoteVideo(remoteRef.current);
  }, [phase]);

  const toggle = (key) => {
    const next = !controls[key];
    setControls((c) => ({ ...c, [key]: next }));
    const rtc = rtcRef.current;
    if (key === "micOn") rtc?.setMicEnabled(next);
    if (key === "camOn") rtc?.setCameraEnabled(next);
    if (key === "speakerOn") rtc?.setSpeakerEnabled(next);
  };

  const switchCamera = async () => {
    const track = await media.switchCamera();
    const rtc = rtcRef.current;
    if (!track || !rtc) return;
    await rtc.replaceVideoTrack(track);
    await rtc.publish({ stream: media.stream });
    rtc.setMicEnabled(controls.micOn);
  };

  const endCall = async () => {
    setEnding(true);
    setEndedByMe(true);
    try {
      await sessionService.end(sessionId);
      await rtcRef.current?.leave();
      rtcRef.current = null;
      router.replace(`${routes.sessionSummary(sessionId)}`);
    } catch {
      setEnding(false);
      setEndedByMe(false);
      toast({ type: "error", title: "Something went wrong", message: "We couldn't end the session. Please try again." });
    }
  };

  if (session === undefined) return <SessionScreenState loading />;
  if (session === null) {
    return <SessionScreenState title="Session not found" text="This session doesn't exist or has expired. You can start a new consultation any time." />;
  }

  const a = session.astrologer;
  const reconnecting = phase === "incall" && isLive && (!online || !connected || rtcState === "RECONNECTING");
  const showEndedPanel = ended && !(endedByMe && ended.reason === END_REASONS.USER);

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-bg">
      {phase === "prejoin" ? (
        <PreJoin astrologer={a} voiceOnly={voiceOnly} media={media} live={live} onJoin={join} joining={joining} />
      ) : (
        <InCall
          astrologer={a}
          voiceOnly={voiceOnly}
          stream={media.stream}
          live={live}
          rtcState={rtcState}
          remote={remote}
          remoteRef={remoteRef}
          controls={controls}
          onToggleMic={() => toggle("micOn")}
          onToggleCam={() => toggle("camOn")}
          onToggleSpeaker={() => toggle("speakerOn")}
          onSwitchCamera={switchCamera}
          canSwitchCamera={media.devices.videoinput.length > 1}
          onEnd={() => setConfirmEnd(true)}
          reconnecting={reconnecting}
        />
      )}

      {isLive && <MockSimulatorPanel sessionId={sessionId} isFree={session.isFree} className="bottom-32" />}

      <EndSessionModal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={endCall}
        loading={ending}
        mode={voiceOnly ? SESSION_MODES.CALL : SESSION_MODES.VIDEO}
      />
      {showEndedPanel && <SessionEndedPanel sessionId={sessionId} ended={ended} astrologer={a} isFree={session.isFree} />}
    </div>
  );
}
