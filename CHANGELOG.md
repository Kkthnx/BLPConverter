# Changelog

All notable changes to BLP Converter are documented in this file.

## [1.1.2] - 2026-06-23

### Fixed
- **BLPView thumbnails (Windows)** — Detect broken legacy machine-wide BLPView registrations that block Explorer thumbnails.
- **BLPView install (Windows)** — Install the thumbnail DLL beside the app executable for more reliable Explorer loading.
- **BLPView install (Windows)** — Register full `SystemFileAssociations\.blp` metadata (`PerceivedType`, `Content Type`, `Application`).
- **BLPView restart (Windows)** — Clear additional Explorer icon/thumbnail cache files and notify shell image updates.
- **BLPView thumbnail provider** — Default thumbnail size when Explorer passes `cx = 0`.

## [1.1.1] - 2026-06-23

### Fixed
- **BLPView thumbnails (Windows)** — Enable `DisableProcessIsolation` in release installs so Explorer can load the thumbnail handler reliably.
- **BLPView thumbnails (Windows)** — Register the handler under `Explorer\FileExts\.blp\ShellEx` for Windows 10/11 compatibility.
- **BLPView thumbnails (Windows)** — Clear Explorer thumbnail cache when restarting Explorer from Settings.
- **BLPView status (Windows)** — Detect incomplete installs (missing DLL, approval list, or isolation flag) and prompt reinstall.
- **Release CI (Windows)** — Fix intermittent `build.rs` file-lock error when bundling `blpview_thumb.dll`.

### Changed
- **BLPView (Linux/macOS)** — Show the Settings section greyed out with a translated explanation instead of hiding it.

## [1.1.0] - 2026-06-23

### Added
- Cross-platform builds for Windows, Linux, and macOS via GitHub Actions.
- i18n for 8 languages (en, de, fr, es, pt-BR, ru, zh-CN, ko).
- DXT3 compression option and improved alpha-aware BLP encoding.
- Persisted conversion settings (compression, mipmaps, output folder).
- BLPView Windows Explorer thumbnail shell extension.

### Fixed
- Cross-platform path handling in conversion unit tests.
- Custom output folder filename collisions when batch converting.
- BLPView BGRA/alpha handling, registry cleanup, and uninstall behavior.

## [1.0.0] - 2026-06-23

### Added
- Initial release: BLP ↔ PNG conversion with drag-and-drop UI.

[1.1.2]: https://github.com/Kkthnx/BLPConverter/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/Kkthnx/BLPConverter/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Kkthnx/BLPConverter/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Kkthnx/BLPConverter/releases/tag/v1.0.0
