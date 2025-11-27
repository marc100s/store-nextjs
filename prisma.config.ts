import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  seed: {
    run: async () => {
      await import("./db/seed");
    },
  },
});
