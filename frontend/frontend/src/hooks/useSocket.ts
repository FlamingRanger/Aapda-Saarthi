import { useEffect, useRef, useState } from "react";
import { getSocket, onSocketEvent } from "../sockets/socketClient";
import type { SocketEventMap, SocketEventName, ConnectionState } from "../types/socket";

/** Subscribe to one Socket.IO event for the lifetime of the component. */
export function useSocketEvent<K extends SocketEventName>(
  event: K,
  handler: (payload: SocketEventMap[K]) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = onSocketEvent(event, (payload) => handlerRef.current(payload));
    return unsubscribe;
  }, [event]);
}

/** Tracks live Socket.IO connection state (distinct from browser online/offline). */
export function useSocketConnectionState(): ConnectionState {
  const [state, setState] = useState<ConnectionState>("RECONNECTING");

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setState("ONLINE");
    const handleDisconnect = () => setState("RECONNECTING");
    const handleReconnectAttempt = () => setState("RECONNECTING");
    const handleReconnectFailed = () => setState("OFFLINE");

    setState(socket.connected ? "ONLINE" : "RECONNECTING");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect_failed", handleReconnectFailed);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect_failed", handleReconnectFailed);
    };
  }, []);

  return state;
}
