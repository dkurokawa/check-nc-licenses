#!/usr/bin/env node

/**
 * Script to run test patterns and display results
 */

const path = require('path');
const { 
  nonCommercialPatterns, 
  commercialPatterns, 
  edgeCasePatterns 
} = require('./test/test-patterns');

// Load filters
function loadFilter(filterName) {
  const filterPath = path.resolve(__dirname, '../dist/filters', `${filterName}.js`);
  delete require.cache[require.resolve(filterPath)];
  const module = require(filterPath);
  return module.default;
}

function runTestPatterns() {
  console.log('🧪 Running Common License Pattern Tests\n');

  const defaultFilter = loadFilter('default-filter');
  const spdxFilter = loadFilter('spdx-filter');

  const allPatterns = [
    ...nonCommercialPatterns,
    ...commercialPatterns,
    ...edgeCasePatterns
  ];

  let stats = {
    total: allPatterns.length,
    defaultDetected: 0,
    spdxDetected: 0,
    bothDetected: 0,
    neitherDetected: 0,
    expectedMatches: 0,
    actualMatches: 0
  };

  console.log('📋 Test Results by Pattern:\n');

  allPatterns.forEach(({ description, package: testPackage, expectedToMatch }, index) => {
    const defaultResult = defaultFilter('/fake/path', testPackage);
    const spdxResult = spdxFilter('/fake/path', testPackage);
    
    const defaultMatch = defaultResult !== null;
    const spdxMatch = spdxResult !== null;
    const anyMatch = defaultMatch || spdxMatch;

    // Update statistics
    if (expectedToMatch) stats.expectedMatches++;
    if (anyMatch) stats.actualMatches++;

    if (defaultMatch && spdxMatch) {
      stats.bothDetected++;
    } else if (defaultMatch) {
      stats.defaultDetected++;
    } else if (spdxMatch) {
      stats.spdxDetected++;
    } else {
      stats.neitherDetected++;
    }

    // Display results
    const status = expectedToMatch === anyMatch ? '✅' : '❌';
    const filterInfo = defaultMatch && spdxMatch ? '[Both]' :
                      defaultMatch ? '[Default]' :
                      spdxMatch ? '[SPDX]' : '[None]';
    
    console.log(`${status} ${filterInfo} ${description}`);
    console.log(`   Package: ${testPackage.name}@${testPackage.version}`);
    console.log(`   License: ${testPackage.license || 'undefined'}`);
    
    if (anyMatch) {
      const result = defaultResult || spdxResult;
      console.log(`   Reason: ${result.reason}`);
    }
    
    if (expectedToMatch !== anyMatch) {
      console.log(`   ⚠️  Expected: ${expectedToMatch ? 'Match' : 'No match'}, Got: ${anyMatch ? 'Match' : 'No match'}`);
    }
    
    console.log('');
  });

  // Statistical summary
  console.log('📊 Statistical Summary:');
  console.log(`   Total patterns: ${stats.total}`);
  console.log(`   Expected matches: ${stats.expectedMatches}`);
  console.log(`   Actual matches: ${stats.actualMatches}`);
  console.log(`   Accuracy: ${((stats.actualMatches / Math.max(stats.expectedMatches, 1)) * 100).toFixed(1)}%`);
  console.log('');
  console.log('🔍 Detection by filter:');
  console.log(`   Both filters detected: ${stats.bothDetected}`);
  console.log(`   Default filter only: ${stats.defaultDetected}`);
  console.log(`   SPDX filter only: ${stats.spdxDetected}`);
  console.log(`   Neither detected: ${stats.neitherDetected}`);
  console.log('');

  // Recommendations
  console.log('💡 Recommendations:');
  if (stats.defaultDetected > stats.spdxDetected) {
    console.log('   - Default filter detects more patterns');
    console.log('   - Effective for handling various license descriptions');
  }
  if (stats.spdxDetected > 0) {
    console.log('   - SPDX filter specializes in accurate SPDX identifier detection');
    console.log('   - Useful when targeting only standard license identifiers');
  }
  if (stats.bothDetected > 0) {
    console.log('   - Combining both filters can expand detection coverage');
  }
}

// Main execution
if (require.main === module) {
  runTestPatterns();
}

module.exports = { runTestPatterns };
