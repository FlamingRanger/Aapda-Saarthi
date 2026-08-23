/**
 * Thin wrapper around socket.io-client. One shared connection for the
 * whole app; components subscribe/unsubscribe via useSocketEvent (see
 * hooks/useSocket.ts) instead of importing this module directly.
 */
import { io, Socket } from "socket.io-client";
import type { SocketEventMap, SocketEventName } from "../types/socket";

const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function onSocketEvent<K extends SocketEventName>(
  event: K,
  handler: (payload: SocketEventMap[K]) => void
): () => void {
  const s = getSocket();
  const wrapped = handler as unknown as (...args: unknown[]) => void;
  s.on(event, wrapped);
  return () => {
    s.off(event, wrapped);
  };
}
