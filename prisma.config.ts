// Load .env.local first (Next.js convention), then .env as fallback
import { config } from "dotenv";
config({ path: ".env.local", override: true });
config({ path: ".env" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    shadowDatabaseUrl: process.env["DIRECT_URL"],
  },
});
