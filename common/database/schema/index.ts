import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { bytea, timestamp } from "./utils";

export const pads = t.pgTable("pads", {
  id: t.uuid().notNull().defaultRandom().primaryKey(),

  name: t.varchar({ length: 256 }).notNull(),
  description: t.varchar({ length: 500 }).notNull().default(""),
  // supposedly keywords don't have an impact on seo anymore
  // this will be a comma separated list (5 tags, each can be 30 chars long)
  tags: t.varchar({ length: 150 }),
  coverImage: t.varchar(),
  iconImage: t.varchar(),
  password: t.varchar({ length: 80 }),
  public: t.boolean().default(true).notNull(),

  publishedSlug: t.uuid().notNull().defaultRandom(),
  publishedContent: t.varchar(), // fully rendered html tiptap pad

  ...timestamp,
});

// to reconstruct document, get latest snapshot (if none default to empty documents)
// & apply all updates that occur after the snapshot

// create a snapshot every 100 updates
export const padSnapshots = t.pgTable("pad_snapshots", {
  id: t.integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  padId: t.uuid().references(() => pads.id),
  document: bytea().notNull(),
  createdAt: timestamp.createdAt,
});

export const padUpdates = t.pgTable("pad_updates", {
  id: t.integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  padId: t.uuid().references(() => pads.id),
  delta: bytea().notNull(),
  createdAt: timestamp.createdAt,
});

export const padsRelations = relations(pads, ({ many }) => ({
  snapshots: many(padSnapshots),
  updates: many(padUpdates),
}));
