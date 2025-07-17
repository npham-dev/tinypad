import { Server } from "@hocuspocus/server";
import { db } from "common/database";
import { padSnapshots, padUpdates } from "common/database/schema";
import { loadDocument } from "common/database/services/load-document";
import "dotenv/config";
import * as Y from "yjs";
import { canJoinRoom } from "./access-control";

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
    return loadDocument(documentName);
  },
  async onAuthenticate(data) {
    data.connectionConfig.isAuthenticated = await canJoinRoom(
      data.token,
      data.documentName,
    );
  },
});

server.listen();
