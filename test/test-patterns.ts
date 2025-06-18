/**
 * Common license description patterns for testing
 */

export interface TestPackage {
  name: string;
  version: string;
  license?: string;
  licenses?: Array<{
    type: string;
    url?: string;
  }>;
  description?: string;
}

export interface TestPattern {
  name: string;
  description: string;
  licenseText: string;
  expectedResult: {
    hasNC: boolean;
    confidence: number;
    matchedTerms?: string[];
  };
}

// Non-commercial license patterns
export const nonCommercialPatterns: Array<{
  description: string;
  package: TestPackage;
  expectedToMatch: boolean;
}> = [
  // Basic CC BY-NC format
  {
    description: "CC BY-NC-4.0 SPDX identifier",
    package: {
      name: "test-package-1",
      version: "1.0.0",
      license: "CC-BY-NC-4.0"
    },
    expectedToMatch: true
  },
  {
    description: "CC BY-NC-SA-3.0 SPDX identifier",
    package: {
      name: "test-package-2",
      version: "1.0.0",
      license: "CC-BY-NC-SA-3.0"
    },
    expectedToMatch: true
  },
  
  // Lowercase patterns
  {
    description: "Lowercase cc-by-nc-4.0",
    package: {
      name: "test-package-3",
      version: "1.0.0",
      license: "cc-by-nc-4.0"
    },
    expectedToMatch: true
  },
  
  // Text description patterns
  {
    description: "Full text with non-commercial",
    package: {
      name: "test-package-4",
      version: "1.0.0",
      license: "Creative Commons Attribution-NonCommercial 4.0 International"
    },
    expectedToMatch: true
  },
  {
    description: "License with by-nc keyword",
    package: {
      name: "test-package-5",
      version: "1.0.0",
      license: "Some License (BY-NC)"
    },
    expectedToMatch: true
  },
  
  // URL format
  {
    description: "URL containing non-commercial",
    package: {
      name: "test-package-6",
      version: "1.0.0",
      license: "https://creativecommons.org/licenses/by-nc/4.0/"
    },
    expectedToMatch: true
  },
  
  // Licenses array format
  {
    description: "Licenses array with CC-BY-NC",
    package: {
      name: "test-package-7",
      version: "1.0.0",
      licenses: [
        {
          type: "CC-BY-NC-4.0",
          url: "https://creativecommons.org/licenses/by-nc/4.0/"
        }
      ]
    },
    expectedToMatch: true
  },
  
  // Old npm license description
  {
    description: "Old npm license format",
    package: {
      name: "test-package-8",
      version: "1.0.0",
      license: "Creative Commons BY-NC 3.0"
    },
    expectedToMatch: true
  }
];

// Commercial license patterns
export const commercialPatterns: Array<{
  description: string;
  package: TestPackage;
  expectedToMatch: boolean;
}> = [
  // Common commercial licenses
  {
    description: "MIT License",
    package: {
      name: "test-package-mit",
      version: "1.0.0",
      license: "MIT"
    },
    expectedToMatch: false
  },
  {
    description: "Apache-2.0 License",
    package: {
      name: "test-package-apache",
      version: "1.0.0",
      license: "Apache-2.0"
    },
    expectedToMatch: false
  },
  {
    description: "ISC License",
    package: {
      name: "test-package-isc",
      version: "1.0.0",
      license: "ISC"
    },
    expectedToMatch: false
  },
  {
    description: "BSD-3-Clause License",
    package: {
      name: "test-package-bsd",
      version: "1.0.0",
      license: "BSD-3-Clause"
    },
    expectedToMatch: false
  },
  
  // CC BY (no NC restriction)
  {
    description: "CC BY-4.0 (no NC restriction)",
    package: {
      name: "test-package-cc-by",
      version: "1.0.0",
      license: "CC-BY-4.0"
    },
    expectedToMatch: false
  },
  
  // GPL family
  {
    description: "GPL-3.0 License",
    package: {
      name: "test-package-gpl",
      version: "1.0.0",
      license: "GPL-3.0"
    },
    expectedToMatch: false
  },
  
  // License not specified
  {
    description: "No license specified",
    package: {
      name: "test-package-no-license",
      version: "1.0.0"
    },
    expectedToMatch: false
  },
  
  // Private license
  {
    description: "Proprietary license",
    package: {
      name: "test-package-proprietary",
      version: "1.0.0",
      license: "UNLICENSED"
    },
    expectedToMatch: false
  }
];

// Edge case patterns
export const edgeCasePatterns: Array<{
  description: string;
  package: TestPackage;
  expectedToMatch: boolean;
}> = [
  // Empty string
  {
    description: "Empty license string",
    package: {
      name: "test-package-empty",
      version: "1.0.0",
      license: ""
    },
    expectedToMatch: false
  },
  
  // Multiple licenses (OR condition)
  {
    description: "Multiple licenses with OR",
    package: {
      name: "test-package-multi-or",
      version: "1.0.0",
      license: "MIT OR CC-BY-NC-4.0"
    },
    expectedToMatch: true
  },
  
  // Multiple licenses (AND condition)
  {
    description: "Multiple licenses with AND",
    package: {
      name: "test-package-multi-and", 
      version: "1.0.0",
      license: "MIT AND CC-BY-NC-4.0"
    },
    expectedToMatch: true
  },
  
  // Confusing license name
  {
    description: "Confusing license name with 'nc' but not non-commercial",
    package: {
      name: "test-package-confusing",
      version: "1.0.0",
      license: "GNU General Public License v3.0 (Inc.)"
    },
    expectedToMatch: false // Should not match - 'nc' is part of 'Inc.'
  },
  
  // Mixed case
  {
    description: "Mixed case license",
    package: {
      name: "test-package-mixed-case",
      version: "1.0.0",
      license: "Cc-By-Nc-4.0"
    },
    expectedToMatch: true
  },
  
  // Extra whitespace
  {
    description: "License with extra whitespace",
    package: {
      name: "test-package-whitespace",
      version: "1.0.0",
      license: "  CC-BY-NC-4.0  "
    },
    expectedToMatch: true
  }
];

// All patterns combined
export const allPatterns = [
  ...nonCommercialPatterns,
  ...commercialPatterns,
  ...edgeCasePatterns
];
