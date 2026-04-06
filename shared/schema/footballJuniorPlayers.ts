import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const footballJuniorPlayers = pgTable("football_junior_players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  nationality: text("nationality").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFootballJuniorPlayerSchema = createInsertSchema(footballJuniorPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFootballJuniorPlayer = z.infer<typeof insertFootballJuniorPlayerSchema>;
export type FootballJuniorPlayer = typeof footballJuniorPlayers.$inferSelect;
