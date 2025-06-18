import { LicenseFilter, LicenseMatchResult } from '../types/filter.js';

const NON_COMMERCIAL_SPDX = [
  'CC-BY-NC-1.0', 'CC-BY-NC-2.0', 'CC-BY-NC-2.5', 'CC-BY-NC-3.0', 'CC-BY-NC-4.0',
  'CC-BY-NC-SA-1.0', 'CC-BY-NC-SA-2.0', 'CC-BY-NC-SA-2.5', 'CC-BY-NC-SA-3.0', 'CC-BY-NC-SA-4.0'
];

const filter: LicenseFilter = (pkgPath, pkgJson) => {
  const lic = (pkgJson.license || '').toUpperCase();
  if (NON_COMMERCIAL_SPDX.includes(lic)) {
    return {
      name: pkgJson.name,
      version: pkgJson.version,
      license: pkgJson.license,
      reason: 'SPDX identifier is known to be non-commercial',
    };
  }
  return null;
};

export default filter;
