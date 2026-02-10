#!/usr/bin/env node
/**
 * TIEMPO-368: Generate version.json for stale client detection
 *
 * This script runs at build time and creates a version.json file
 * that the client can check to detect if it's running stale code.
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const versionInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  buildTimestamp: Date.now()
};

const outputPath = join(__dirname, '../public/version.json');
writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

console.log(`[TIEMPO-368] Generated version.json: v${versionInfo.version} at ${versionInfo.buildTime}`);
