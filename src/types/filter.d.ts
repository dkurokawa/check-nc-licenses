export interface LicenseMatchResult {
  name: string;
  version: string;
  license: string;
  reason: string;
}

export interface LicenseFilter {
  (pkgPath: string, pkgJson: any): LicenseMatchResult | null;
}
