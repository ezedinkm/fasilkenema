import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const handballPlayers = pgTable("handball_players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  nationality: text("nationality").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHandballPlayerSchema = createInsertSchema(handballPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertHandballPlayer = z.infer<typeof insertHandballPlayerSchema>;
export type HandballPlayer = typeof handballPlayers.$inferSelect;
