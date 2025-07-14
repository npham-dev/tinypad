import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { timestamp } from "./utils";

export const pads = t.pgTable("pads", {
  id: t.uuid().notNull().defaultRandom().primaryKey(),
  publishedSlug: t.uuid().notNull().defaultRandom(),

  name: t.varchar({ length: 256 }).notNull(),
  description: t.varchar({ length: 1000 }).notNull().default(""),
  body: t.varchar().notNull().default("Welcome to tinypad!"),
  password: t.varchar({ length: 80 }),
  public: t.boolean().default(true).notNull(),

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
