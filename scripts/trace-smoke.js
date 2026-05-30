const { Langfuse } = require("langfuse");

async function main() {
  const required = [
    "LANGFUSE_PUBLIC_KEY",
    "LANGFUSE_SECRET_KEY",
    "LANGFUSE_HOST",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }

  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_HOST,
  });

  const trace = langfuse.trace({
    name: "hermes-observability-smoke",
    metadata: {
      subsystem: "hermes-observability",
      check: "trace-ingestion",
      timestamp: new Date().toISOString(),
    },
    tags: ["hermes", "smoke-test", "local"],
  });

  trace.event({
    name: "smoke-started",
    metadata: {
      status: "running",
    },
  });

  trace.event({
    name: "smoke-completed",
    metadata: {
      status: "pass",
    },
  });

  await langfuse.flushAsync();

  console.log("Langfuse smoke trace flushed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
