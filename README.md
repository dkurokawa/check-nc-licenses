# check-nc-licenses

A small CLI that scans a Node.js project's installed dependencies for non-commercial (NC) licenses, so they don't slip into a commercial build. Zero configuration — it reads `node_modules` and reports any NC-restricted packages.

[![CI](https://github.com/dkurokawa/check-nc-licenses/actions/workflows/ci.yml/badge.svg)](https://github.com/dkurokawa/check-nc-licenses/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/check-nc-licenses.svg)](https://www.npmjs.com/package/check-nc-licenses)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

Global install:

```bash
npm install -g check-nc-licenses
```

Or run without installing:

```bash
npx check-nc-licenses
```

No configuration files are required.

## Usage

Scan the current project's `node_modules`:

```bash
check-nc-licenses
```

It exits `0` when no NC license is found and `1` when one is detected (or an unexpected error occurs), which makes it usable as a CI gate.

### Run it automatically

Wire it into a script that runs before you build, test, or release:

```json
{
  "scripts": {
    "prebuild": "check-nc-licenses",
    "prerelease": "check-nc-licenses"
  }
}
```

For local/dev use without a global install, call it through `npx`:

```json
{
  "scripts": {
    "prebuild": "npx check-nc-licenses"
  }
}
```

> Note: avoid wiring this into a published library's `postinstall`. That would run on every downstream install and can fail a consumer's `npm install`. Prefer `prebuild`/`prerelease` or a dedicated CI step.

### Filters

```bash
# Keyword-based detection (default)
check-nc-licenses --use default-filter

# SPDX identifier detection
check-nc-licenses --use spdx-filter

# Save a detailed scan log to ./.nc-license-logs/
check-nc-licenses --log

# Help
check-nc-licenses --help
```

When no `--use` flag is given, all filters run.

## What it detects

- **Creative Commons NC licenses**: `CC-BY-NC`, `CC-BY-NC-SA`, etc. (SPDX identifiers and common text forms)
- **Non-commercial wording**: license fields containing `non-commercial` / `noncommercial`

Detection is word-boundary based, so names like `Company Inc` or `scancode` are not mistaken for NC licenses.

## Example output

```bash
$ check-nc-licenses
✅ No NC-licenses detected.
```

```bash
$ check-nc-licenses
❌ NC-license detected:
- some-package@1.0.0 (CC-BY-NC-4.0): license field contains NC keyword (filter: default-filter)
```

## Integration

### GitHub Actions

```yaml
- name: Check for NC licenses
  run: npx check-nc-licenses
```

## Documentation

- [Development Guide](https://github.com/dkurokawa/check-nc-licenses/blob/main/docs/DEVELOPMENT.md)
- [API Reference](https://github.com/dkurokawa/check-nc-licenses/blob/main/docs/API.md)
- [Testing Guide](https://github.com/dkurokawa/check-nc-licenses/blob/main/docs/TESTING.md)

## Contributing

Contributions are welcome — please open an issue or pull request.

## License

MIT
