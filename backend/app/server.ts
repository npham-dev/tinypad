import http from "http";
import * as map from "lib0/map";
import { WebSocketServer, type WebSocket } from "ws";
import { tryCatch } from "./lib/try-catch";
import { MesssageType, parseMessage } from "./message-schema";

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;
const wsReadyStateClosing = 2; // eslint-disable-line
const wsReadyStateClosed = 3; // eslint-disable-line

const pingTimeout = 30000;

const port = process.env.PORT || 4444;
const wss = new WebSocketServer({ noServer: true });

const server = http.createServer((_, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

/**
 * Map froms topic-name to set of subscribed clients.
 */
const topics: Map<string, Set<WebSocket>> = new Map();

const send = (conn: WebSocket, message: object) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    conn.close();
  }
  try {
    conn.send(JSON.stringify(message));
  } catch (e) {
    conn.close();
  }
};

/**
 * Setup a new client
 */
wss.on("connection", (conn) => {
  const subscribedTopics: Set<string> = new Set();
  let closed = false;
  // Check if connection is still alive
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close();
      clearInterval(pingInterval);
    } else {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        conn.close();
      }
    }
  }, pingTimeout);
  conn.on("pong", () => {
    pongReceived = true;
  });
  conn.on("close", () => {
    subscribedTopics.forEach((topicName) => {
      const subs = topics.get(topicName) || new Set();
      subs.delete(conn);
      if (subs.size === 0) {
        topics.delete(topicName);
      }
    });
    subscribedTopics.clear();
    closed = true;
  });
  conn.on("message", async (rawMessage: unknown) => {
    const messageResult = await tryCatch(parseMessage(rawMessage));
    if (messageResult.error !== null) {
      return;
    }

    const message = messageResult.data;
    if (message && message.type && !closed) {
      switch (message.type) {
        case MesssageType.SUBSCRIBE:
          (message.topics || []).forEach((topicName: string) => {
            if (typeof topicName === "string") {
              // add conn to topic
              const topic = map.setIfUndefined(
                topics,
                topicName,
                () => new Set(),
              );
              topic.add(conn);
              // add topic to conn
              subscribedTopics.add(topicName);
            }
          });
          break;
        case MesssageType.UNSUBSCRIBE:
          (message.topics || []).forEach((topicName: string) => {
            const subs = topics.get(topicName);
            if (subs) {
              subs.delete(conn);
            }
          });
          break;
        case MesssageType.PUBLISH:
          if (message.topic) {
            const receivers = topics.get(message.topic);
            if (receivers) {
              message.clients = receivers.size;
              receivers.forEach((receiver) => send(receiver, message));
            }
          }
          break;
        case MesssageType.PING:
          send(conn, { type: "pong" });
      }
    }
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    // handle auth
    wss.emit("connection", ws, request);
  });
});

server.listen(port);

console.log("Signaling server running on localhost:", port);
