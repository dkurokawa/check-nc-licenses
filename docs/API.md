# API Reference

This document describes the filter system API and interfaces used in the NC license detection tool.

## Core Interfaces

### LicenseFilter

The main interface for implementing license detection filters.

```typescript
export interface LicenseFilter {
  (pkgPath: string, pkgJson: any): LicenseMatchResult | null;
}
```

#### Parameters
- `pkgPath` (string): Absolute path to the package directory
- `pkgJson` (any): Parsed package.json content

#### Returns
- `LicenseMatchResult | null`: Match result if non-commercial license detected, null otherwise

### LicenseMatchResult

Result object returned when a non-commercial license is detected.

```typescript
export interface LicenseMatchResult {
  name: string;        // Package name
  version: string;     // Package version
  license: string;     // License string from package.json
  reason: string;      // Explanation of why it was flagged
}
```

## Built-in Filters

### Default Filter

Located: `filters/default-filter.ts`

Detects non-commercial licenses using keyword matching.

```typescript
import defaultFilter from './filters/default-filter.js'

const result = defaultFilter('/path/to/package', {
  name: 'test-package',
  version: '1.0.0',
  license: 'CC-BY-NC-4.0'
})

// Returns:
// {
//   name: 'test-package',
//   version: '1.0.0', 
//   license: 'CC-BY-NC-4.0',
//   reason: 'license field contains NC keyword'
// }
```

#### Detection Keywords
- `'non-commercial'`
- `'by-nc'` 
- `'cc-by-nc'`

#### Features
- Case-insensitive matching
- Partial string matching
- Fast keyword-based detection

### SPDX Filter

Located: `filters/spdx-filter.ts`

Detects non-commercial licenses using precise SPDX identifier matching.

```typescript
import spdxFilter from './filters/spdx-filter.js'

const result = spdxFilter('/path/to/package', {
  name: 'test-package',
  version: '1.0.0',
  license: 'CC-BY-NC-4.0'
})

// Returns:
// {
//   name: 'test-package',
//   version: '1.0.0',
//   license: 'CC-BY-NC-4.0', 
//   reason: 'SPDX identifier is known to be non-commercial'
// }
```

#### Supported SPDX Identifiers
- `CC-BY-NC-1.0`
- `CC-BY-NC-2.0`
- `CC-BY-NC-2.5`
- `CC-BY-NC-3.0`
- `CC-BY-NC-4.0`
- `CC-BY-NC-SA-1.0`
- `CC-BY-NC-SA-2.0`
- `CC-BY-NC-SA-2.5`
- `CC-BY-NC-SA-3.0`
- `CC-BY-NC-SA-4.0`

#### Features
- Exact SPDX identifier matching
- Case-insensitive comparison
- High precision, low false positives

## Creating Custom Filters

### Basic Filter Structure

```typescript
// filters/my-custom-filter.ts
import { LicenseFilter, LicenseMatchResult } from '../types/filter.js'

const customFilter: LicenseFilter = (pkgPath, pkgJson) => {
  // Your detection logic here
  const license = (pkgJson.license || '').toLowerCase()
  
  if (shouldFlag(license)) {
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      license: pkgJson.license,
      reason: 'Custom detection reason'
    }
  }
  
  return null
}

function shouldFlag(license: string): boolean {
  // Implement your detection logic
  return license.includes('academic-only') || 
         license.includes('research-only')
}

export default customFilter
```

### Advanced Filter Example

```typescript
// filters/advanced-filter.ts
import { LicenseFilter, LicenseMatchResult } from '../types/filter.js'

interface FilterConfig {
  keywords: string[]
  confidence: number
  strictMode: boolean
}

class AdvancedFilter {
  private config: FilterConfig

  constructor(config: FilterConfig) {
    this.config = config
  }

  filter: LicenseFilter = (pkgPath, pkgJson) => {
    const license = this.normalizeLicense(pkgJson.license)
    const matches = this.findMatches(license)
    
    if (matches.length > 0) {
      return {
        name: pkgJson.name,
        version: pkgJson.version,
        license: pkgJson.license,
        reason: `Matched keywords: ${matches.join(', ')}`
      }
    }
    
    return null
  }

  private normalizeLicense(license: any): string {
    if (!license) return ''
    if (typeof license === 'string') return license.toLowerCase()
    if (Array.isArray(license)) return license.join(' ').toLowerCase()
    return String(license).toLowerCase()
  }

  private findMatches(license: string): string[] {
    return this.config.keywords.filter(keyword => 
      license.includes(keyword.toLowerCase())
    )
  }
}

// Export configured instance
const advancedFilter = new AdvancedFilter({
  keywords: ['non-commercial', 'academic-only', 'research-only'],
  confidence: 0.8,
  strictMode: false
})

export default advancedFilter.filter
```

### Filter Registration

Filters are automatically loaded from the `filters/` directory. To register a custom filter:

1. Create your filter file in `filters/`
2. Export the filter function as default
3. Use the filename (without extension) as the filter name

```bash
# Use your custom filter
./dist/index.js --use my-custom-filter
```

## CLI Integration

### Filter Loading

```typescript
// src/index.ts
const filtersDir = path.resolve(__dirname, '../filters')
const filters: { name: string, fn: LicenseFilter }[] = []

fs.readdirSync(filtersDir).forEach(file => {
  const name = file.replace(/\.(ts|js)$/, '')
  if (useAll || filterArgs.has(name)) {
    const mod = require(path.join(filtersDir, file))
    if (typeof mod.default === 'function') {
      filters.push({ name, fn: mod.default })
    }
  }
})
```

### Scanning Logic

```typescript
function scan(dir: string, results: LicenseMatchResult[] = []) {
  if (!fs.existsSync(dir)) return results
  
  for (const name of fs.readdirSync(dir)) {
    const pkgPath = path.join(dir, name)
    const stat = fs.lstatSync(pkgPath)
    
    if (stat.isDirectory()) {
      const pkgJsonPath = path.join(pkgPath, 'package.json')
      
      if (fs.existsSync(pkgJsonPath)) {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
        
        for (const { name: filterName, fn } of filters) {
          const result = fn(pkgPath, pkgJson)
          if (result) {
            result.reason += ` (filter: ${filterName})`
            results.push(result)
          }
        }
      }
      
      scan(pkgPath, results) // Recursive scan
    }
  }
  
  return results
}
```

## Testing Filters

### Unit Testing

```typescript
// test/my-filter.test.ts
import { describe, it, expect } from 'vitest'
import myFilter from '../filters/my-filter.js'

describe('My Custom Filter', () => {
  it('should detect academic licenses', () => {
    const result = myFilter('/fake/path', {
      name: 'test-pkg',
      version: '1.0.0',
      license: 'Academic Use Only'
    })
    
    expect(result).not.toBeNull()
    expect(result?.reason).toContain('academic')
  })

  it('should not flag MIT license', () => {
    const result = myFilter('/fake/path', {
      name: 'test-pkg',
      version: '1.0.0',
      license: 'MIT'
    })
    
    expect(result).toBeNull()
  })
})
```

### Integration Testing

```typescript
// Add to test patterns
export const myTestPatterns = [
  {
    description: "Academic license detection",
    package: {
      name: "academic-pkg",
      version: "1.0.0",
      license: "For Academic Use Only"
    },
    expectedToMatch: true
  }
]
```

## Performance Considerations

### Filter Optimization

1. **Early Returns**: Return null as soon as non-match is determined
2. **Efficient String Operations**: Use indexOf() instead of regex when possible
3. **Caching**: Cache expensive computations if called repeatedly
4. **Memory Management**: Avoid creating large intermediate objects

### Example Optimized Filter

```typescript
const optimizedFilter: LicenseFilter = (pkgPath, pkgJson) => {
  // Quick null check
  if (!pkgJson.license) return null
  
  const license = pkgJson.license
  
  // Quick type check
  if (typeof license !== 'string') return null
  
  // Fast string operations
  const lowerLicense = license.toLowerCase()
  
  // Early returns for performance
  if (lowerLicense.indexOf('non-commercial') !== -1) {
    return createResult(pkgJson, 'contains non-commercial')
  }
  
  if (lowerLicense.indexOf('by-nc') !== -1) {
    return createResult(pkgJson, 'contains by-nc')
  }
  
  return null
}

function createResult(pkgJson: any, reason: string): LicenseMatchResult {
  return {
    name: pkgJson.name,
    version: pkgJson.version,
    license: pkgJson.license,
    reason
  }
}
```

## Error Handling

### Robust Filter Implementation

```typescript
const robustFilter: LicenseFilter = (pkgPath, pkgJson) => {
  try {
    // Validate inputs
    if (!pkgJson || typeof pkgJson !== 'object') {
      return null
    }
    
    if (!pkgJson.name || !pkgJson.version) {
      return null
    }
    
    // Safe license access
    const license = getLicenseString(pkgJson)
    if (!license) return null
    
    // Detection logic
    if (isNonCommercial(license)) {
      return {
        name: String(pkgJson.name),
        version: String(pkgJson.version),
        license: String(pkgJson.license),
        reason: 'Non-commercial license detected'
      }
    }
    
    return null
    
  } catch (error) {
    // Log error but don't throw - continue processing other packages
    console.warn(`Filter error for ${pkgPath}:`, error.message)
    return null
  }
}

function getLicenseString(pkgJson: any): string {
  const license = pkgJson.license
  
  if (typeof license === 'string') return license
  if (Array.isArray(license)) return license.join(' ')
  if (license && typeof license === 'object' && license.type) {
    return license.type
  }
  
  return ''
}
```

This API provides flexible, extensible license detection capabilities while maintaining performance and reliability.
