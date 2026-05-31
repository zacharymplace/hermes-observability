const { Langfuse } = require("langfuse");
const fs = require("fs");

const standard = JSON.parse(fs.readFileSync("dist/hermes-observability-standard.json", "utf8"));
const environment = process.env.HERMES_ENVIRONMENT || process.env.NODE_ENV || "development";

const required = [
  "LANGFUSE_PUBLIC_KEY",
  "LANGFUSE_SECRET_KEY",
  "LANGFUSE_HOST",
];

const missing = required.filter((name) => !process.env[name] || !process.env[name].trim());

console.log("Langfuse Doctor");
console.log("================");

for (const name of required) {
  const value = process.env[name];
  if (!value) {
    console.log(`FAIL | ${name} | missing`);
  } else if (name.includes("SECRET")) {
    console.log(`PASS | ${name} | present (${value.length} chars)`);
  } else {
    console.log(`PASS | ${name} | ${value}`);
  }
}

if (missing.length > 0) {
  console.error("");
  console.error(`Langfuse config incomplete. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const host = process.env.LANGFUSE_HOST.replace(/\/$/, "");

let client;
try {
  client = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: host,
  });
} catch (error) {
  console.error("");
  console.error(`FAIL | client init | ${error.message}`);
  process.exit(1);
}

const startedAt = Date.now();

async function main() {
  const trace = client.trace({
    name: "langfuse-doctor",
    metadata: {
      repo: "hermes-observability",
      environment,
      standard_version: standard.version,
      trace_type: "doctor",
      check: "credential-doctor",
      checked_at: new Date().toISOString(),
    },
  });

  trace.event({
    name: "doctor-ping",
    metadata: {
      status: "checking",
      host,
    },
  });

  await client.flushAsync();

  console.log("");
  console.log(`PASS | doctor trace flushed | ${Date.now() - startedAt}ms`);
  console.log("NOTE | If Langfuse logs 401 Unauthorized above, host/key pairing is invalid even if flush returns.");
}

main().catch((error) => {
  console.error("");
  console.error(`FAIL | doctor trace | ${error.message}`);
  process.exit(1);
});
