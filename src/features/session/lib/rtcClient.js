/**
 * RTC for video / voice calls — the ONLY module that knows which media SDK is used (Agora Web SDK).
 * The call UI talks to this interface:
 *
 *   const rtc = createRtcClient();
 *   rtc.on("connection-state", ({ state }) => …)   // CONNECTING | CONNECTED | RECONNECTING | DISCONNECTED
 *   rtc.on("remote-joined", ({ uid, hasVideo }) => …)
 *   rtc.on("remote-video", ({ hasVideo }) => …)    // remote camera toggled
 *   rtc.on("remote-left", () => …)
 *   rtc.on("autoplay-blocked", () => …)           // browser blocked remote audio until the next click
 *   await rtc.join({ appId, channel, token, uid })  // credentials from sessionService.getRtcCredentials
 *   await rtc.publish({ stream })                   // local MediaStream from the device check
 *   rtc.setMicEnabled(bool); rtc.setCameraEnabled(bool); rtc.setSpeakerEnabled(bool)
 *   await rtc.replaceVideoTrack(track)              // after switching camera
 *   await rtc.setPlaybackDevice(deviceId)
 *   rtc.playRemoteVideo(element)                    // render remote video into a container (any time)
 *   await rtc.leave()
 *
 * The astrologer app joins the same channel with the native SDK in "communication" profile,
 * which is the Web SDK's "rtc" mode.
 */

import { env } from "@/config/site";

function createEmitter() {
  const listeners = new Map();
  return {
    on(event, cb) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(cb);
      return () => listeners.get(event)?.delete(cb);
    },
    off(event, cb) {
      listeners.get(event)?.delete(cb);
    },
    emit(event, payload) {
      listeners.get(event)?.forEach((cb) => cb(payload));
    },
    clear() {
      listeners.clear();
    },
  };
}

/** Mock: no remote media; simulates connection states and the astrologer joining. */
function createMockRtcClient() {
  const bus = createEmitter();
  const timers = new Set();
  let stream = null;
  let state = "DISCONNECTED";

  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const setState = (next) => {
    state = next;
    bus.emit("connection-state", { state });
  };
  const onOffline = () => state === "CONNECTED" && setState("RECONNECTING");
  const onOnline = () => state === "RECONNECTING" && later(() => setState("CONNECTED"), 1000);

  return {
    on: bus.on,
    off: bus.off,
    async join() {
      setState("CONNECTING");
      window.addEventListener("offline", onOffline);
      window.addEventListener("online", onOnline);
      await new Promise((r) => later(r, 700));
      setState(navigator.onLine ? "CONNECTED" : "RECONNECTING");
      later(() => bus.emit("remote-joined", { uid: 2, hasVideo: false }), 1500);
    },
    async publish({ stream: s }) {
      stream = s;
    },
    setMicEnabled(on) {
      stream?.getAudioTracks().forEach((t) => (t.enabled = on));
    },
    setCameraEnabled(on) {
      stream?.getVideoTracks().forEach((t) => (t.enabled = on));
    },
    setSpeakerEnabled() {},
    async replaceVideoTrack() {},
    async setPlaybackDevice() {},
    playRemoteVideo() {},
    async leave() {
      timers.forEach(clearTimeout);
      timers.clear();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      stream = null;
      setState("DISCONNECTED");
      bus.clear();
    },
  };
}

const STATES = { CONNECTING: "CONNECTING", CONNECTED: "CONNECTED", RECONNECTING: "RECONNECTING", DISCONNECTED: "DISCONNECTED", DISCONNECTING: "DISCONNECTED" };

/** Loads the Agora Web SDK on demand (keeps it out of the main bundle; it only runs in the browser). */
async function loadAgora() {
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  AgoraRTC.setLogLevel(3); // warnings and errors only
  return AgoraRTC;
}

/** 1:1 consultation over Agora: publishes the local mic (+ camera) and plays the astrologer's audio / video. */
function createAgoraClient() {
  const bus = createEmitter();
  let AgoraRTC = null;
  let client = null;
  let localAudio = null;
  let localVideo = null;
  let micOn = true;
  let camOn = true;
  let remoteUser = null;
  let remoteEl = null;
  let volume = 100;
  let playbackDevice = null;

  const playRemoteAudio = () => {
    const track = remoteUser?.audioTrack;
    if (!track) return;
    track.setVolume(volume);
    if (playbackDevice) track.setPlaybackDevice(playbackDevice).catch(() => {});
    track.play();
  };
  const playRemoteVideoTrack = () => {
    const track = remoteUser?.videoTrack;
    if (track && remoteEl) track.play(remoteEl, { fit: "cover" });
  };

  /** Publishes `track` for `kind`, replacing whatever was published before (camera switch, new device). */
  async function setLocal(kind, mediaTrack) {
    const current = kind === "audio" ? localAudio : localVideo;
    if (current?.getMediaStreamTrack() === mediaTrack) return;
    if (current && kind === "video" && mediaTrack) {
      await current.replaceTrack(mediaTrack, false);
      return;
    }
    if (current) {
      await client.unpublish(current).catch(() => {});
      current.close();
    }
    let next = null;
    if (mediaTrack) {
      next = kind === "audio" ? AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: mediaTrack }) : AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: mediaTrack });
      await next.setMuted(kind === "audio" ? !micOn : !camOn);
      await client.publish(next);
    }
    if (kind === "audio") localAudio = next;
    else localVideo = next;
  }

  return {
    on: bus.on,
    off: bus.off,
    async join({ appId, channel, token, uid }) {
      if (!appId || appId === "AGORA_NOT_CONFIGURED") throw new Error("Calling is not configured on the server");
      AgoraRTC = await loadAgora();
      AgoraRTC.onAutoplayFailed = () => bus.emit("autoplay-blocked");
      client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      client.on("connection-state-change", (cur) => bus.emit("connection-state", { state: STATES[cur] || cur }));
      client.on("user-joined", (user) => {
        remoteUser = user;
        bus.emit("remote-joined", { uid: user.uid, hasVideo: Boolean(user.hasVideo) });
      });
      client.on("user-published", async (user, mediaType) => {
        remoteUser = user;
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") playRemoteAudio();
        else {
          playRemoteVideoTrack();
          bus.emit("remote-video", { hasVideo: true });
        }
        bus.emit("remote-joined", { uid: user.uid, hasVideo: Boolean(user.hasVideo) });
      });
      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") bus.emit("remote-video", { hasVideo: false });
      });
      // The native app mutes the camera instead of unpublishing it
      client.on("user-info-updated", (_uid, msg) => {
        if (msg === "mute-video") bus.emit("remote-video", { hasVideo: false });
        if (msg === "unmute-video") bus.emit("remote-video", { hasVideo: true });
      });
      client.on("user-left", (user) => {
        if (remoteUser?.uid === user.uid) remoteUser = null;
        bus.emit("remote-left");
      });
      await client.join(appId, channel, token || null, uid);
    },
    async publish({ stream }) {
      if (!client) return;
      await setLocal("audio", stream?.getAudioTracks()[0] || null);
      await setLocal("video", stream?.getVideoTracks()[0] || null);
    },
    setMicEnabled(on) {
      micOn = on;
      localAudio?.setMuted(!on);
    },
    setCameraEnabled(on) {
      camOn = on;
      localVideo?.setMuted(!on);
    },
    setSpeakerEnabled(on) {
      volume = on ? 100 : 0;
      remoteUser?.audioTrack?.setVolume(volume);
    },
    async replaceVideoTrack(track) {
      if (client) await setLocal("video", track);
    },
    async setPlaybackDevice(deviceId) {
      playbackDevice = deviceId;
      await remoteUser?.audioTrack?.setPlaybackDevice(deviceId).catch(() => {});
    },
    playRemoteVideo(element) {
      remoteEl = element;
      playRemoteVideoTrack();
    },
    async leave() {
      const c = client;
      client = null;
      [localAudio, localVideo].forEach((t) => t?.close());
      localAudio = localVideo = null;
      remoteUser = null;
      if (c) {
        c.removeAllListeners();
        await c.leave().catch(() => {});
      }
      bus.emit("connection-state", { state: "DISCONNECTED" });
      bus.clear();
    },
  };
}

export function createRtcClient() {
  if (env.useMocks) return createMockRtcClient();
  return createAgoraClient();
}
