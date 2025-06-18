#!/usr/bin/env node

/**
 * Test runner script for common license description patterns
 */

console.log('🧪 Common License Description Pattern Testing')
console.log('=====================================\n')

// Test pattern definitions
const testPatterns = [
  // Non-commercial licenses
  { name: 'CC-BY-NC-4.0', license: 'CC-BY-NC-4.0', expected: true },
  { name: 'CC-BY-NC-SA-3.0', license: 'CC-BY-NC-SA-3.0', expected: true },
  { name: 'NonCommercial License', license: 'Creative Commons NonCommercial 4.0', expected: true },
  { name: 'Non-commercial only', license: 'This software is for non-commercial use only', expected: true },
  { name: 'Academic use', license: 'For academic and research purposes only', expected: true },
  { name: 'Personal use only', license: 'Personal use only, commercial use prohibited', expected: true },
  
  // Commercial licenses
  { name: 'MIT License', license: 'MIT', expected: false },
  { name: 'Apache-2.0', license: 'Apache-2.0', expected: false },
  { name: 'GPL-3.0', license: 'GPL-3.0', expected: false },
  { name: 'BSD-3-Clause', license: 'BSD-3-Clause', expected: false },
  { name: 'CC-BY (no NC)', license: 'CC-BY-4.0', expected: false },
  
  // Edge cases
  { name: 'Empty license', license: '', expected: false },
  { name: 'Mixed case', license: 'cc-by-nc-4.0', expected: true },
  { name: 'With spaces', license: '  CC-BY-NC-4.0  ', expected: true },
  { name: 'Multiple licenses', license: 'MIT OR CC-BY-NC-4.0', expected: true },
  { name: 'Confusing text', license: 'GNU Inc. License', expected: false }, // 'nc' in 'Inc.' should not match
]

// Simple filter implementation
function detectNonCommercial(license) {
  if (!license) return false
  
  const lower = license.toLowerCase().trim()
  const ncKeywords = ['non-commercial', 'by-nc', 'cc-by-nc', 'noncommercial', 'academic', 'research purposes only', 'personal use only', 'evaluation purposes only']
  
  return ncKeywords.some(keyword => lower.includes(keyword))
}

// SPDX-specific filter
function detectSPDXNonCommercial(license) {
  if (!license) return false
  
  const spdxNonCommercial = [
    'CC-BY-NC-1.0', 'CC-BY-NC-2.0', 'CC-BY-NC-2.5', 'CC-BY-NC-3.0', 'CC-BY-NC-4.0',
    'CC-BY-NC-SA-1.0', 'CC-BY-NC-SA-2.0', 'CC-BY-NC-SA-2.5', 'CC-BY-NC-SA-3.0', 'CC-BY-NC-SA-4.0'
  ]
  
  return spdxNonCommercial.includes(license.toUpperCase())
}

// Run tests
console.log('📋 Test Results:\n')

let passed = 0
let failed = 0

testPatterns.forEach(({ name, license, expected }, index) => {
  const defaultResult = detectNonCommercial(license)
  const spdxResult = detectSPDXNonCommercial(license)
  const anyResult = defaultResult || spdxResult
  
  const success = anyResult === expected
  const status = success ? '✅' : '❌'
  const filterUsed = defaultResult && spdxResult ? '[Both]' : 
                    defaultResult ? '[Default]' : 
                    spdxResult ? '[SPDX]' : '[None]'
  
  console.log(`${status} ${filterUsed} ${name}`)
  console.log(`   License: "${license}"`)
  console.log(`   Expected: ${expected ? 'NC' : 'Commercial'}, Got: ${anyResult ? 'NC' : 'Commercial'}`)
  
  if (!success) {
    console.log(`   ⚠️  Test failed`)
    failed++
  } else {
    passed++
  }
  
  console.log('')
})

// Statistics
console.log('📊 Test Statistics:')
console.log(`   Passed: ${passed}`)
console.log(`   Failed: ${failed}`)
console.log(`   Success rate: ${((passed / testPatterns.length) * 100).toFixed(1)}%`)
console.log('')

// Recommendations
console.log('💡 Detection Pattern Analysis:')

const ncPatterns = testPatterns.filter(p => p.expected)
const commercialPatterns = testPatterns.filter(p => !p.expected)

let defaultNCDetected = 0
let spdxNCDetected = 0
let bothNCDetected = 0

ncPatterns.forEach(({ license }) => {
  const defaultResult = detectNonCommercial(license)
  const spdxResult = detectSPDXNonCommercial(license)
  
  if (defaultResult && spdxResult) {
    bothNCDetected++
  } else if (defaultResult) {
    defaultNCDetected++
  } else if (spdxResult) {
    spdxNCDetected++
  }
})

console.log(`   Non-commercial license detection (total ${ncPatterns.length} cases):`)
console.log(`     Both filters detected: ${bothNCDetected}`)
console.log(`     Default filter only: ${defaultNCDetected}`)
console.log(`     SPDX filter only: ${spdxNCDetected}`)
console.log('')

console.log('🔍 Filter Comparison:')
console.log('   Default filter: Keyword-based broad detection')
console.log('   SPDX filter: Specialized in standard SPDX identifiers')
console.log('')

if (failed === 0) {
  console.log('🎉 All tests passed!')
} else {
  console.log(`⚠️  ${failed} test(s) failed. Filter improvements may be needed.`)
}

process.exit(failed > 0 ? 1 : 0)
