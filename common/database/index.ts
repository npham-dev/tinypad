import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import * as schema from "./schema";

// explicitly set path b/c backend won't load them otherwise
dotenv.config({ path: path.join(__dirname, "../.env") });

export const db = drizzle(process.env.DATABASE_URL!, { schema });
