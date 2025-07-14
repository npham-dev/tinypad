import * as t from "drizzle-orm/pg-core";
import { timestamp } from "./utils";
import { relations } from "drizzle-orm";

export const pads = t.pgTable("pads", {
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  publishedSlug: t.uuid().notNull().defaultRandom(),

  name: t.varchar({ length: 256 }).notNull(),
  body: t.varchar().notNull(),
  password: t.varchar(),

  ...timestamp,
});

export const articles = t.pgTable("articles", {
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  padId: t.uuid("pad_id").references(() => pads.id),

  ...timestamp,
});

export const padsRelations = relations(pads, ({ many }) => ({
  articles: many(articles, { relationName: "articles" }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  pad: one(pads, {
    fields: [articles.padId],
    references: [pads.id],
  }),
}));
