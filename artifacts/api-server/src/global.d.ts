import type { WebSocket } from "ws";

declare global {
  var __onlineUsers: Map<string, Set<WebSocket>>;
  var __broadcast: (roomId: number, payload: unknown) => void;
}

export {};
