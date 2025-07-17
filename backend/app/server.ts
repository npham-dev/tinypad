import { Server } from "@hocuspocus/server";
import { canJoinRoom } from "./access-control";
import * as Y from "yjs";
import { db } from "common/database";
import { padSnapshots, padUpdates } from "common/database/schema";
import { and, desc, eq, gt } from "drizzle-orm";
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

      // get date of latest pad snapshot
      const latestPadSnapshot = tx
        .select({ createdAt: padSnapshots.createdAt })
        .from(padSnapshots)
        .where(eq(padSnapshots.padId, documentName))
        .orderBy(desc(padSnapshots.createdAt))
        .limit(1);

      // count how many pad updates since latest pad snapshot
      const updateCount = await tx.$count(
        padUpdates,
        and(
          eq(padUpdates.padId, documentName),
          gt(padUpdates.createdAt, latestPadSnapshot),
        ),
      );

      // create new snapshot
      if (updateCount >= NUM_UPDATE_BEFORE_SNAPSHOT) {
      }
    });
    stateVectors.set(documentName, Y.encodeStateVector(document));
  },
  // async onLoadDocument(data) {
  //   // return loadFromDatabase(data.documentName) || createInitialDocTemplate();
  // },
  async onAuthenticate(data) {
    data.connectionConfig.isAuthenticated = await canJoinRoom(
      data.token,
      data.documentName,
    );
  },
});

server.listen();
