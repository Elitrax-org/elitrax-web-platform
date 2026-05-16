import packageJson from "../../../package.json";

function replaceLastVersionSegment(version: string, buildHash: string): string {
  const segments = version.split(".");

  if (segments.length === 0) {
    return buildHash;
  }

  return `${segments.join(".")}-(${buildHash})`;
}

const appVersion = replaceLastVersionSegment(
  packageJson.version,
  process.env.NEXT_PUBLIC_APP_BUILD_HASH?.trim() || "dev",
);

export function getAppVersion(): string {
  return appVersion;
}
