import { mkdtemp, readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { runCli } from "../src/cli.js";

function fixturePath(name: string): string {
  return new URL(`../fixtures/${name}/export.zip`, import.meta.url).pathname;
}

describe("cli", () => {
  it("prepare writes summary.json and insights.json", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "apple-health-analyst-"));

    await runCli([
      "prepare",
      fixturePath("multi-source-export"),
      "--out",
      outDir,
    ]);

    const files = await readdir(outDir);
    expect(files).toContain("summary.json");
    expect(files).toContain("insights.json");
  });

  it("prepare applies --from and --to filters", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "apple-health-analyst-"));

    await runCli([
      "prepare",
      fixturePath("multi-source-export"),
      "--from",
      "2026-03-01",
      "--to",
      "2026-03-26",
      "--out",
      outDir,
    ]);

    const summary = JSON.parse(await readFile(path.join(outDir, "summary.json"), "utf8"));
    expect(summary.input.from).toBe("2026-03-01");
    expect(summary.input.to).toBe("2026-03-26");
  });
});
