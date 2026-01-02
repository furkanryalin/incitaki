import { defineConfig, env } from "prisma/config";
import { join } from "path";

// Mutlak yol oluştur
const defaultDbPath = join(process.cwd(), "prisma", "dev.db");
const defaultDbUrl = `file:${defaultDbPath}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL ? env("DATABASE_URL") : defaultDbUrl,
  },
});
