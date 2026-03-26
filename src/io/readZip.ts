import * as unzipper from "unzipper";

export async function readZip(zipPath: string) {
  return unzipper.Open.file(zipPath);
}
