import { LicenseFilter, LicenseMatchResult } from '../types/filter.js';

// Word-boundary patterns for non-commercial license markers.
//
// A previous version matched the bare substring "nc", which produced false
// positives on any license text that merely contained those two letters
// (e.g. "Company Inc", "scancode"). Matching whole words instead removes
// that class of bug and eliminates the need for the previous "inc."
// special case.
const NC_PATTERNS: RegExp[] = [
  // non-commercial / noncommercial / non commercial
  /\bnon[-\s]?commercial\b/,
  // by-nc, cc-by-nc, attribution-noncommercial (SPDX-style, hyphen-delimited)
  /(?:^|[^a-z0-9])by-nc(?:[^a-z0-9]|$)/,
  /(?:^|[^a-z0-9])cc-by-nc(?:[^a-z0-9]|$)/,
];

function matchesNC(license: string): boolean {
  const normalized = license.toLowerCase();
  return NC_PATTERNS.some((re) => re.test(normalized));
}

const filter: LicenseFilter = (pkgPath, pkgJson) => {
  // Check license field
  const license = pkgJson.license || '';
  if (matchesNC(license)) {
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
        if (matchesNC(licenseObj.type)) {
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
