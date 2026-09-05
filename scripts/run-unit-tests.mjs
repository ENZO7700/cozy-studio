#!/usr/bin/env node
/**
 * Cross-platform unit test runner.
 *
 * Product/core tests always run. Platform/template tests (brand OG skill,
 * grok-pwa bake, write-atomic handover docs) need the Grok sandbox layout and
 * are skipped unless RUN_PLATFORM_TESTS=1 or `.grok/skills/og` exists.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CORE_SCRIPT_TESTS = [
  "scripts/with-app-env.test.mjs",
  "scripts/browser-smoke-verdict.test.mjs",
  "scripts/check-auth-invariant.test.mjs",
  "scripts/migration-plan.test.mjs",
  "scripts/preview.test.mjs",
  "scripts/sign-out-plan.test.mjs",
];

const PLATFORM_SCRIPT_TESTS = [
  "scripts/brand-check.test.mjs",
  "scripts/grok-pwa-plugin.test.mjs",
  "scripts/write-atomic.test.mjs",
];

const SRC_TESTS = [
  "src/lib/app-data/app-data.test.ts",
  "src/lib/auth/gate-identity.test.ts",
  "src/lib/preview/cozy-elements.test.ts",
  "src/lib/preview/dom-patch.test.ts",
  "src/lib/preview/starters.test.ts",
  "src/lib/preview/local-templates.test.ts",
  "src/lib/studio/run-failure.test.ts",
  "src/lib/studio/recents.test.ts",
  "src/lib/studio/profile.test.ts",
];

function runPlatformTests() {
  if (process.env.RUN_PLATFORM_TESTS === "1") return true;
  if (process.env.RUN_PLATFORM_TESTS === "0") return false;
  return existsSync(join(".grok", "skills", "og"));
}

function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

const scriptTests = [...CORE_SCRIPT_TESTS];
if (runPlatformTests()) {
  scriptTests.push(...PLATFORM_SCRIPT_TESTS);
} else {
  console.log(
    "[run-unit-tests] skipping platform tests (brand/grok-pwa/write-atomic); set RUN_PLATFORM_TESTS=1 to force",
  );
}

// Sanity: every listed file exists
for (const file of [...scriptTests, ...SRC_TESTS]) {
  if (!existsSync(file)) {
    console.error(`[run-unit-tests] missing ${file}`);
    process.exit(1);
  }
}

// Detect unexpected .test.mjs files so new scripts are not silently dropped
const onDisk = readdirSync("scripts").filter((n) => n.endsWith(".test.mjs"));
const known = new Set(
  [...CORE_SCRIPT_TESTS, ...PLATFORM_SCRIPT_TESTS].map((p) => p.replace(/^scripts\//, "")),
);
for (const name of onDisk) {
  if (!known.has(name)) {
    console.error(`[run-unit-tests] unlisted scripts/${name} — add to CORE or PLATFORM list`);
    process.exit(1);
  }
}

let status = run(["--test", ...scriptTests]);
if (status !== 0) process.exit(status);
status = run(["--experimental-strip-types", "--test", ...SRC_TESTS]);
process.exit(status);
