// scripts/copy-config.js
const fs = require("fs");
const path = require("path");

const target = process.argv[2]; // devnet | testnet | mainnet
if (!target) {
  console.error("❌ Please specify network: devnet | testnet | mainnet");
  process.exit(1);
}

const srcFile = path.resolve(`src/config/config.${target}.ts`);
const destFile = path.resolve("src/config/index.ts");

if (!fs.existsSync(srcFile)) {
  console.error(`❌ Config file not found: ${srcFile}`);
  process.exit(1);
}

try {
  fs.copyFileSync(srcFile, destFile);
  console.log(`✅ Copied ${srcFile} -> ${destFile}`);
} catch (err) {
  console.error("❌ Failed to copy config:", err);
  process.exit(1);
}
