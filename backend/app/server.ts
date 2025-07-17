import { Server } from "@hocuspocus/server";
import { canJoinRoom } from "./access-control";

// https://tiptap.dev/docs/hocuspocus/getting-started
const server = new Server({
  port: parseInt(process.env.PORT || "4444"),
  // async onStoreDocument(data) {
  //   // Save to database. Example:
  //   // saveToDatabase(data.document, data.documentName);
  // },
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
