# Testing Guide

This project uses Vitest for modern, fast testing with comprehensive pattern coverage.

## Overview

The testing system includes:
- **Vitest**: Modern testing framework with TypeScript support
- **Comprehensive Patterns**: Various non-commercial license description patterns
- **Performance Testing**: Execution speed and memory usage measurement
- **Coverage Analysis**: Detection accuracy and filter comparison

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Watch mode (recommended for development)
npm run test:watch

# Coverage report
npm run test:coverage

# Interactive UI
npm run test:ui

# Pattern-specific tests
npm run test:patterns
```

## Test Structure

### Test Files
- `test/filters.test.ts`: Core filter functionality tests
- `test/performance.test.ts`: Performance benchmarks and memory tests
- `test/test-patterns.ts`: Test pattern definitions

### Test Patterns

#### Non-Commercial License Patterns
- **SPDX identifiers**: `CC-BY-NC-4.0`, `CC-BY-NC-SA-3.0`, etc.
- **Lowercase descriptions**: `cc-by-nc-4.0`, etc.
- **Text descriptions**: `Creative Commons Attribution-NonCommercial 4.0 International`
- **Keyword inclusion**: `Some License (BY-NC)`, etc.
- **URL format**: `https://creativecommons.org/licenses/by-nc/4.0/`
- **Legacy formats**: Old npm license description formats

#### Commercial License Patterns
- **Common licenses**: MIT, Apache-2.0, ISC, BSD-3-Clause
- **CC BY (no restrictions)**: CC-BY-4.0
- **GPL family**: GPL-3.0, LGPL-2.1
- **Unspecified**: undefined, null
- **Private**: UNLICENSED, proprietary

#### Edge Case Patterns
- **Empty strings**: `""`
- **Multiple licenses**: `MIT OR CC-BY-NC-4.0`, `MIT AND CC-BY-NC-4.0`
- **Confusing names**: `GNU General Public License v3.0 (Inc.)`
- **Mixed case**: `Cc-By-Nc-4.0`
- **Whitespace**: `  CC-BY-NC-4.0  `

## Vitest Configuration

### Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/']
    }
  }
})
```

### TypeScript Integration
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "types": ["vitest/globals"]
  }
}
```

## Test Features

### Dynamic Filter Loading
```typescript
async function loadFilter(filterName: string): Promise<LicenseFilter> {
  const filterPath = path.resolve(__dirname, '../filters', `${filterName}.js`)
  const module = await import(filterPath + '?t=' + Date.now()) // Cache busting
  return module.default
}
```

### Pattern Validation
Each test pattern includes:
- **Description**: Human-readable test case description
- **Test Package**: Mock package.json data
- **Expected Result**: Whether the pattern should match
- **Reason**: Why the pattern should/shouldn't match

### Performance Monitoring
- **Execution Speed**: Average time per filter operation
- **Memory Usage**: Heap usage before/after test runs
- **Throughput**: Operations per second
- **Comparative Analysis**: Performance between different filters

## Test Results Interpretation

### Pattern Test Output
```
✅ [Both] CC BY-NC-4.0 SPDX identifier
   Package: test-package-1@1.0.0
   License: CC-BY-NC-4.0
   Reason: SPDX identifier is known to be non-commercial

❌ [None] Confusing license name
   Package: test-package-confusing@1.0.0
   License: GNU General Public License v3.0 (Inc.)
   ⚠️  Expected: Match, Got: No match
```

### Statistical Summary
- **Total Patterns**: Number of test cases executed
- **Expected Matches**: Patterns that should be detected as non-commercial
- **Actual Matches**: Patterns actually detected
- **Accuracy**: Percentage of correct detections

### Filter Analysis
- **Both Filters**: Cases detected by both Default and SPDX filters
- **Default Only**: Cases detected only by Default filter
- **SPDX Only**: Cases detected only by SPDX filter
- **Neither**: Cases not detected by any filter

## Performance Benchmarks

### Speed Tests
```typescript
it('should process licenses quickly', async () => {
  const iterations = 10000
  const testPackage = { name: 'test', version: '1.0.0', license: 'CC-BY-NC-4.0' }
  
  const startTime = performance.now()
  for (let i = 0; i < iterations; i++) {
    await filter('/fake/path', testPackage)
  }
  const duration = performance.now() - startTime
  
  expect(duration / iterations).toBeLessThan(1) // < 1ms per operation
})
```

### Memory Tests
```typescript
it('should not leak memory', async () => {
  const initialMemory = process.memoryUsage().heapUsed
  
  // Run many operations
  for (let i = 0; i < 1000; i++) {
    await filter('/fake/path', testPackage)
  }
  
  if (global.gc) global.gc() // Force garbage collection
  
  const finalMemory = process.memoryUsage().heapUsed
  const memoryGrowth = finalMemory - initialMemory
  
  expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024) // < 10MB growth
})
```

## Adding Custom Test Patterns

### Pattern Definition
```typescript
// test/test-patterns.ts
export const customPatterns = [
  {
    description: "Custom non-commercial license",
    package: {
      name: "custom-test-package",
      version: "1.0.0",
      license: "Custom Non-Commercial License"
    },
    expectedToMatch: true
  }
]
```

### Integration
```typescript
// Add to existing test suites
import { customPatterns } from './custom-patterns'

const allPatterns = [
  ...nonCommercialPatterns,
  ...commercialPatterns,
  ...edgeCasePatterns,
  ...customPatterns
]
```

## Benefits of Vitest

1. **Performance**: 10x faster than Jest
2. **ES Modules**: Native support, no transpilation needed
3. **TypeScript**: Built-in support without configuration
4. **Hot Reload**: Instant feedback during development
5. **Modern API**: Latest testing features and patterns
6. **Vite Integration**: Leverages Vite's fast build system

## Troubleshooting

### Common Issues

#### Import Errors
```bash
# Ensure ES modules are properly configured
"type": "module" // in package.json
```

#### Filter Loading Issues
```typescript
// Use dynamic imports with cache busting
const module = await import(filterPath + '?t=' + Date.now())
```

#### Performance Issues
```bash
# Run tests with limited concurrency
npm test -- --reporter=verbose --pool=threads --poolOptions.threads.maxThreads=1
```

### Debug Mode
```bash
# Run with debug output
DEBUG=* npm test

# Run specific test file
npm test -- test/filters.test.ts

# Run with coverage
npm run test:coverage -- --reporter=verbose
```

This testing setup provides comprehensive validation of the license detection system with modern tooling and detailed analysis capabilities.
