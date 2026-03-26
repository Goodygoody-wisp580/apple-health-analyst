import { describe, expect, it } from "vitest";

import { findMainXml } from "../src/io/findMainXml.js";
import { readZip } from "../src/io/readZip.js";
import { parseHealthExport } from "../src/io/streamHealthXml.js";

function fixturePath(name: string): string {
  return new URL(`../fixtures/${name}/export.zip`, import.meta.url).pathname;
}

describe("parser", () => {
  it("finds the main XML and ignores export_cda.xml", async () => {
    const zip = await readZip(fixturePath("minimal-export"));
    const mainXml = await findMainXml(zip.files);

    expect(mainXml.path).toContain(".xml");
    expect(mainXml.path).not.toMatch(/export_cda\.xml$/);
    expect(mainXml.path).toContain("σ");
  });

  it("parses the minimal export fixture", async () => {
    const zipPath = fixturePath("minimal-export");
    const zip = await readZip(zipPath);
    const mainXml = await findMainXml(zip.files);
    const parsed = await parseHealthExport(zipPath, zip.files, mainXml);

    expect(parsed.mainXmlEntry).toContain("σ");
    expect(parsed.recordCount).toBe(1);
    expect(parsed.records.bodyMass).toHaveLength(1);
    expect(parsed.locale).toBe("en_US");
  });
});
