# Changelog

All notable changes to BLP Converter are documented in this file.

## [1.3.0] - 2026-11-22

### Fixed
- Drops now land on the correct panel when Windows display scaling is above 100%.
- Changing the language no longer leaves a second drop listener behind that logged a false "already converting" error.
- With a custom output folder, files that map to the same output name no longer overwrite each other. Later ones get a `_2`, `_3` suffix.
- Fully opaque 16-bit PNGs are no longer encoded as if they had transparency.
- The drop panels no longer clip at the default window size or overflow at the minimum width. The default window is now 570x400 and the minimum height 360.
- **BLPView (Windows)**, thumbnails now work when Explorer runs elevated, such as on the built-in Administrator account or with UAC off. Windows ignores per-user COM classes for those processes, so install also registers the handler per-machine when it has admin rights, and uninstall removes it again.
- **BLPView (Windows)**, uninstall removes only the values it added under `.blp` and keeps the user's own file associations.
- **BLPView (Windows)**, reinstalling the same build no longer fails while Explorer has the thumbnail DLL loaded.

### Added
- A Browse button on each panel as an alternative to drag and drop.
- **BLPView (Windows)**, a confirmation before Explorer is restarted, since that closes open Explorer windows.

### Changed
- **BLPView (Windows)**, thumbnails decode the smallest stored mip level that covers the requested size instead of the full image.
- Accessibility. Text is 12px or larger, all text meets 4.5:1 contrast, control edges meet 3:1, and click targets are at least 24px. Focus stays visible in Windows contrast themes, the converting animation respects reduced motion, and the active drop zone changes from dashed to solid so it does not rely on color alone. The settings drawer closes with Escape and returns focus to the gear button.

## [1.2.1] - 2026-08-29

### Fixed
- **BLPView (Windows)**, Restart Explorer now clears the thumbnail cache after Explorer is down, so refreshing thumbnails actually takes effect. It was clearing while Explorer still held the cache files open.

### Changed
- **BLPView (Windows)**, the thumbnail provider now catches panics at the COM boundary and returns an error instead of unwinding, so a malformed .blp cannot take down Explorer. Release builds use unwind to support this.

## [1.2.0] - 2026-08-29

### Changed
- Relicensed to All Rights Reserved, updated the LICENSE file, README, and crate and package metadata.
- Refreshed the interface to a blue and silver palette with better text contrast, and regenerated every app icon to match.

### Added
- Indeterminate progress bar in the header while a batch is converting.
- Visible keyboard focus rings for better accessibility.

### Fixed
- Keep the document language attribute in sync with the selected locale.
- Version the saved settings store so future setting changes can migrate cleanly.

## [1.1.3] - 2026-08-03

### Fixed
- **Responsiveness**, scanning and conversion now run on a blocking worker thread instead of the main thread, so large batches and dropped folders no longer freeze the window or drag-and-drop.

### Changed
- Normalized user-facing text and docs to plain punctuation across all 8 locales and fixed a Korean export-label typo.

## [1.1.2] - 2026-06-23

### Fixed
- **BLPView thumbnails (Windows)**, detect broken legacy machine-wide BLPView registrations that block Explorer thumbnails.
- **BLPView install (Windows)**, install the thumbnail DLL beside the app executable for more reliable Explorer loading.
- **BLPView install (Windows)**, register full `SystemFileAssociations\.blp` metadata (`PerceivedType`, `Content Type`, `Application`).
- **BLPView restart (Windows)**, clear additional Explorer icon/thumbnail cache files and notify shell image updates.
- **BLPView thumbnail provider**, default thumbnail size when Explorer passes `cx = 0`.

## [1.1.1] - 2026-06-23

### Fixed
- **BLPView thumbnails (Windows)**, enable `DisableProcessIsolation` in release installs so Explorer can load the thumbnail handler reliably.
- **BLPView thumbnails (Windows)**, register the handler under `Explorer\FileExts\.blp\ShellEx` for Windows 10/11 compatibility.
- **BLPView thumbnails (Windows)**, clear Explorer thumbnail cache when restarting Explorer from Settings.
- **BLPView status (Windows)**, detect incomplete installs (missing DLL, approval list, or isolation flag) and prompt reinstall.
- **Release CI (Windows)**, fix intermittent `build.rs` file-lock error when bundling `blpview_thumb.dll`.

### Changed
- **BLPView (Linux/macOS)**, show the Settings section greyed out with a translated explanation instead of hiding it.

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
- Initial release, BLP and PNG conversion with drag-and-drop UI.

[1.3.0]: https://github.com/Kkthnx/BLPConverter/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/Kkthnx/BLPConverter/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Kkthnx/BLPConverter/compare/v1.1.3...v1.2.0
[1.1.3]: https://github.com/Kkthnx/BLPConverter/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/Kkthnx/BLPConverter/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/Kkthnx/BLPConverter/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Kkthnx/BLPConverter/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Kkthnx/BLPConverter/releases/tag/v1.0.0
