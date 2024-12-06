import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const nfts = pgTable("nfts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  metadata: jsonb("metadata").notNull(),
  creator: text("creator").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNFTSchema = createInsertSchema(nfts);
export const selectNFTSchema = createSelectSchema(nfts);
export type InsertNFT = z.infer<typeof insertNFTSchema>;
export type NFT = z.infer<typeof selectNFTSchema>;
