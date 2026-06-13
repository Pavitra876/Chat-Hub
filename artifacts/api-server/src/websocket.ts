import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { logger } from "./lib/logger";

interface RoomClient {
  ws: WebSocket;
  userId: string | null;
  roomId: number | null;
}

const clients = new Set<RoomClient>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  global.__onlineUsers = new Map<string, Set<WebSocket>>();

  global.__broadcast = (roomId: number, payload: unknown) => {
    const data = JSON.stringify(payload);
    for (const client of clients) {
      if (client.roomId === roomId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  };

  wss.on("connection", (ws) => {
    const client: RoomClient = { ws, userId: null, roomId: null };
    clients.add(client);

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "identify" && typeof msg.userId === "string") {
          client.userId = msg.userId;
          if (!global.__onlineUsers.has(msg.userId)) {
            global.__onlineUsers.set(msg.userId, new Set());
          }
          global.__onlineUsers.get(msg.userId)!.add(ws);
          broadcastPresence();
        }

        if (msg.type === "join" && typeof msg.roomId === "number") {
          client.roomId = msg.roomId;
          ws.send(JSON.stringify({ type: "joined", roomId: msg.roomId }));
        }

        if (msg.type === "leave") {
          client.roomId = null;
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(client);
      if (client.userId && global.__onlineUsers.has(client.userId)) {
        const sockets = global.__onlineUsers.get(client.userId)!;
        sockets.delete(ws);
        if (sockets.size === 0) {
          global.__onlineUsers.delete(client.userId);
        }
      }
      broadcastPresence();
    });

    ws.on("error", (err) => {
      logger.error({ err }, "WebSocket error");
    });
  });

  function broadcastPresence() {
    const onlineCount = global.__onlineUsers.size;
    const payload = JSON.stringify({ type: "presence", onlineCount });
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  logger.info("WebSocket server initialized at /ws");
}
