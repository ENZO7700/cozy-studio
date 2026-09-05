#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const runner = join(dirname(fileURLToPath(import.meta.url)), "run-unit-tests.mjs");
const result = spawnSync(process.execPath, [runner], {
  stdio: "inherit",
  env: { ...process.env, RUN_PLATFORM_TESTS: "1" },
});
process.exit(result.status ?? 1);
