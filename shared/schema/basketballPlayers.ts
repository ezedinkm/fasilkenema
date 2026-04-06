import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const basketballPlayers = pgTable("basketball_players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  nationality: text("nationality").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBasketballPlayerSchema = createInsertSchema(basketballPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBasketballPlayer = z.infer<typeof insertBasketballPlayerSchema>;
export type BasketballPlayer = typeof basketballPlayers.$inferSelect;
