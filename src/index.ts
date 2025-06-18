#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LicenseFilter, LicenseMatchResult } from './types/filter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const j = JSON.parse(fs.readFileSync(pkg, 'utf-8'));
        for (const { name: fname, fn } of filters) {
          const res = fn(p, j);
          if (res) {
            res.reason += ` (filter: ${fname})`;
            results.push(res);
          }
        }
      }
      await scan(p, filters, results);
    }
  }
  return results;
}

async function main() {
  const filters = await loadFilters();
  
  if (filters.length === 0) {
    console.error('❌ No filters loaded. Available filters: default-filter, spdx-filter');
    process.exit(1);
  }

  const results = await scan('node_modules', filters);
  if (results.length > 0) {
    console.error('❌ NC-license detected:');
    results.forEach(r => console.error(`- ${r.name}@${r.version} (${r.license}): ${r.reason}`));
    process.exit(1);
  }
  console.log('✅ No NC-licenses detected.');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
