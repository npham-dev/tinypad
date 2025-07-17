import { Server } from "@hocuspocus/server";
import { canJoinRoom } from "./access-control";
import * as Y from "yjs";
import { db } from "common/database";
import { pads, padSnapshots, padUpdates } from "common/database/schema";
import { and, desc, eq, asc, gt } from "drizzle-orm";
const NUM_UPDATE_BEFORE_SNAPSHOT = 30;

const stateVectors = new Map<string, Uint8Array>();
const updates = new Map<string, number>();

// https://tiptap.dev/docs/hocuspocus/getting-started
const server = new Server({
  port: parseInt(process.env.PORT || "4444"),
  async onStoreDocument({ document, documentName }) {
    const prevStateVector =
      stateVectors.get(documentName) || Y.encodeStateVector(new Y.Doc());
    const update = Buffer.from(
      Y.encodeStateAsUpdate(document, prevStateVector),
    );

    await db.transaction(async (tx) => {
      await tx
        .insert(padUpdates)
        .values({ padId: documentName, delta: update });
      const updateCount = (updates.get(documentName) || 0) + 1;
      updates.set(documentName, updateCount);

      // create new snapshot
      if (updateCount >= NUM_UPDATE_BEFORE_SNAPSHOT) {
        await tx.insert(padSnapshots).values({
          padId: documentName,
          document: Buffer.from(Y.encodeStateAsUpdate(document)),
        });
        updates.set(documentName, 0);
      }
    });

    stateVectors.set(documentName, Y.encodeStateVector(document));
  },
  async onLoadDocument({ documentName }) {
    // get latest state vector, if we have it
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
  },
  async onAuthenticate(data) {
    data.connectionConfig.isAuthenticated = await canJoinRoom(
      data.token,
      data.documentName,
    );
  },
});

server.listen();
