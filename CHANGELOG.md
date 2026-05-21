# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Revvel-standards ship-to-market documentation set:
  - `DEPLOYMENT_GUIDE.md`
  - `GO_TO_MARKET.md`
  - `BRAND_GUIDELINES.md`
- Automation validation script: `validate.py`
- GitHub Actions CI workflow at `.github/workflows/ci.yml`

### Fixed
- Frontend TypeScript build break from deprecated `baseUrl` warning by adding `ignoreDeprecations`.
- Backend dependency conflict between `pytest` and `pytest-asyncio`.
- Backend API tests now mock startup DB initialization so CI can run endpoint checks without a live database.
