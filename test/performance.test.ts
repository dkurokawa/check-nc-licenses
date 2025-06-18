import { describe, it, expect, beforeAll } from 'vitest'
import { performance } from 'perf_hooks'
import path from 'path'
import { fileURLToPath } from 'url'
import { LicenseFilter } from '../src/types/filter.js'
import { allPatterns } from './test-patterns.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load filters
async function loadFilter(filterName: string): Promise<LicenseFilter> {
  const filterPath = path.resolve(__dirname, '../src/filters', `${filterName}.js`)
  const module = await import(filterPath)
  return module.default
}

describe('Performance Tests', () => {
  let defaultFilter: LicenseFilter
  let spdxFilter: LicenseFilter

  beforeAll(async () => {
    defaultFilter = await loadFilter('default-filter')
    spdxFilter = await loadFilter('spdx-filter')
  })

  describe('Filter Performance', () => {
    it('should benchmark default filter performance', () => {
      const iterations = 10000;
      const testPackage = {
        name: 'benchmark-test',
        version: '1.0.0',
        license: 'CC-BY-NC-4.0'
      };

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        defaultFilter('/fake/path', testPackage);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTime = duration / iterations;

      console.log(`Default filter performance:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time per call: ${avgTime.toFixed(4)}ms`);
      console.log(`  Calls per second: ${(1000 / avgTime).toFixed(0)}`);

      // Performance test (ensure single execution takes less than 1ms)
      expect(avgTime).toBeLessThan(1);
    });

    it('should benchmark SPDX filter performance', () => {
      const iterations = 10000;
      const testPackage = {
        name: 'benchmark-test',
        version: '1.0.0',
        license: 'CC-BY-NC-4.0'
      };

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        spdxFilter('/fake/path', testPackage);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTime = duration / iterations;

      console.log(`SPDX filter performance:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time per call: ${avgTime.toFixed(4)}ms`);
      console.log(`  Calls per second: ${(1000 / avgTime).toFixed(0)}`);

      expect(avgTime).toBeLessThan(1);
    });

    it('should compare filter performance', () => {
      const iterations = 5000;
      const testPackages = allPatterns.slice(0, 10).map(p => p.package);

      // Default filter benchmark
      const defaultStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        testPackages.forEach(pkg => defaultFilter('/fake/path', pkg));
      }
      const defaultEndTime = performance.now();
      const defaultDuration = defaultEndTime - defaultStartTime;

      // SPDX filter benchmark
      const spdxStartTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        testPackages.forEach(pkg => spdxFilter('/fake/path', pkg));
      }
      const spdxEndTime = performance.now();
      const spdxDuration = spdxEndTime - spdxStartTime;

      console.log(`Performance comparison (${iterations} iterations, ${testPackages.length} packages each):`);
      console.log(`  Default filter: ${defaultDuration.toFixed(2)}ms`);
      console.log(`  SPDX filter: ${spdxDuration.toFixed(2)}ms`);
      console.log(`  Ratio: ${(defaultDuration / spdxDuration).toFixed(2)}x`);

      // Ensure both are sufficiently fast
      expect(defaultDuration).toBeLessThan(1000);
      expect(spdxDuration).toBeLessThan(1000);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', () => {
      const iterations = 1000;
      const testPackage = {
        name: 'memory-test',
        version: '1.0.0',
        license: 'CC-BY-NC-4.0'
      };

      // Initial memory usage
      const initialMemory = process.memoryUsage();
      
      // Bulk execution
      for (let i = 0; i < iterations; i++) {
        defaultFilter('/fake/path', testPackage);
        spdxFilter('/fake/path', testPackage);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`Memory usage test (${iterations} iterations):`);
      console.log(`  Initial heap: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Final heap: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      // Ensure no memory leaks (increase within reasonable range)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });
});

describe('Pattern Analysis', () => {
  let defaultFilter: LicenseFilter;
  let spdxFilter: LicenseFilter;

  beforeAll(async () => {
    defaultFilter = await loadFilter('default-filter');
    spdxFilter = await loadFilter('spdx-filter');
  });

  it('should analyze detection patterns', () => {
    const results = {
      nonCommercialCorrect: 0,
      nonCommercialMissed: 0,
      commercialCorrect: 0,
      commercialFalsePositive: 0,
      edgeCasesHandled: 0,
      edgeCasesProblematic: 0
    };

    allPatterns.forEach(({ description, package: testPackage, expectedToMatch }) => {
      const defaultResult = defaultFilter('/fake/path', testPackage);
      const spdxResult = spdxFilter('/fake/path', testPackage);
      
      // If any filter detected
      const detected = defaultResult !== null || spdxResult !== null;

      if (description.includes('Non-commercial') || description.includes('CC BY-NC')) {
        if (detected && expectedToMatch) {
          results.nonCommercialCorrect++;
        } else if (!detected && expectedToMatch) {
          results.nonCommercialMissed++;
          console.warn(`Missed non-commercial license: ${description}`);
        }
      } else if (description.includes('commercial') || description.includes('MIT') || 
                 description.includes('Apache') || description.includes('GPL')) {
        if (!detected && !expectedToMatch) {
          results.commercialCorrect++;
        } else if (detected && !expectedToMatch) {
          results.commercialFalsePositive++;
          console.warn(`False positive for commercial license: ${description}`);
        }
      } else {
        // Edge cases
        if ((detected && expectedToMatch) || (!detected && !expectedToMatch)) {
          results.edgeCasesHandled++;
        } else {
          results.edgeCasesProblematic++;
          console.warn(`Edge case issue: ${description} - expected: ${expectedToMatch}, got: ${detected}`);
        }
      }
    });

    console.log('Detection Analysis Results:');
    console.log(`  Non-commercial licenses correctly detected: ${results.nonCommercialCorrect}`);
    console.log(`  Non-commercial licenses missed: ${results.nonCommercialMissed}`);
    console.log(`  Commercial licenses correctly ignored: ${results.commercialCorrect}`);
    console.log(`  Commercial licenses false positives: ${results.commercialFalsePositive}`);
    console.log(`  Edge cases handled correctly: ${results.edgeCasesHandled}`);
    console.log(`  Edge cases problematic: ${results.edgeCasesProblematic}`);

    // Basic quality metrics
    const totalNonCommercial = results.nonCommercialCorrect + results.nonCommercialMissed;
    const totalCommercial = results.commercialCorrect + results.commercialFalsePositive;
    
    if (totalNonCommercial > 0) {
      const ncDetectionRate = (results.nonCommercialCorrect / totalNonCommercial) * 100;
      console.log(`  Non-commercial detection rate: ${ncDetectionRate.toFixed(1)}%`);
      expect(ncDetectionRate).toBeGreaterThan(80); // Expect detection rate over 80%
    }

    if (totalCommercial > 0) {
      const commercialAccuracy = (results.commercialCorrect / totalCommercial) * 100;
      console.log(`  Commercial license accuracy: ${commercialAccuracy.toFixed(1)}%`);
      expect(commercialAccuracy).toBeGreaterThan(90); // Expect accuracy over 90%
    }
  });
});
