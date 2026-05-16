import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const databaseUrlSource = process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL";
const outputDir = resolve(process.env.BACKUP_OUTPUT_DIR || ".backups");
const retentionDays = Number.parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10);
const pgDumpBin = process.env.PG_DUMP_BIN || "pg_dump";

function fail(message) {
  console.error(`backup-smoke: ${message}`);
  process.exit(1);
}

function redact(value) {
  if (!value) return "";
  return value
    .replaceAll(databaseUrl || "", "[redacted database url]")
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "postgres://[redacted]");
}

if (!databaseUrl) {
  fail("set DIRECT_URL or DATABASE_URL before running a backup smoke check");
}

if (!Number.isInteger(retentionDays) || retentionDays < 1) {
  fail("BACKUP_RETENTION_DAYS must be a positive integer");
}

const version = spawnSync(pgDumpBin, ["--version"], { encoding: "utf8" });
if (version.status !== 0) {
  fail(`could not execute ${pgDumpBin}; install PostgreSQL client tools or set PG_DUMP_BIN`);
}

mkdirSync(outputDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const dumpPath = join(outputDir, `elitrax-${timestamp}.dump`);
const manifestPath = join(outputDir, `elitrax-${timestamp}.manifest.json`);

const dump = spawnSync(
  pgDumpBin,
  ["--format=custom", "--no-owner", "--no-acl", "--file", dumpPath, databaseUrl],
  { encoding: "utf8" },
);

if (dump.status !== 0) {
  console.error(redact(dump.stderr || dump.stdout));
  fail("pg_dump failed");
}

const dumpStats = statSync(dumpPath);
if (dumpStats.size <= 0) {
  fail(`created empty dump at ${dumpPath}`);
}

const cutoffMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
const pruned = [];
for (const fileName of readdirSync(outputDir)) {
  if (!fileName.startsWith("elitrax-") || (!fileName.endsWith(".dump") && !fileName.endsWith(".manifest.json"))) {
    continue;
  }
  const filePath = join(outputDir, fileName);
  const stats = statSync(filePath);
  if (stats.mtimeMs < cutoffMs) {
    unlinkSync(filePath);
    pruned.push(fileName);
  }
}

const manifest = {
  createdAt: new Date().toISOString(),
  dumpFile: basename(dumpPath),
  bytes: dumpStats.size,
  databaseUrlSource,
  pgDumpVersion: version.stdout.trim(),
  retentionDays,
  pruned,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`backup-smoke: created ${dumpPath} (${dumpStats.size} bytes)`);
console.log(`backup-smoke: wrote ${manifestPath}`);
if (pruned.length > 0) {
  console.log(`backup-smoke: pruned ${pruned.length} expired artifact(s)`);
}
