import { Router } from "express";
import { db, usersTable } from "@workspace/db";

const router = Router();

router.get("/users/online", async (req, res) => {
  try {
    const onlineUserIds: string[] = global.__onlineUsers
      ? Array.from(global.__onlineUsers.keys())
      : [];

    if (onlineUserIds.length === 0) {
      res.json([]);
      return;
    }

    const users = await db.select().from(usersTable);
    const online = users.filter((u) => onlineUserIds.includes(u.id)).map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      profileImageUrl: u.profileImageUrl,
    }));

    res.json(online);
  } catch (err) {
    req.log.error({ err }, "Failed to list online users");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
