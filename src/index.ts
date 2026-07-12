#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LicenseFilter, LicenseMatchResult } from './types/filter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the version from package.json (npm always ships package.json alongside
// the published files) so it stays in sync with a single source of truth.
function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

const VERSION = getVersion();

// ログ関連の設定
let LOG_DIR: string | null = null;
let LOG_FILE: string | null = null;
let logContent: string[] = [];

const filterArgs = new Set<string>();
const useAll = process.argv.filter(arg => arg.startsWith('--use')).length === 0;

process.argv.forEach((arg, i) => {
  if (arg === '--use' && process.argv[i + 1]) {
    filterArgs.add(process.argv[i + 1]);
  }
});

async function loadFilters() {
  const filtersDir = path.resolve(__dirname, './filters');
  const filters: { name: string, fn: LicenseFilter }[] = [];

  const files = fs.readdirSync(filtersDir);
  for (const file of files) {
    const name = file.replace(/\.(ts|js)$/, '');
    if (useAll || filterArgs.has(name)) {
      try {
        const mod = await import(path.join(filtersDir, file));
        if (typeof mod.default === 'function') {
          filters.push({ name, fn: mod.default });
        }
      } catch (error) {
        console.error(`Failed to load filter ${name}:`, error);
      }
    }
  }
  
  return filters;
}

async function scan(dir: string, filters: { name: string, fn: LicenseFilter }[], results: LicenseMatchResult[] = []) {
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.lstatSync(p);
    if (stat.isDirectory()) {
      const pkg = path.join(p, 'package.json');
      if (fs.existsSync(pkg)) {
        let j: any;
        try {
          j = JSON.parse(fs.readFileSync(pkg, 'utf-8'));
        } catch (error) {
          // A single malformed package.json must not abort the whole scan.
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️  Skipping unreadable package.json at ${pkg}: ${message}`);
          if (LOG_FILE) {
            logContent.push(`  ⚠️ Skipped unreadable package.json: ${pkg} (${message})`);
          }
          await scan(p, filters, results);
          continue;
        }
        if (LOG_FILE) {
          logContent.push(`Checking: ${j.name}@${j.version} (${j.license || 'no license'})`);
        }
        
        for (const { name: fname, fn } of filters) {
          const res = fn(p, j);
          if (res) {
            res.reason += ` (filter: ${fname})`;
            results.push(res);
            if (LOG_FILE) {
              logContent.push(`  ❌ Found NC license: ${res.reason}`);
            }
          }
        }
      }
      await scan(p, filters, results);
    }
  }
  return results;
}

async function saveLog() {
  if (!LOG_FILE || !LOG_DIR) return;
  
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    const logHeader = [
      `NC License Scan Log`,
      `Date: ${new Date().toISOString()}`,
      `Command: ${process.argv.join(' ')}`,
      `Working Directory: ${process.cwd()}`,
      `=====================================`,
      ''
    ];
    fs.writeFileSync(LOG_FILE, [...logHeader, ...logContent].join('\n'));
  } catch (error) {
    console.error('Warning: Failed to save log file:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Handle help and version flags
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`check-nc-licenses v${VERSION}

Usage: check-nc-licenses [options]

Options:
  -h, --help          Show this help message
  -v, --version       Show version number
  --use <filter>      Use specific filter (default-filter, spdx-filter)
  --log               Save detailed scan log to file

Examples:
  check-nc-licenses                     # Use all available filters
  check-nc-licenses --use default-filter  # Use only default filter
  check-nc-licenses --use spdx-filter     # Use only SPDX filter
  check-nc-licenses --log                # Save scan details to log file`);
    return;
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION);
    return;
  }

  const enableLog = args.includes('--log');
  
  // ログが有効な場合のみ設定
  if (enableLog) {
    LOG_DIR = path.resolve(process.cwd(), '.nc-license-logs');
    LOG_FILE = path.join(LOG_DIR, `scan-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
  }
  
  const filters = await loadFilters();
  
  if (filters.length === 0) {
    console.error('❌ No filters loaded. Available filters: default-filter, spdx-filter');
    process.exit(1);
  }

  if (LOG_FILE) {
    logContent.push(`Starting scan with filters: ${filters.map(f => f.name).join(', ')}`);
    logContent.push('');
  }

  const results = await scan('node_modules', filters);
  
  // ログファイルを保存（ログが有効な場合のみ）
  if (LOG_FILE) {
    logContent.push('');
    logContent.push(`Total packages scanned: ${logContent.filter(line => line.startsWith('Checking:')).length}`);
    logContent.push(`NC licenses found: ${results.length}`);
    await saveLog();
  }
  
  if (results.length > 0) {
    console.error('❌ NC-license detected:');
    results.forEach(r => console.error(`- ${r.name}@${r.version} (${r.license}): ${r.reason}`));
    if (LOG_FILE) {
      console.error(`\n📋 Full scan log saved to: ${LOG_FILE}`);
    }
    process.exit(1);
  }
  
  if (LOG_FILE) {
    console.log(`📋 Full scan log saved to: ${LOG_FILE}`);
  }
  
  console.log('✅ No NC-licenses detected.');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
