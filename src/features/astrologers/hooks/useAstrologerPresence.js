"use client";

import { useEffect, useMemo, useState } from "react";
import { env } from "@/config/site";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useSocket } from "@/providers/SocketProvider";

const STATUSES = ["online", "busy", "offline"];

/**
 * Live status + queue count for a set of astrologers.
 * Subscribes to presence rooms over Socket.io; in mock mode it simulates
 * occasional status changes so the "live" UI can be developed without a backend.
 *
 * @param {Array<{id:string,status:string,queueCount:number}>} astrologers
 * @returns {(a) => a} merge function returning the astrologer with live fields
 */
export function useAstrologerPresence(astrologers) {
  const { socket } = useSocket();
  const [live, setLive] = useState({});
  const ids = useMemo(() => astrologers.map((a) => a.id), [astrologers]);
  const idsKey = ids.join(",");

  useEffect(() => {
    if (!ids.length) return;

    if (socket) {
      // `modes`: which modes the astrologer switched on for this online session (chat / call / video)
      const onStatus = ({ astrologerId, status, queueCount, modes }) =>
        setLive((prev) => ({ ...prev, [astrologerId]: { status, queueCount, ...(modes ? { availableModes: modes } : {}) } }));
      socket.emit(SOCKET_EVENTS.SUBSCRIBE_PRESENCE, ids);
      socket.on(SOCKET_EVENTS.ASTROLOGER_STATUS, onStatus);
      return () => {
        socket.emit(SOCKET_EVENTS.UNSUBSCRIBE_PRESENCE, ids);
        socket.off(SOCKET_EVENTS.ASTROLOGER_STATUS, onStatus);
      };
    }

    if (env.useMocks) {
      const timer = setInterval(() => {
        const id = ids[Math.floor(Math.random() * ids.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        setLive((prev) => ({ ...prev, [id]: { status, queueCount: status === "busy" ? 1 + Math.floor(Math.random() * 4) : 0 } }));
      }, 7000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, idsKey]);

  return (a) => (live[a.id] ? { ...a, ...live[a.id] } : a);
}
