import { LicenseFilter, LicenseMatchResult } from '../types/filter.js';

const NC_KEYWORDS = [
  'non-commercial', 
  'noncommercial',
  'by-nc', 
  'cc-by-nc',
  'attribution-noncommercial',
  'nc'
];

const filter: LicenseFilter = (pkgPath, pkgJson) => {
  // Check license field
  const license = (pkgJson.license || '').toLowerCase();
  if (NC_KEYWORDS.some(k => license.includes(k))) {
    // Avoid false positives for patterns like "Inc." in license names
    // Check if the license contains "inc." to avoid matching "nc" in "Inc."
    if (license.includes('inc.')) {
      // Check if any matched keyword is just "nc"
      const matchedKeywords = NC_KEYWORDS.filter(k => license.includes(k));
      // If only "nc" matches and "inc." is present, skip
      if (matchedKeywords.length === 1 && matchedKeywords[0] === 'nc') {
        return null;
      }
    }
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      license: pkgJson.license,
      reason: 'license field contains NC keyword',
    };
  }

  // Check licenses array format
  if (Array.isArray(pkgJson.licenses)) {
    for (const licenseObj of pkgJson.licenses) {
      if (licenseObj && typeof licenseObj === 'object' && licenseObj.type) {
        const licenseType = licenseObj.type.toLowerCase();
        if (NC_KEYWORDS.some(k => licenseType.includes(k))) {
          return {
            name: pkgJson.name,
            version: pkgJson.version,
            license: licenseObj.type,
            reason: 'licenses array contains NC keyword',
          };
        }
      }
    }
  }

  return null;
};

export default filter;
