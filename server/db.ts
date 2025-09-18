import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import pg from "pg";
const { Pool: NodePostgresPool } = pg;
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import ws from "ws";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const shouldUseNeon =
  process.env.DATABASE_CLIENT === "neon" ||
  /\.neon\.(tech|fun|love)/.test(connectionString) ||
  connectionString.includes("sslmode=require");

if (shouldUseNeon) {
  neonConfig.webSocketConstructor = ws;
}

const neonPool = shouldUseNeon
  ? new NeonPool({ connectionString })
  : undefined;

const nodePostgresPool = shouldUseNeon
  ? undefined
  : new NodePostgresPool({ connectionString });

export const db = shouldUseNeon
  ? drizzleNeon({ client: neonPool!, schema })
  : drizzleNodePostgres(nodePostgresPool!, { schema });

export const pool = shouldUseNeon ? neonPool : nodePostgresPool;
