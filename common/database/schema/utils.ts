import * as t from "drizzle-orm/pg-core";

// https://github.com/drizzle-team/drizzle-orm/issues/956
// some caveats using Date
export const timestamp = {
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const bytea = t.customType<{
  data: Buffer;
  default: false;
  notNull: false;
}>({
  dataType() {
    return "bytea";
  },
});
