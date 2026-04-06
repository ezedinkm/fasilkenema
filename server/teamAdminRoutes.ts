import type { Express } from "express";
import fs from "fs";
import path from "path";
import { asc, eq, desc } from "drizzle-orm";
import { z } from "zod";
import * as schema from "@shared/schema";
import { db } from "./db";
import { authenticateToken } from "./middleware/authMiddleware";
import {
  teamPlayersUploadsDir,
  uploadsDir,
  teamPlayerImageUpload,
} from "./middleware/multerConfig";

const TEAM_KEYS = [
  "admin.team.football.men",
  "admin.team.football.women",
  "admin.team.football.junior",
  "admin.team.basketball",
  "admin.team.handball",
  "admin.team.box",
] as const;

type TeamKey = (typeof TEAM_KEYS)[number];

const teamKeySchema = z.enum([
  "admin.team.football.men",
  "admin.team.football.women",
  "admin.team.football.junior",
  "admin.team.basketball",
  "admin.team.handball",
  "admin.team.box",
]);

const teamTableByKey: Record<TeamKey, typeof schema.footballMenPlayers> = {
  "admin.team.football.men": schema.footballMenPlayers,
  "admin.team.football.women": schema.footballWomenPlayers,
  "admin.team.football.junior": schema.footballJuniorPlayers,
  "admin.team.basketball": schema.basketballPlayers,
  "admin.team.handball": schema.handballPlayers,
  "admin.team.box": schema.boxingPlayers,
};

const bodySchema = z.object({
  teamKey: teamKeySchema,
  name: z.string().min(1),
  position: z.string().min(1),
  nationality: z.string().min(1),
  image: z.string().min(1),
});

function isTeamKey(k: string): k is TeamKey {
  return (TEAM_KEYS as readonly string[]).includes(k);
}

function persistImageInput(image: string): string {
  if (image.startsWith("data:")) {
    const m = /^data:image\/(\w+);base64,([\s\S]+)$/.exec(image);
    if (!m) {
      throw new Error("Invalid image data URL");
    }
    let ext = m[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    const buf = Buffer.from(m[2], "base64");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const fullPath = path.join(teamPlayersUploadsDir, filename);
    fs.writeFileSync(fullPath, buf);
    return `/uploads/team-players/${filename}`;
  }
  if (image.startsWith("/uploads/")) {
    return image;
  }
  return image;
}

function unlinkUploadsUrl(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/")) return;
  const rel = imageUrl.replace(/^\/uploads\//, "");
  const full = path.join(uploadsDir, rel);
  try {
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      fs.unlinkSync(full);
    }
  } catch {
    /* ignore */
  }
}

type Row = {
  id: number;
  name: string;
  position: string;
  nationality: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

function toClient(row: Row) {
  return {
    id: String(row.id),
    name: row.name,
    position: row.position,
    nationality: row.nationality,
    image: row.imageUrl,
  };
}

export function registerTeamAdminRoutes(app: Express): void {
  // Public read-only endpoint for rosters (used by the public team pages).
  // Admin write operations remain protected under `/api/admin/*`.
  app.get("/api/team-players", async (req, res) => {
    try {
      const teamKey = String(req.query.teamKey ?? "");
      if (!isTeamKey(teamKey)) {
        return res.status(400).json({ error: "Invalid or missing teamKey" });
      }

      const table = teamTableByKey[teamKey];
      const rows = await db.select().from(table).orderBy(asc(table.id));

      res.json(rows.map((r) => toClient(r as Row)));
    } catch (e) {
      console.error("[team-players] public list", e);
      res.status(500).json({ error: "Failed to list team players" });
    }
  });

  app.get("/api/admin/team-players", authenticateToken, async (req, res) => {
    try {
      console.log("this is emanuel");
      const teamKey = String(req.query.teamKey ?? "");
      if (!isTeamKey(teamKey)) {
        return res.status(400).json({ error: "Invalid or missing teamKey" });
      }
      const table = teamTableByKey[teamKey];
      const rows = await db.select().from(table).orderBy(desc(table.createdAt));
      res.json(rows.map((r) => toClient(r as Row)));
    } catch (e) {
      console.error("[team-players] list", e);
      res.status(500).json({ error: "Failed to list team players" });
    }
  });

  app.post("/api/admin/team-players", authenticateToken, async (req, res) => {
    try {
      console.log("this is emanuel");
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: parsed.error.flatten().fieldErrors });
      }
      const { teamKey, name, position, nationality, image } = parsed.data;
      const table = teamTableByKey[teamKey];
      let imageUrl: string;
      try {
        imageUrl = persistImageInput(image);
      } catch (err) {
        return res
          .status(400)
          .json({
            error: err instanceof Error ? err.message : "Invalid image",
          });
      }

      const [row] = await db
        .insert(table)
        .values({
          name: name.trim(),
          position: position.trim(),
          nationality: nationality.trim(),
          imageUrl,
        })
        .returning();

      res.status(201).json(toClient(row as Row));
    } catch (e) {
      console.error("[team-players] create", e);
      res.status(500).json({ error: "Failed to create team player" });
    }
  });

  /** Multipart alternative: fields teamKey, name, position, nationality + file field `image`. */
  app.post(
    "/api/admin/team-players/upload",
    authenticateToken,
    teamPlayerImageUpload.single("image"),
    async (req, res) => {
      try {
        const teamKey = String(req.body.teamKey ?? "");
        if (!isTeamKey(teamKey)) {
          return res.status(400).json({ error: "Invalid or missing teamKey" });
        }
        const name = String(req.body.name ?? "").trim();
        const position = String(req.body.position ?? "").trim();
        const nationality = String(req.body.nationality ?? "").trim();
        if (!name || !position || !nationality) {
          return res
            .status(400)
            .json({ error: "name, position, and nationality are required" });
        }
        if (!req.file) {
          return res.status(400).json({ error: "Image file is required" });
        }
        const imageUrl = `/uploads/team-players/${req.file.filename}`;
        const table = teamTableByKey[teamKey];
        const [row] = await db
          .insert(table)
          .values({
            name,
            position,
            nationality,
            imageUrl,
          })
          .returning();
        res.status(201).json(toClient(row as Row));
      } catch (e) {
        console.error("[team-players] upload create", e);
        res.status(500).json({ error: "Failed to create team player" });
      }
    },
  );

  app.patch(
    "/api/admin/team-players/:id",
    authenticateToken,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
          return res.status(400).json({ error: "Invalid id" });
        }
        const parsed = bodySchema.safeParse(req.body);
        if (!parsed.success) {
          return res
            .status(400)
            .json({ error: parsed.error.flatten().fieldErrors });
        }
        const { teamKey, name, position, nationality, image } = parsed.data;
        const table = teamTableByKey[teamKey];

        const existingRows = await db
          .select()
          .from(table)
          .where(eq(table.id, id));
        const existing = existingRows[0] as Row | undefined;
        if (!existing) {
          return res.status(404).json({ error: "Player not found" });
        }

        let imageUrl = existing.imageUrl;
        if (image.startsWith("data:")) {
          if (existing.imageUrl.startsWith("/uploads/team-players/")) {
            unlinkUploadsUrl(existing.imageUrl);
          }
          try {
            imageUrl = persistImageInput(image);
          } catch (err) {
            return res
              .status(400)
              .json({
                error: err instanceof Error ? err.message : "Invalid image",
              });
          }
        } else {
          imageUrl = image;
        }

        const [row] = await db
          .update(table)
          .set({
            name: name.trim(),
            position: position.trim(),
            nationality: nationality.trim(),
            imageUrl,
            updatedAt: new Date(),
          })
          .where(eq(table.id, id))
          .returning();

        res.json(toClient((row ?? existing) as Row));
      } catch (e) {
        console.error("[team-players] patch", e);
        res.status(500).json({ error: "Failed to update team player" });
      }
    },
  );

  app.delete(
    "/api/admin/team-players/:id",
    authenticateToken,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
          return res.status(400).json({ error: "Invalid id" });
        }
        const teamKey = String(req.query.teamKey ?? "");
        if (!isTeamKey(teamKey)) {
          return res.status(400).json({ error: "Invalid or missing teamKey" });
        }
        const table = teamTableByKey[teamKey];

        const existingRows = await db
          .select()
          .from(table)
          .where(eq(table.id, id));
        const existing = existingRows[0] as Row | undefined;
        if (!existing) {
          return res.status(404).json({ error: "Player not found" });
        }

        if (existing.imageUrl.startsWith("/uploads/team-players/")) {
          unlinkUploadsUrl(existing.imageUrl);
        }
        await db.delete(table).where(eq(table.id, id));
        res.status(204).send();
      } catch (e) {
        console.error("[team-players] delete", e);
        res.status(500).json({ error: "Failed to delete team player" });
      }
    },
  );
}
