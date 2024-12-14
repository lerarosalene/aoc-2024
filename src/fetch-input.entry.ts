import fs from "node:fs";
import p from "node:path";
import { parseEnv } from "node:util";
import assert from "node:assert";
import arg from "arg";

const fsp = fs.promises;

declare module "node:util" {
  export function parseEnv(input: string): Partial<Record<string, string>>;
}

async function main() {
  const args = arg({
    "--day": Number,
    "--output": String,
    "-o": "--output",
    "-d": "--day",
  });

  const day = args["--day"];
  assert(day !== undefined && day !== null, "day must be provided");
  const output = args["--output"] ?? p.join("inputs", `day-${day}.txt`);

  const envRaw = await fsp.readFile(".env", "utf-8");
  const params = parseEnv(envRaw);
  const session = process.env.SESSION ?? params.SESSION ?? null;
  assert(
    session,
    "session cookie must be provided through process.ENV or .env file",
  );

  const response = await fetch(
    `https://adventofcode.com/2024/day/${day}/input`,
    {
      headers: {
        cookie: `session=${session}`,
        Referer: `https://adventofcode.com/2024/day/${day}`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    },
  );
  const text = await response.text();

  await fsp.writeFile(output, text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
