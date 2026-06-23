use rayon::prelude::*;

use crate::conversion::convert_paths_batch;
use crate::metadata::{collect_supported_files, extract_metadata};
use crate::shell_extension::{
    get_blpview_status, install_blpview, restart_explorer, uninstall_blpview,
};
use crate::types::{
    AssetKind, BatchConvertResult, BlpViewActionResult, BlpViewStatus, ConversionSettings,
    FileMetadata, ScanPathsResult,
};

#[tauri::command]
pub fn scan_paths(paths: Vec<String>) -> ScanPathsResult {
    let (files, mut errors) = collect_supported_files(&paths);

    let assets: Vec<FileMetadata> = files
        .par_iter()
        .map(|path| extract_metadata(path))
        .collect();

    errors.extend(
        assets
            .iter()
            .filter_map(|asset| asset.error.as_ref().map(|e| format!("{}: {e}", asset.path))),
    );

    ScanPathsResult { assets, errors }
}

#[tauri::command]
pub fn convert_paths(
    paths: Vec<String>,
    kind: AssetKind,
    settings: ConversionSettings,
) -> BatchConvertResult {
    convert_paths_batch(&paths, kind, &settings)
}

#[tauri::command]
pub fn blpview_status() -> BlpViewStatus {
    get_blpview_status()
}

#[tauri::command]
pub fn blpview_install() -> Result<BlpViewActionResult, String> {
    install_blpview()
}

#[tauri::command]
pub fn blpview_uninstall() -> Result<BlpViewActionResult, String> {
    uninstall_blpview()
}

#[tauri::command]
pub fn blpview_restart_explorer() -> Result<(), String> {
    restart_explorer()
}
