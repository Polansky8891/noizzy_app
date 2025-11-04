import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    css: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    setupFiles: ["tests/setup.front.js"],
    include: ["src/tests/**/*.test.{js,jsx}"],
  },
});
