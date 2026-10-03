"use client";

import { createContext, useCallback, useContext, useState, useSyncExternalStore } from "react";
import { getSocket } from "@/lib/socket/client";

const SocketContext = createContext({ socket: null, connected: false });

export function SocketProvider({ children }) {
  // null on the server and in mock mode; consumers only touch it inside effects.
  const [socket] = useState(() => getSocket());

  const subscribe = useCallback(
    (cb) => {
      if (!socket) return () => {};
      socket.on("connect", cb);
      socket.on("disconnect", cb);
      return () => {
        socket.off("connect", cb);
        socket.off("disconnect", cb);
      };
    },
    [socket]
  );
  const connected = useSyncExternalStore(subscribe, () => Boolean(socket?.connected), () => false);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
