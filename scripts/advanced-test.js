#!/usr/bin/env node

/**
 * Advanced license description pattern testing
 */

console.log('🔬 Advanced Pattern Analysis Test')
console.log('=========================\n')

// More complex test patterns
const advancedPatterns = [
  // Real-world examples
  {
    category: 'Real CC Licenses',
    patterns: [
      { text: 'Creative Commons Attribution-NonCommercial 4.0 International License', expected: true, confidence: 0.95 },
      { text: 'CC BY-NC-SA 3.0', expected: true, confidence: 0.9 },
      { text: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0', expected: true, confidence: 0.95 },
      { text: 'https://creativecommons.org/licenses/by-nc/4.0/', expected: true, confidence: 0.8 }
    ]
  },
  
  // Academic/Research licenses
  {
    category: 'Academic Licenses',
    patterns: [
      { text: 'Academic Free License', expected: false, confidence: 0.3 }, // Actually allows commercial use
      { text: 'For academic and research use only', expected: true, confidence: 0.85 },
      { text: 'Educational purposes only', expected: true, confidence: 0.8 },
      { text: 'Non-profit use only', expected: true, confidence: 0.9 }
    ]
  },
  
  // Commercial restriction patterns
  {
    category: 'Commercial Restrictions',
    patterns: [
      { text: 'Commercial use prohibited', expected: true, confidence: 0.95 },
      { text: 'Not for commercial use', expected: true, confidence: 0.9 },
      { text: 'Personal use only', expected: true, confidence: 0.85 },
      { text: 'Internal use only', expected: true, confidence: 0.7 },
      { text: 'Evaluation purposes only', expected: true, confidence: 0.8 }
    ]
  },
  
  // Dual licensing
  {
    category: 'Dual Licensing',
    patterns: [
      { text: 'GPL for open source, commercial license available', expected: false, confidence: 0.1 },
      { text: 'Free for non-commercial use, commercial license required', expected: true, confidence: 0.9 },
      { text: 'MIT OR CC-BY-NC-4.0', expected: true, confidence: 0.7 }, // OR provides commercial option
      { text: 'GPL-3.0 AND CC-BY-NC-4.0', expected: true, confidence: 0.8 } // AND applies both restrictions
    ]
  },
  
  // Tricky cases
  {
    category: 'Tricky Cases',
    patterns: [
      { text: 'Inc. Software License', expected: false, confidence: 0.1 }, // Contains 'nc' but not non-commercial
      { text: 'Commercial Support Available', expected: false, confidence: 0.0 },
      { text: 'Includes commercial warranty', expected: false, confidence: 0.0 },
      { text: 'See LICENSE.nc file', expected: true, confidence: 0.6 } // .nc in filename
    ]
  },
  
  // International
  {
    category: 'International',
    patterns: [
      { text: 'For non-profit use only', expected: true, confidence: 0.8 },
      { text: 'Usage non commercial uniquement', expected: true, confidence: 0.7 },
      { text: 'Nur für nicht-kommerzielle Nutzung', expected: true, confidence: 0.7 },
      { text: 'Solo uso no comercial', expected: true, confidence: 0.7 }
    ]
  }
]

// Advanced detection function
function advancedDetectNc(text) {
  if (!text) return { detected: false, confidence: 0, reasons: [] }
  
  const lower = text.toLowerCase().trim()
  const reasons = []
  let confidence = 0
  
  // Clear non-commercial keywords
  const strongNcKeywords = [
    'non-commercial', 'noncommercial', 'by-nc', 'cc-by-nc',
    'commercial use prohibited', 'not for commercial use',
    'personal use only', 'academic use only', 'research use only',
    'evaluation purposes only', 'non-profit use only'
  ]
  
  // Weak non-commercial indicators
  const weakNcKeywords = [
    'academic', 'research purposes', 'educational purposes',
    'internal use', 'evaluation purposes'
  ]
  
  // Exclusion keywords (to prevent false positives)
  const excludeKeywords = [
    'commercial support', 'commercial warranty', 'commercial license available',
    'academic free license'
  ]
  
  // International patterns
  const internationalNc = [
    'non-profit', 'profit-prohibited', 'non commercial', 'nicht-kommerzielle', 'no comercial'
  ]
  
  // Exclusion check
  for (const exclude of excludeKeywords) {
    if (lower.includes(exclude)) {
      return { detected: false, confidence: 0, reasons: [`Excluded by: ${exclude}`] }
    }
  }
  
  // Strong keyword check
  for (const keyword of strongNcKeywords) {
    if (lower.includes(keyword)) {
      confidence = Math.max(confidence, 0.9)
      reasons.push(`Strong NC keyword: ${keyword}`)
    }
  }
  
  // Weak keyword check
  for (const keyword of weakNcKeywords) {
    if (lower.includes(keyword)) {
      confidence = Math.max(confidence, 0.6)
      reasons.push(`Weak NC indicator: ${keyword}`)
    }
  }
  
  // International patterns
  for (const keyword of internationalNc) {
    if (lower.includes(keyword)) {
      confidence = Math.max(confidence, 0.8)
      reasons.push(`International NC pattern: ${keyword}`)
    }
  }
  
  // SPDX check
  const spdxNc = [
    'cc-by-nc-1.0', 'cc-by-nc-2.0', 'cc-by-nc-2.5', 'cc-by-nc-3.0', 'cc-by-nc-4.0',
    'cc-by-nc-sa-1.0', 'cc-by-nc-sa-2.0', 'cc-by-nc-sa-2.5', 'cc-by-nc-sa-3.0', 'cc-by-nc-sa-4.0'
  ]
  
  for (const spdx of spdxNc) {
    if (lower.includes(spdx)) {
      confidence = Math.max(confidence, 0.95)
      reasons.push(`SPDX NC identifier: ${spdx}`)
    }
  }
  
  // Compound license handling
  if (lower.includes(' or ')) {
    // For OR conditions, check if commercial options are available
    const parts = lower.split(' or ')
    const hasCommercialOption = parts.some(part => {
      const commercialLicenses = ['mit', 'apache', 'bsd', 'gpl', 'cc-by']
      return commercialLicenses.some(cl => part.trim().includes(cl) && !part.includes('nc'))
    })
    
    if (hasCommercialOption) {
      confidence *= 0.5 // Reduce confidence if commercial options are available
      reasons.push('OR condition with commercial option available')
    }
  }
  
  const detected = confidence > 0.5
  
  return { detected, confidence, reasons }
}

// Run tests
let totalTests = 0
let passedTests = 0
let categoryResults = []

advancedPatterns.forEach(({ category, patterns }) => {
  console.log(`📁 ${category}`)
  console.log('─'.repeat(category.length + 3))
  
  const categoryStats = { passed: 0, failed: 0, patterns: [] }
  
  patterns.forEach(({ text, expected, confidence: expectedConfidence }) => {
    const result = advancedDetectNc(text)
    const success = result.detected === expected
    const status = success ? '✅' : '❌'
    
    totalTests++
    if (success) {
      passedTests++
      categoryStats.passed++
    } else {
      categoryStats.failed++
    }
    
    console.log(`${status} ${text}`)
    console.log(`   Expected: ${expected ? 'NC' : 'Commercial'} (conf: ${expectedConfidence})`)
    console.log(`   Detected: ${result.detected ? 'NC' : 'Commercial'} (conf: ${result.confidence.toFixed(2)})`)
    
    if (result.reasons.length > 0) {
      console.log(`   Reasons: ${result.reasons.join(', ')}`)
    }
    
    if (!success) {
      console.log(`   ❌ Test failed`)
    }
    
    console.log('')
    
    categoryStats.patterns.push({
      text, expected, result, success, expectedConfidence
    })
  })
  
  categoryResults.push({ category, stats: categoryStats })
  console.log(`${category} Results: ${categoryStats.passed}/${categoryStats.passed + categoryStats.failed} passed\n`)
})

// Overall statistics
console.log('📊 Overall Results')
console.log('===========')
console.log(`Overall success rate: ${passedTests}/${totalTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`)
console.log('')

// Category-wise statistics
console.log('📈 Success Rate by Category:')
categoryResults.forEach(({ category, stats }) => {
  const rate = ((stats.passed / (stats.passed + stats.failed)) * 100).toFixed(1)
  console.log(`   ${category}: ${rate}%`)
})
console.log('')

// Detection accuracy analysis
const detectedAsNc = categoryResults.flatMap(c => c.stats.patterns)
  .filter(p => p.result.detected)

const truePositives = detectedAsNc.filter(p => p.expected).length
const falsePositives = detectedAsNc.filter(p => !p.expected).length
const precision = truePositives / (truePositives + falsePositives)

const actualNc = categoryResults.flatMap(c => c.stats.patterns)
  .filter(p => p.expected)

const recall = truePositives / actualNc.length

console.log('🎯 Detection Accuracy Analysis:')
console.log(`   Precision: ${(precision * 100).toFixed(1)}%`)
console.log(`   Recall: ${(recall * 100).toFixed(1)}%`)
console.log(`   F1 Score: ${(2 * precision * recall / (precision + recall) * 100).toFixed(1)}%`)
console.log('')

// Improvement suggestions
console.log('💡 Improvement Suggestions:')
const failedPatterns = categoryResults.flatMap(c => c.stats.patterns)
  .filter(p => !p.success)

if (falsePositives > 0) {
  console.log(`   - ${falsePositives} false positives detected. Consider adding exclusion keywords.`)
}

const missedNc = actualNc.length - truePositives
if (missedNc > 0) {
  console.log(`   - ${missedNc} non-commercial licenses missed. Consider expanding detection keywords.`)
}

console.log('')

if (passedTests === totalTests) {
  console.log('🎉 All tests passed!')
} else {
  console.log(`⚠️  ${totalTests - passedTests} test(s) failed.`)
}

process.exit(passedTests === totalTests ? 0 : 1)
