/**
 * RTC integration point for video / voice calls — the ONLY module that should
 * know which media SDK is used. The call UI talks to this interface:
 *
 *   const rtc = createRtcClient();
 *   rtc.on("connection-state", ({ state }) => …)   // CONNECTING | CONNECTED | RECONNECTING | DISCONNECTED
 *   rtc.on("remote-joined", ({ uid, hasVideo }) => …)
 *   rtc.on("remote-video", ({ hasVideo }) => …)    // remote camera toggled
 *   rtc.on("remote-left", () => …)
 *   await rtc.join({ appId, channel, token, uid })  // credentials from sessionService.getRtcCredentials
 *   await rtc.publish({ stream })                   // local MediaStream from the device check
 *   rtc.setMicEnabled(bool); rtc.setCameraEnabled(bool); rtc.setSpeakerEnabled(bool)
 *   await rtc.replaceVideoTrack(track)              // after switching camera
 *   await rtc.setPlaybackDevice(deviceId)
 *   rtc.playRemoteVideo(element)                    // render remote video into a container
 *   await rtc.leave()
 *
 * TODO(agora): implement createAgoraClient() with the Agora Web SDK (agora-rtc-sdk-ng):
 *   - const AgoraRTC = (await import("agora-rtc-sdk-ng")).default   // dynamic import: keep it out of the main bundle
 *   - client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
 *   - client.on("connection-state-change", (cur) => emit("connection-state", { state: cur }))
 *   - client.on("user-published", async (user, mediaType) => { await client.subscribe(user, mediaType); … })
 *     → mediaType "video": user.videoTrack.play(remoteEl); emit("remote-video", { hasVideo: true })
 *     → mediaType "audio": user.audioTrack.play()
 *   - client.on("user-unpublished" | "user-left", …)
 *   - await client.join(appId, channel, token, uid)
 *   - local tracks: AgoraRTC.createCustomAudioTrack({ mediaStreamTrack }) / createCustomVideoTrack(...)
 *     from the device-check stream, then client.publish([audioTrack, videoTrack])
 *   - mic/camera: track.setEnabled(bool); speaker: remote audioTrack.setVolume(0 | 100)
 *   - playback device: remote audioTrack.setPlaybackDevice(deviceId)
 *   - leave: tracks.close(); await client.leave()
 *   - AgoraRTC.checkSystemRequirements() can back the "supported browsers" note.
 * Then switch createRtcClient() below to return createAgoraClient() when !env.useMocks.
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

export function createRtcClient() {
  if (env.useMocks) return createMockRtcClient();
  // TODO(agora): return createAgoraClient();
  return createMockRtcClient();
}
