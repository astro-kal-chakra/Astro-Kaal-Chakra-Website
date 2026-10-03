"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Camera / microphone access for the device check and the call.
 * status: idle | requesting | ready | denied | notfound | inuse | unsupported | error
 */
export function useLocalMedia({ video }) {
  const [status, setStatus] = useState("idle");
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState({ audioinput: [], videoinput: [], audiooutput: [] });
  const [selected, setSelected] = useState({ mic: "", cam: "", speaker: "" });
  const streamRef = useRef(null);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const loadDevices = useCallback(async () => {
    const list = await navigator.mediaDevices.enumerateDevices().catch(() => []);
    const by = { audioinput: [], videoinput: [], audiooutput: [] };
    list.forEach((d) => d.deviceId && by[d.kind]?.push({ id: d.deviceId, label: d.label }));
    // Some browsers hide device ids until every permission is granted: fall back to the live tracks.
    const fromTrack = (track) => track && { id: track.getSettings().deviceId || track.id, label: track.label };
    if (!by.audioinput.length && streamRef.current) by.audioinput = [fromTrack(streamRef.current.getAudioTracks()[0])].filter(Boolean);
    if (!by.videoinput.length && streamRef.current) by.videoinput = [fromTrack(streamRef.current.getVideoTracks()[0])].filter(Boolean);
    setDevices(by);
  }, []);

  /** Ask for (or re-acquire with other devices) the local stream. */
  const request = useCallback(
    async ({ mic, cam } = {}) => {
      if (typeof window === "undefined" || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }
      setStatus("requesting");
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          audio: { ...(mic ? { deviceId: { exact: mic } } : {}), echoCancellation: true, noiseSuppression: true },
          video: video
            ? { ...(cam ? { deviceId: { exact: cam } } : { facingMode: "user" }), width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
        });
        stopTracks();
        streamRef.current = s;
        setStream(s);
        setSelected((cur) => ({
          ...cur,
          mic: s.getAudioTracks()[0]?.getSettings().deviceId || mic || "",
          cam: s.getVideoTracks()[0]?.getSettings().deviceId || cam || "",
        }));
        setStatus("ready");
        loadDevices();
      } catch (err) {
        const name = err?.name;
        setStatus(
          name === "NotAllowedError" || name === "SecurityError"
            ? "denied"
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "notfound"
              : name === "NotReadableError" || name === "AbortError"
                ? "inuse"
                : "error"
        );
      }
    },
    [video, loadDevices]
  );

  // If permission was granted earlier, skip the "allow" step.
  useEffect(() => {
    let alive = true;
    navigator.permissions
      ?.query({ name: "microphone" })
      .then((p) => {
        if (!alive) return;
        if (p.state === "granted") request();
        else if (p.state === "denied") setStatus("denied");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [request]);

  // Device plugged in / removed.
  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return;
    md.addEventListener("devicechange", loadDevices);
    return () => md.removeEventListener("devicechange", loadDevices);
  }, [loadDevices]);

  // Release camera / mic when leaving the page.
  useEffect(() => () => stopTracks(), []);

  const selectDevice = (kind, id) => {
    if (kind === "speaker") {
      setSelected((cur) => ({ ...cur, speaker: id }));
      return;
    }
    const next = { ...selected, [kind]: id };
    setSelected(next);
    request({ mic: next.mic, cam: next.cam });
  };

  /** Cycle to the next camera (front ↔ back on phones). */
  const switchCamera = async () => {
    const cams = devices.videoinput;
    if (cams.length < 2) return null;
    const i = cams.findIndex((c) => c.id === selected.cam);
    const next = cams[(i + 1) % cams.length].id;
    await request({ mic: selected.mic, cam: next });
    return streamRef.current?.getVideoTracks()[0] || null;
  };

  return { status, stream, devices, selected, request, selectDevice, switchCamera };
}
