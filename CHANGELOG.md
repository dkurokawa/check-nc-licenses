# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0]

### Fixed
- **Over-detection of `nc`**: the default filter matched the bare substring
  `nc`, so licenses such as `Company Inc` or names like `scancode` were flagged
  as non-commercial and could fail a consumer's build. Detection is now
  word-boundary based, and the previous `inc.` special case was removed.
- **A single malformed `package.json` no longer aborts the whole scan**: it is
  skipped with a warning and the scan continues.
- **`--version` / `--help` now read the version from `package.json`** instead of
  a hard-coded string, so they can no longer drift.

### Changed
- Removed the `postinstall`, `prebuild`, and `pretest` scripts that ran
  `node dist/index.js` against this repo itself. They broke a clean build
  (`dist` does not exist yet on a fresh checkout) and made `npm install` /
  `npm ci` fail.
- Updated the release workflow to a maintained GitHub Release action and
  removed the external `ppn-page` notification coupling.

### Added
- CI workflow (build + tests on Node 18/20/22).
