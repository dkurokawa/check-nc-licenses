# check-nc-licenses

🔍 **Lightweight and fast** CLI tool to scan your Node.js project for non-commercial (NC) licenses in dependencies.

✨ **Zero configuration** - Works out of the box  
⚡ **Lightning fast** - Specialized for NC license detection  
🎯 **Purpose-built** - Focused on commercial project compliance  
🔧 **Easy integration** - Automatic build pipeline integration  

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue.svg)](https://www.typescriptlang.org/)

## Installation

**Global installation** (recommended):
```bash
npm install -g check-nc-licenses
```

**Or use instantly without installing**:
```bash
npx check-nc-licenses
```

**That's it!** No configuration files needed. 🚀

## Usage

### Basic Usage

**One command. That's all.** Scan your project's `node_modules` for non-commercial licenses:

```bash
check-nc-licenses
```

✅ **Zero setup required** - Works immediately on any Node.js project  
⚡ **Instant results** - Fast scanning of all dependencies  
🎯 **Smart detection** - Finds NC licenses others miss  

### Automatic Integration

**Set it and forget it.** Add to your `package.json` to run automatically:

```json
{
  "scripts": {
    "prebuild": "check-nc-licenses",    // Run before build
    "pretest": "check-nc-licenses",     // Run before tests
    "postinstall": "check-nc-licenses"  // Run after npm install
  }
}
```

**For published packages, use the installed command:**
```json
{
  "scripts": {
    "prebuild": "check-nc-licenses"
  }
}
```

**For development/local use:**
```json
{
  "scripts": {
    "prebuild": "npx check-nc-licenses"
  }
}
```

Now the tool runs automatically:
```bash
npm run build  # ✅ Checks licenses first, then builds
npm test       # ✅ Checks licenses first, then tests  
npm install    # ✅ Checks licenses after installing dependencies
```

### Manual Usage

```bash
# Use specific filter
check-nc-licenses --use default-filter    # Keyword-based detection (default)
check-nc-licenses --use spdx-filter       # SPDX identifier detection

# Show help
check-nc-licenses --help
```

## What It Detects

This tool identifies packages with non-commercial license restrictions, including:

- **Creative Commons NC licenses**: CC-BY-NC, CC-BY-NC-SA, etc.
- **Explicit non-commercial clauses**: "non-commercial use only", "academic use only"
- **Research/educational restrictions**: "research purposes only", "educational use"
- **Personal use limitations**: "personal use only"

## Exit Codes

- `0`: No non-commercial licenses found
- `1`: Non-commercial licenses detected or error occurred

## Example Output

```bash
$ check-nc-licenses

✅ No NC-licenses detected.
```

```bash
$ check-nc-licenses

❌ NC-license detected:
- some-package@1.0.0 (CC-BY-NC-4.0): Non-commercial Creative Commons license
```

## Why Use This Tool?

Non-commercial licenses can restrict how you use, distribute, or monetize your software. This **lightweight and focused** tool helps you:

- **Ensure compliance** with license requirements
- **Avoid legal issues** in commercial projects  
- **Audit dependencies** before releases
- **Integrate into CI/CD** pipelines **effortlessly**
- **Save time** with instant, accurate detection
- **Stay lightweight** - minimal dependencies, maximum performance

## Integration

### CI/CD Pipeline

Add to your GitHub Actions, Jenkins, or other CI systems:

```yaml
- name: Check for NC licenses
  run: npx check-nc-licenses
```

### package.json Scripts

```json
{
  "scripts": {
    "license-check": "check-nc-licenses",
    "prerelease": "npm run license-check"
  }
}
```

## Documentation

For developers and advanced usage:

- **[Development Guide](https://github.com/dkurokawa/check-nc-licenses/blob/main/docs/DEVELOPMENT.md)**
- **[API Reference](https://github.com/dkurokawa/check-nc-licenses/blob/main/docs/API.md)**
- **[Testing Guide](https://github.com/dkurokawa/check-nc-licenses/blob/main/docs/TESTING.md)**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
