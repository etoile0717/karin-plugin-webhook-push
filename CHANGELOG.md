# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]
### Added
- Config normalization with migration defaults.
- Rule priority and stop-on-match routing.
- Optional IP allowlist security check.
- Adapter-based payload summary hook.
- Registry fallback install scripts.

### Changed
- Config path resolution now uses plugin package metadata.
- Validation tightened for auth tokens, bot self ID, regex rules, and unique rule IDs.
- README expanded with install, config, curl examples, and security guidance.

### Fixed
- Config path resolution now targets the plugin directory reliably.

## [0.1.0] - 2024-xx-xx
### Added
- Initial webhook receiver with rule-based QQ push.
