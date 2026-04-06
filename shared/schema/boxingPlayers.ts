import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const boxingPlayers = pgTable("boxing_players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  nationality: text("nationality").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoxingPlayerSchema = createInsertSchema(boxingPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBoxingPlayer = z.infer<typeof insertBoxingPlayerSchema>;
export type BoxingPlayer = typeof boxingPlayers.$inferSelect;
