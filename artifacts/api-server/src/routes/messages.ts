import { Router } from "express";
import { db, messagesTable, roomsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SendMessageBody } from "@workspace/api-zod";

const router = Router();

router.get("/rooms/:roomId/messages", async (req, res) => {
  const roomId = parseInt(req.params.roomId);
  if (isNaN(roomId)) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  try {
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId));
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const rows = await db
      .select({
        id: messagesTable.id,
        roomId: messagesTable.roomId,
        userId: messagesTable.userId,
        content: messagesTable.content,
        createdAt: messagesTable.createdAt,
        user: {
          id: usersTable.id,
          email: usersTable.email,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          profileImageUrl: usersTable.profileImageUrl,
        },
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.userId, usersTable.id))
      .where(eq(messagesTable.roomId, roomId))
      .orderBy(desc(messagesTable.createdAt))
      .limit(50);

    res.json(rows.reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/rooms/:roomId/messages", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const roomId = parseInt(req.params.roomId);
  if (isNaN(roomId)) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId));
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const [msg] = await db
      .insert(messagesTable)
      .values({ roomId, userId: req.user!.id, content: parsed.data.content })
      .returning();

    await db.update(roomsTable).set({ lastMessageAt: msg.createdAt }).where(eq(roomsTable.id, roomId));

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));

    const fullMessage = {
      ...msg,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    };

    global.__broadcast?.(roomId, { type: "message", message: fullMessage });

    res.status(201).json(fullMessage);
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/rooms/:roomId/messages/:messageId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const messageId = parseInt(req.params.messageId);
  if (isNaN(messageId)) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  try {
    const [deleted] = await db
      .delete(messagesTable)
      .where(eq(messagesTable.id, messageId))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
