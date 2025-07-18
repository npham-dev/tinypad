import pino from "pino";

// https://blog.arcjet.com/structured-logging-in-json-for-next-js/
export const logger =
  process.env["NODE_ENV"] === "production"
    ? pino({ level: "warn" })
    : pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: "debug",
      });
