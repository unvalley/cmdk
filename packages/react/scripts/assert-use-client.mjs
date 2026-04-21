import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const entryPath = resolve(import.meta.dirname, "../dist/index.mjs")
const source = await readFile(entryPath, "utf8")
const firstMeaningfulLine = source
  .split("\n")
  .map((line) => line.trim())
  .find((line) => line.length > 0)

if (firstMeaningfulLine !== '"use client";' && firstMeaningfulLine !== "'use client';") {
  throw new Error(`Expected dist entry to preserve "use client", got: ${firstMeaningfulLine}`)
}
