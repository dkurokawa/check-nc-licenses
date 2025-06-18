import { describe, it, expect, beforeEach } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { LicenseFilter } from '../src/types/filter.js'
import { 
  nonCommercialPatterns, 
  commercialPatterns, 
  edgeCasePatterns,
  TestPackage 
} from './test-patterns.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load filters dynamically
async function loadFilter(filterName: string): Promise<LicenseFilter> {
  const filterPath = path.resolve(__dirname, '../src/filters', `${filterName}.js`)
  const module = await import(filterPath + '?t=' + Date.now()) // Cache busting
  return module.default
}

describe('License Filters', () => {
  describe('Default Filter', () => {
    let defaultFilter: LicenseFilter

    beforeEach(async () => {
      defaultFilter = await loadFilter('default-filter')
    })

    describe('Non-commercial patterns', () => {
      it.each(nonCommercialPatterns)(
        'should detect $description',
        ({ description, package: testPackage, expectedToMatch }) => {
          const result = defaultFilter('/fake/path', testPackage)
          
          if (expectedToMatch) {
            expect(result).not.toBeNull()
            expect(result?.name).toBe(testPackage.name)
            expect(result?.version).toBe(testPackage.version)
            
            // Handle different license field expectations
            if (testPackage.license) {
              expect(result?.license).toBe(testPackage.license)
              expect(result?.reason).toContain('license field contains NC keyword')
            } else if (testPackage.licenses && Array.isArray(testPackage.licenses)) {
              // For licenses array, the license field should contain the type from the array
              expect(result?.license).toBe(testPackage.licenses[0].type)
              expect(result?.reason).toContain('licenses array contains NC keyword')
            }
          } else {
            expect(result).toBeNull()
          }
        }
      )
    })

    describe('Commercial patterns', () => {
      it.each(commercialPatterns)(
        'should handle $description correctly',
        ({ description, package: testPackage, expectedToMatch }) => {
          const result = defaultFilter('/fake/path', testPackage)
          
          if (expectedToMatch) {
            expect(result).not.toBeNull()
          } else {
            expect(result).toBeNull()
          }
        }
      )
    })

    describe('Edge cases', () => {
      it.each(edgeCasePatterns)(
        'should handle $description correctly',
        ({ description, package: testPackage, expectedToMatch }) => {
          const result = defaultFilter('/fake/path', testPackage)
          
          if (expectedToMatch) {
            expect(result).not.toBeNull()
            expect(result?.reason).toContain('license field contains NC keyword')
          } else {
            expect(result).toBeNull()
          }
        }
      )
    })

    // Test for licenses array format
    it('should handle licenses array format', () => {
      const testPackage = {
        name: 'test-with-licenses-array',
        version: '1.0.0',
        licenses: [
          { type: 'CC-BY-NC-4.0' }
        ]
      };
      
      const result = defaultFilter('/fake/path', testPackage);
      expect(result).not.toBeNull(); // Now supports array format
      expect(result?.name).toBe('test-with-licenses-array');
      expect(result?.version).toBe('1.0.0');
      expect(result?.license).toBe('CC-BY-NC-4.0');
      expect(result?.reason).toContain('licenses array contains NC keyword');
    });
  });

  describe('SPDX Filter', () => {
    let spdxFilter: LicenseFilter;

    beforeEach(async () => {
      spdxFilter = await loadFilter('spdx-filter');
    });

    describe('SPDX non-commercial identifiers', () => {
      const spdxNonCommercialCases = [
        'CC-BY-NC-1.0',
        'CC-BY-NC-2.0', 
        'CC-BY-NC-2.5',
        'CC-BY-NC-3.0',
        'CC-BY-NC-4.0',
        'CC-BY-NC-SA-1.0',
        'CC-BY-NC-SA-2.0',
        'CC-BY-NC-SA-2.5', 
        'CC-BY-NC-SA-3.0',
        'CC-BY-NC-SA-4.0'
      ];

      spdxNonCommercialCases.forEach(license => {
        it(`should detect ${license}`, () => {
          const testPackage = {
            name: 'test-spdx',
            version: '1.0.0',
            license
          };
          
          const result = spdxFilter('/fake/path', testPackage);
          expect(result).not.toBeNull();
          expect(result?.license).toBe(license);
          expect(result?.reason).toContain('SPDX identifier is known to be non-commercial');
        });

        // Also test lowercase version
        it(`should detect ${license.toLowerCase()}`, () => {
          const testPackage = {
            name: 'test-spdx-lower',
            version: '1.0.0',
            license: license.toLowerCase()
          };
          
          const result = spdxFilter('/fake/path', testPackage);
          expect(result).not.toBeNull();
        });
      });
    });

    describe('Commercial SPDX identifiers', () => {
      const commercialSpdxCases = [
        'MIT',
        'Apache-2.0',
        'GPL-3.0',
        'CC-BY-4.0', // CC without NC restriction
        'BSD-3-Clause'
      ];

      commercialSpdxCases.forEach(license => {
        it(`should not detect ${license}`, () => {
          const testPackage = {
            name: 'test-commercial-spdx',
            version: '1.0.0',
            license
          };
          
          const result = spdxFilter('/fake/path', testPackage);
          expect(result).toBeNull();
        });
      });
    });

    it('should handle undefined license', () => {
      const testPackage = {
        name: 'test-undefined',
        version: '1.0.0'
      };
      
      const result = spdxFilter('/fake/path', testPackage);
      expect(result).toBeNull();
    });
  });

  describe('Filter comparison', () => {
    let defaultFilter: LicenseFilter;
    let spdxFilter: LicenseFilter;

    beforeEach(async () => {
      defaultFilter = await loadFilter('default-filter');
      spdxFilter = await loadFilter('spdx-filter');
    });

    it('should have different detection strengths', () => {
      // Case where SPDX filter detects
      const spdxCase = {
        name: 'test-spdx-specific',
        version: '1.0.0',
        license: 'CC-BY-NC-4.0'
      };

      const defaultResult = defaultFilter('/fake/path', spdxCase);
      const spdxResult = spdxFilter('/fake/path', spdxCase);

      expect(defaultResult).not.toBeNull(); // default filter also detects
      expect(spdxResult).not.toBeNull(); // spdx filter also detects

      // Case detected only by default filter
      const defaultOnlyCase = {
        name: 'test-default-only',
        version: '1.0.0',
        license: 'Creative Commons Non-Commercial License'
      };

      const defaultOnlyDefaultResult = defaultFilter('/fake/path', defaultOnlyCase);
      const defaultOnlySpdxResult = spdxFilter('/fake/path', defaultOnlyCase);

      expect(defaultOnlyDefaultResult).not.toBeNull(); // default detects
      expect(defaultOnlySpdxResult).toBeNull(); // spdx doesn't detect
    });
  });
});

describe('Pattern Coverage Analysis', () => {
  let defaultFilter: LicenseFilter;
  let spdxFilter: LicenseFilter;

  beforeEach(async () => {
    defaultFilter = await loadFilter('default-filter');
    spdxFilter = await loadFilter('spdx-filter');
  });

  it('should provide coverage statistics', () => {
    const allPatterns = [...nonCommercialPatterns, ...commercialPatterns, ...edgeCasePatterns];
    
    let defaultDetected = 0;
    let spdxDetected = 0;
    let bothDetected = 0;
    let neitherDetected = 0;

    allPatterns.forEach(({ package: testPackage, expectedToMatch }) => {
      const defaultResult = defaultFilter('/fake/path', testPackage);
      const spdxResult = spdxFilter('/fake/path', testPackage);
      
      const defaultMatch = defaultResult !== null;
      const spdxMatch = spdxResult !== null;

      if (defaultMatch && spdxMatch) {
        bothDetected++;
      } else if (defaultMatch) {
        defaultDetected++;
      } else if (spdxMatch) {
        spdxDetected++;
      } else {
        neitherDetected++;
      }
    });

    console.log('Filter Coverage Statistics:');
    console.log(`Total patterns tested: ${allPatterns.length}`);
    console.log(`Detected by both filters: ${bothDetected}`);
    console.log(`Detected by default filter only: ${defaultDetected}`);
    console.log(`Detected by SPDX filter only: ${spdxDetected}`);
    console.log(`Detected by neither: ${neitherDetected}`);

    // Basic validation
    expect(allPatterns.length).toBeGreaterThan(0);
    expect(bothDetected + defaultDetected + spdxDetected + neitherDetected).toBe(allPatterns.length);
  });
});
