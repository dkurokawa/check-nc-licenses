# Development Guide

This guide covers development setup, contribution guidelines, and project architecture.

## Quick Setup

```bash
# Clone the repository
git clone https://github.com/dkurokawa/check-nc-licenses.git
cd check-nc-licenses

# Install dependencies
npm install

# Build the project
npm run build

# Scan for NC licenses (after building)
./dist/index.js

# Use specific filter
./dist/index.js --use default-filter
./dist/index.js --use spdx-filter

# Run tests
npm test

# Start development with watch mode
npm run dev
```

## Features

- **Multiple Filter Support**: Default and SPDX-specific filters
- **Comprehensive Pattern Detection**: Detects various non-commercial license formats
- **Performance Optimized**: Fast scanning with minimal memory usage
- **Extensive Testing**: Comprehensive test suite with Vitest

## Testing

```bash
# Run all tests
npm test

# Run pattern-specific tests
npm run test:patterns

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Project Structure

```
check-nc-licenses/
├── docs/                    # Documentation
│   ├── API.md              # API reference
│   ├── DEVELOPMENT.md      # This file
│   └── TESTING.md          # Testing guide
├── filters/                 # License detection filters
│   ├── default-filter.ts   # Keyword-based filter
│   └── spdx-filter.ts      # SPDX identifier filter
├── src/                     # Main source code
│   └── index.ts            # CLI entry point
├── test/                    # Test files
│   ├── filters.test.ts     # Filter tests
│   ├── performance.test.ts # Performance tests
│   └── test-patterns.ts    # Test data definitions
├── types/                   # TypeScript type definitions
│   └── filter.d.ts         # Filter interfaces
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
├── vitest.config.ts        # Test configuration
└── README.md               # Project overview
```

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in watch mode for development
npm run dev
```

### 2. Running Tests During Development

```bash
# Watch mode - automatically re-runs tests
npm run test:watch

# Run specific test file
npm test -- test/filters.test.ts

# Run with coverage
npm run test:coverage
```

### 3. Code Quality

```bash
# Type checking
npx tsc --noEmit

# Manual testing with patterns
npm run test:patterns
```

## Architecture Overview

### Core Components

#### 1. CLI Interface (`src/index.ts`)
- Argument parsing (`--use filter-name`)
- Directory scanning
- Filter orchestration
- Result reporting

#### 2. Filter System (`filters/`)
- **Default Filter**: Keyword-based detection
- **SPDX Filter**: Precise SPDX identifier matching
- **Plugin Architecture**: Easy to extend with custom filters

#### 3. Type System (`types/`)
- **LicenseFilter**: Main filter interface
- **LicenseMatchResult**: Standard result format

#### 4. Test System (`test/`)
- **Pattern Testing**: Comprehensive license pattern coverage
- **Performance Testing**: Speed and memory benchmarks
- **Integration Testing**: End-to-end filter validation

### Data Flow

```
package.json → Filter → LicenseMatchResult → CLI Output
     ↑           ↑            ↑                 ↑
  File Read   Detection    Structured        Human
              Logic        Result           Readable
```

## Adding New Features

### Creating a New Filter

1. **Create filter file**:
```bash
touch filters/my-new-filter.ts
```

2. **Implement the filter**:
```typescript
// filters/my-new-filter.ts
import { LicenseFilter, LicenseMatchResult } from '../types/filter.js'

const myNewFilter: LicenseFilter = (pkgPath, pkgJson) => {
  const license = (pkgJson.license || '').toLowerCase()
  
  // Your detection logic
  if (shouldDetect(license)) {
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      license: pkgJson.license,
      reason: 'Detected by my new filter'
    }
  }
  
  return null
}

function shouldDetect(license: string): boolean {
  // Implement your detection logic
  return license.includes('custom-keyword')
}

export default myNewFilter
```

3. **Add tests**:
```typescript
// test/my-new-filter.test.ts
import { describe, it, expect } from 'vitest'
import myNewFilter from '../filters/my-new-filter.js'

describe('My New Filter', () => {
  it('should detect custom licenses', () => {
    const result = myNewFilter('/fake/path', {
      name: 'test',
      version: '1.0.0',
      license: 'Custom License with custom-keyword'
    })
    
    expect(result).not.toBeNull()
    expect(result?.reason).toContain('my new filter')
  })
})
```

4. **Add test patterns**:
```typescript
// test/test-patterns.ts
export const myNewFilterPatterns = [
  {
    description: "Custom keyword detection",
    package: {
      name: "test-custom",
      version: "1.0.0", 
      license: "License with custom-keyword"
    },
    expectedToMatch: true
  }
]
```

### Extending Test Coverage

1. **Add new test patterns**:
```typescript
// test/test-patterns.ts
export const newPatterns = [
  {
    description: "New pattern description",
    package: { /* package data */ },
    expectedToMatch: true
  }
]

// Add to main export
export const allPatterns = [
  ...nonCommercialPatterns,
  ...commercialPatterns,
  ...edgeCasePatterns,
  ...newPatterns  // Add here
]
```

2. **Create specialized tests**:
```typescript
// test/specialized.test.ts
import { describe, it, expect } from 'vitest'

describe('Specialized Cases', () => {
  it('should handle edge case X', () => {
    // Test implementation
  })
})
```

### Performance Optimization

1. **Profile existing filters**:
```bash
npm run test:coverage -- --reporter=verbose
```

2. **Add performance tests**:
```typescript
// test/performance.test.ts
it('new filter should be fast', async () => {
  const iterations = 10000
  const start = performance.now()
  
  for (let i = 0; i < iterations; i++) {
    await newFilter('/fake/path', testPackage)
  }
  
  const duration = performance.now() - start
  expect(duration / iterations).toBeLessThan(1) // < 1ms per call
})
```

## Code Standards

### TypeScript Guidelines

1. **Strict Type Safety**:
```typescript
// Good - explicit types
function processLicense(license: string | undefined): boolean {
  return typeof license === 'string' && license.includes('nc')
}

// Avoid - implicit any
function processLicense(license) {
  return license && license.includes('nc')
}
```

2. **Interface Usage**:
```typescript
// Use existing interfaces
import { LicenseFilter, LicenseMatchResult } from '../types/filter.js'

// Extend when needed
interface ExtendedResult extends LicenseMatchResult {
  confidence: number
}
```

3. **Error Handling**:
```typescript
const safeFilter: LicenseFilter = (pkgPath, pkgJson) => {
  try {
    // Filter logic
    return processPackage(pkgJson)
  } catch (error) {
    console.warn(`Filter error for ${pkgPath}:`, error.message)
    return null
  }
}
```

### Testing Standards

1. **Descriptive Test Names**:
```typescript
// Good
it('should detect CC-BY-NC-4.0 SPDX identifier', () => {})

// Avoid
it('test 1', () => {})
```

2. **Comprehensive Coverage**:
```typescript
describe('New Filter', () => {
  describe('positive cases', () => {
    // Tests that should match
  })
  
  describe('negative cases', () => {
    // Tests that should not match
  })
  
  describe('edge cases', () => {
    // Unusual inputs, error conditions
  })
})
```

3. **Performance Expectations**:
```typescript
it('should process quickly', () => {
  const start = performance.now()
  filter('/path', package)
  const duration = performance.now() - start
  
  expect(duration).toBeLessThan(10) // 10ms threshold
})
```

## Debugging

### Common Development Issues

#### 1. Import/Export Problems
```bash
# Check file extensions in imports
# ES modules require explicit .js extensions
import filter from './filter.js'  // ✓ Correct
import filter from './filter'     // ✗ Wrong
```

#### 2. Type Errors
```bash
# Run type checking
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/index.ts
```

#### 3. Test Failures
```bash
# Run specific test
npm test -- --run test/filters.test.ts

# Debug mode
npm test -- --reporter=verbose
```

### Debug Tools

#### 1. Console Debugging
```typescript
const debugFilter: LicenseFilter = (pkgPath, pkgJson) => {
  console.log('Processing:', pkgJson.name, pkgJson.license)
  
  const result = originalLogic(pkgPath, pkgJson)
  
  if (result) {
    console.log('Detected:', result.reason)
  }
  
  return result
}
```

#### 2. Test Debugging
```typescript
// Isolate specific test
it.only('should debug this case', () => {
  const result = filter('/path', testPackage)
  console.log('Debug result:', result)
  expect(result).toBeDefined()
})
```

#### 3. Performance Profiling
```bash
# Run with profiling
node --prof dist/index.js

# Analyze profile
node --prof-process isolate-*.log
```

## Contributing

### Pull Request Process

1. **Fork and Clone**:
```bash
git clone https://github.com/[your-username]/check-nc-licenses.git
cd check-nc-licenses
git checkout -b feature/new-feature
```

2. **Make Changes**:
- Write code following project standards
- Add comprehensive tests
- Update documentation if needed

3. **Test Your Changes**:
```bash
npm test
npm run test:patterns
npm run build
```

4. **Submit PR**:
- Clear description of changes
- Include test results
- Reference any related issues

### Code Review Checklist

- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] New features have tests
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Error handling implemented
- [ ] Code follows project patterns

## Release Process

### Version Management

1. **Update Version**:
```bash
npm version patch  # Bug fixes
npm version minor  # New features
npm version major  # Breaking changes
```

2. **Build and Test**:
```bash
npm run build
npm test
npm run test:patterns
```

3. **Update Documentation**:
- Update README.md
- Update CHANGELOG.md
- Review API documentation

4. **Tag and Release**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Maintenance

### Regular Tasks

1. **Dependency Updates**:
```bash
npm outdated
npm update
npm audit fix
```

2. **Performance Monitoring**:
```bash
npm run test:coverage
# Review performance test results
```

3. **Documentation Review**:
- Keep examples current
- Update performance benchmarks
- Review API documentation

### Long-term Considerations

1. **Filter Accuracy**: Monitor false positives/negatives
2. **Performance**: Ensure scalability with large codebases  
3. **Compatibility**: Test with different Node.js versions
4. **Security**: Regular dependency audits

This development guide provides the foundation for contributing to and maintaining the NC license detection tool.
