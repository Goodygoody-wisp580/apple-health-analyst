import { Readable } from "node:stream";
import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

import { findMainXml } from "../src/io/findMainXml.js";
import { readZip } from "../src/io/readZip.js";
import { parseHealthExport } from "../src/io/streamHealthXml.js";

const execFileAsync = promisify(execFile);

function fixturePath(name: string): string {
  return new URL(`../fixtures/${name}/export.zip`, import.meta.url).pathname;
}

function mockXmlEntry(path: string, xml: string) {
  return {
    path,
    type: "File" as const,
    stream: () => Readable.from([xml]),
  };
}

describe("parser", () => {
  it("selects HealthData XML with an English filename", async () => {
    const mainXml = await findMainXml([
      mockXmlEntry(
        "apple_health_export/export.xml",
        '<?xml version="1.0" encoding="UTF-8"?><HealthData locale="en_US"></HealthData>',
      ),
    ]);

    expect(mainXml.path).toBe("apple_health_export/export.xml");
  });

  it("selects HealthData XML with a localized filename", async () => {
    const mainXml = await findMainXml([
      mockXmlEntry(
        "apple_health_export/导出.xml",
        '<?xml version="1.0" encoding="UTF-8"?><HealthData locale="zh_CN"></HealthData>',
      ),
      mockXmlEntry(
        "apple_health_export/export_cda.xml",
        '<?xml version="1.0" encoding="UTF-8"?><ClinicalDocument xmlns="urn:hl7-org:v3"></ClinicalDocument>',
      ),
    ]);

    expect(mainXml.path).toBe("apple_health_export/导出.xml");
  });

  it("skips malformed auxiliary XML and still selects HealthData", async () => {
    const mainXml = await findMainXml([
      mockXmlEntry("apple_health_export/broken.xml", "<broken"),
      mockXmlEntry(
        "apple_health_export/导出.xml",
        '<?xml version="1.0" encoding="UTF-8"?><HealthData locale="zh_CN"></HealthData>',
      ),
    ]);

    expect(mainXml.path).toBe("apple_health_export/导出.xml");
  });

  it("prefers HealthData XML when the ZIP also contains ClinicalDocument XML", async () => {
    const zip = await readZip(fixturePath("multi-source-export"));
    const mainXml = await findMainXml(zip.files);

    expect(mainXml.path).toContain(".xml");
    expect(mainXml.path).not.toMatch(/export_cda\.xml$/);
  });

  it("finds the main XML even when the filename is mojibake", async () => {
    const zip = await readZip(fixturePath("minimal-export"));
    const mainXml = await findMainXml(zip.files);

    expect(mainXml.path).toContain(".xml");
    expect(mainXml.path).not.toMatch(/export_cda\.xml$/);
    expect(mainXml.path).toContain("σ");
  });

  it("throws a helpful error when the ZIP only contains ClinicalDocument XML", async () => {
    await expect(
      findMainXml([
        mockXmlEntry(
          "apple_health_export/export_cda.xml",
          '<?xml version="1.0" encoding="UTF-8"?><ClinicalDocument xmlns="urn:hl7-org:v3"></ClinicalDocument>',
        ),
      ]),
    ).rejects.toThrow(/HealthData|ClinicalDocument|导出\.xml/);
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

  it("parses workout statistics, metadata, and self-closing workouts together", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "apple-health-parser-"));
    const xmlPath = path.join(dir, "export.xml");
    const cdaPath = path.join(dir, "export_cda.xml");
    const zipPath = path.join(dir, "export.zip");

    await writeFile(
      xmlPath,
      `<?xml version="1.0" encoding="UTF-8"?>
<HealthData locale="en_US" exportDate="2026-03-27 00:00:00 +0000">
  <Workout sourceName="Apple Watch" sourceVersion="1" device="Watch" creationDate="2026-03-20 08:50:00 +0000" startDate="2026-03-20 08:00:00 +0000" endDate="2026-03-20 08:45:00 +0000" workoutActivityType="HKWorkoutActivityTypeBoxing" duration="45" durationUnit="min">
    <WorkoutStatistics type="HKQuantityTypeIdentifierActiveEnergyBurned" sum="420" unit="kcal"/>
    <WorkoutStatistics type="HKQuantityTypeIdentifierBasalEnergyBurned" sum="60" unit="kcal"/>
    <WorkoutStatistics type="HKQuantityTypeIdentifierHeartRate" average="155" minimum="92" maximum="181" unit="count/min"/>
    <WorkoutStatistics type="HKQuantityTypeIdentifierDistanceCycling" sum="10" unit="km"/>
    <MetadataEntry key="HKAverageMETs" value="8.4"/>
    <MetadataEntry key="HKIndoorWorkout" value="1"/>
  </Workout>
  <Workout sourceName="Apple Watch" sourceVersion="1" device="Watch" creationDate="2026-03-21 09:50:00 +0000" startDate="2026-03-21 09:00:00 +0000" endDate="2026-03-21 09:30:00 +0000" workoutActivityType="HKWorkoutActivityTypeWalking" duration="30" durationUnit="min"/>
</HealthData>
`,
      "utf8",
    );
    await writeFile(cdaPath, "<ClinicalDocument />\n", "utf8");
    await execFileAsync("zip", ["-q", zipPath, "export.xml", "export_cda.xml"], { cwd: dir });

    const zip = await readZip(zipPath);
    const mainXml = await findMainXml(zip.files);
    const parsed = await parseHealthExport(zipPath, zip.files, mainXml);

    expect(parsed.workouts).toHaveLength(2);
    expect(parsed.workouts[0]).toMatchObject({
      workoutActivityType: "HKWorkoutActivityTypeBoxing",
      activeEnergyBurnedKcal: 420,
      basalEnergyBurnedKcal: 60,
      averageHeartRateBpm: 155,
      minHeartRateBpm: 92,
      maxHeartRateBpm: 181,
      distanceKm: 10,
      averageMETs: 8.4,
      isIndoor: true,
    });
    expect(parsed.workouts[1]?.workoutActivityType).toBe("HKWorkoutActivityTypeWalking");
    expect(parsed.workouts[1]?.activeEnergyBurnedKcal).toBeNull();
    expect(parsed.workouts[1]?.distanceKm).toBeNull();
  });
});
