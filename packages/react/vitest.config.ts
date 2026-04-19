import { resolve } from "node:path"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@command-palette/core": resolve(__dirname, "../core/src/index.ts"),
    },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
    },
    include: ["tests/**/*.test.{ts,tsx}"],
  },
})
