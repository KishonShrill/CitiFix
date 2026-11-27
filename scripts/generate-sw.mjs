import fs from "node:fs";

const buildId =
  process.env.CF_PAGES_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  `local-${Date.now()}`;

const template = fs.readFileSync(
  "public/sw.template.js",
  "utf8"
);

const output = template.replace(
  "__CITIFIX_BUILD_ID__",
  buildId
);

fs.writeFileSync("public/sw.js", output);

console.log(`Generated service worker: ${buildId}`);
