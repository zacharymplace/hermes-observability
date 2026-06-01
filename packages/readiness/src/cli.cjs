#!/usr/bin/env node

const path = require("path");
const {
  runReadiness
} = require("../../../lib/readiness");

const packageRoot = path.resolve(__dirname, "..");

const defaultOptions = {
  standardPath: path.join(packageRoot, "standards", "readiness.json"),
  fixturePath: path.join(packageRoot, "fixtures", "valid-agent-trace.json"),
  jsonReportPath: path.join(process.cwd(), "reports", "readiness", "latest-readiness.json"),
  markdownReportPath: path.join(process.cwd(), "reports", "readiness", "latest-readiness.md")
};

runReadiness(process.argv.slice(2), defaultOptions);
