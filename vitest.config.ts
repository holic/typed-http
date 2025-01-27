import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["test/setupVitest.ts"],
    setupFiles: ["test/setup.ts"],
    environment: "jsdom",
  },
});
