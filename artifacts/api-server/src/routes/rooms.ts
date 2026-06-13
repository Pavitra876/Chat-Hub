import { Router } from "express";
import { db, roomsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { CreateRoomBody } from "@workspace/api-zod";

const router = Router();

router.get("/rooms", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: roomsTable.id,
        name: roomsTable.name,
        description: roomsTable.description,
        createdBy: roomsTable.createdBy,
        createdAt: roomsTable.createdAt,
        lastMessageAt: roomsTable.lastMessageAt,
        messageCount: sql<number>`cast(count(${messagesTable.id}) as integer)`,
      })
      .from(roomsTable)
      .leftJoin(messagesTable, eq(messagesTable.roomId, roomsTable.id))
      .groupBy(roomsTable.id)
      .orderBy(desc(roomsTable.lastMessageAt), desc(roomsTable.createdAt));

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list rooms");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/rooms", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateRoomBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [room] = await db
      .insert(roomsTable)
      .values({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        createdBy: req.user!.id,
      })
      .returning();

    res.status(201).json({ ...room, messageCount: 0, lastMessageAt: null });
  } catch (err) {
    req.log.error({ err }, "Failed to create room");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/rooms/stats/summary", async (req, res) => {
  try {
    const [roomCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(roomsTable);
    const [msgCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(messagesTable);

    res.json({
      totalRooms: roomCount?.count ?? 0,
      totalMessages: msgCount?.count ?? 0,
      onlineUsers: global.__onlineUsers?.size ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/rooms/:roomId", async (req, res) => {
  const roomId = parseInt(req.params.roomId);
  if (isNaN(roomId)) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  try {
    const [row] = await db
      .select({
        id: roomsTable.id,
        name: roomsTable.name,
        description: roomsTable.description,
        createdBy: roomsTable.createdBy,
        createdAt: roomsTable.createdAt,
        lastMessageAt: roomsTable.lastMessageAt,
        messageCount: sql<number>`cast(count(${messagesTable.id}) as integer)`,
      })
      .from(roomsTable)
      .leftJoin(messagesTable, eq(messagesTable.roomId, roomsTable.id))
      .where(eq(roomsTable.id, roomId))
      .groupBy(roomsTable.id);

    if (!row) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get room");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/rooms/:roomId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const roomId = parseInt(req.params.roomId);
  if (isNaN(roomId)) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(roomsTable)
      .where(eq(roomsTable.id, roomId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete room");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
