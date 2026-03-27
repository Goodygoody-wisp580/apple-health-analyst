import { mkdtemp, readdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { runCli } from "../src/cli.js";

function fixturePath(name: string): string {
  return new URL(`../fixtures/${name}/export.zip`, import.meta.url).pathname;
}

describe("cli", () => {
  it("writes selected output formats to the output directory", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "apple-health-analyst-"));

    await runCli([
      "analyze",
      fixturePath("multi-source-export"),
      "--format",
      "json,markdown",
      "--out",
      outDir,
    ]);

    const files = await readdir(outDir);
    expect(files).toContain("summary.json");
    expect(files).toContain("report.md");
    expect(files).not.toContain("report.html");
  });

  it("applies --from and --to filters and preserves them in the summary", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "apple-health-analyst-"));

    await runCli([
      "analyze",
      fixturePath("multi-source-export"),
      "--from",
      "2026-03-01",
      "--to",
      "2026-03-26",
      "--format",
      "json",
      "--out",
      outDir,
    ]);

    const summary = JSON.parse(await readFile(path.join(outDir, "summary.json"), "utf8"));
    expect(summary.input.from).toBe("2026-03-01");
    expect(summary.input.to).toBe("2026-03-26");
  });

  it("rejects unsupported output formats", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "apple-health-analyst-"));

    await expect(
      runCli([
        "analyze",
        fixturePath("multi-source-export"),
        "--format",
        "pdf",
        "--out",
        outDir,
      ]),
    ).rejects.toThrow("不支持的输出格式");
  });
});
