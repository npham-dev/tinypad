import { and, asc, desc, eq, gt } from "drizzle-orm";
import * as Y from "yjs";
import { db } from "..";
import { padSnapshots, padUpdates } from "../schema";

export async function loadDocument(documentName: string): Promise<Y.Doc> {
  const document = new Y.Doc();

  // get latest snapshot from db & rebuild from there
  const [snapshot] = await db
    .select({
      document: padSnapshots.document,
      createdAt: padSnapshots.createdAt,
    })
    .from(padSnapshots)
    .where(eq(padSnapshots.padId, documentName))
    .orderBy(desc(padSnapshots.createdAt))
    .limit(1);
  if (snapshot) {
    Y.applyUpdate(document, new Uint8Array(snapshot.document));
  }

  // get all updates from snapshot
  const updates = await db
    .select({
      delta: padUpdates.delta,
      createdAt: padUpdates.createdAt,
    })
    .from(padUpdates)
    .where(
      and(
        eq(padUpdates.padId, documentName),
        snapshot && gt(padUpdates.createdAt, snapshot.createdAt),
      ),
    )
    .orderBy(asc(padUpdates.createdAt));
  for (const update of updates) {
    Y.applyUpdate(document, update.delta);
  }
  return document;
}
