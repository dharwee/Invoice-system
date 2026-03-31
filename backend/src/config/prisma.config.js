import config from "./index.js"
import { defineConfig } from "prisma/config";
export default defineConfig({
  datasource: {
    url: config.databaseUrl,
  },
});