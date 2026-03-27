import { StringDecoder } from "node:string_decoder";

interface ZipEntryLike {
  path: string;
  type?: string;
  stream: () => NodeJS.ReadableStream;
}

async function readEntryPrefix(entry: ZipEntryLike, maxBytes = 8192): Promise<string> {
  const decoder = new StringDecoder("utf8");
  const stream = entry.stream();
  let result = "";
  let remaining = maxBytes;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
    const slice = buffer.subarray(0, remaining);
    result += decoder.write(slice);
    remaining -= slice.length;
    if (remaining <= 0) {
      break;
    }
  }

  if ("destroy" in stream && typeof stream.destroy === "function") {
    stream.destroy();
  }

  result += decoder.end();
  return result;
}

export async function findMainXml(entries: ZipEntryLike[]): Promise<ZipEntryLike> {
  const candidates = entries.filter((entry) => {
    if (entry.type === "Directory") {
      return false;
    }
    const lowerPath = entry.path.toLowerCase();
    return lowerPath.endsWith(".xml") && !lowerPath.endsWith("export_cda.xml");
  });

  for (const entry of candidates) {
    const prefix = await readEntryPrefix(entry);
    if (prefix.includes("<HealthData") || prefix.includes("<!DOCTYPE HealthData")) {
      return entry;
    }
  }

  throw new Error("无法在 ZIP 压缩包中定位 Apple Health 导出 XML。");
}
