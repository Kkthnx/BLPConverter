use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};

use image::io::Reader as ImageReader;
use image_blp::convert::{
    blp_to_image, image_to_blp, Blp2Format, BlpTarget, DxtAlgorithm, FilterType,
};
use image_blp::encode::save_blp;
use image_blp::parser::load_blp;
use rayon::prelude::*;

use crate::metadata::{collect_supported_files, create_asset_id, file_kind_from_path};
use crate::types::{AssetKind, BatchConvertResult, CompressionFormat, ConversionSettings, QueueItem, QueueStatus};

pub fn convert_blp_to_png(source: &Path, output_dir: &Path) -> Result<PathBuf, String> {
    let blp = load_blp(source).map_err(|e| e.to_string())?;
    let image = blp_to_image(&blp, 0).map_err(|e| e.to_string())?;

    let file_stem = source
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid source filename".to_string())?;

    let output_path = output_dir.join(format!("{file_stem}.png"));
    image
        .save_with_format(&output_path, image::ImageFormat::Png)
        .map_err(|e| e.to_string())?;

    Ok(output_path)
}

pub fn convert_png_to_blp(
    source: &Path,
    output_dir: &Path,
    settings: &ConversionSettings,
) -> Result<PathBuf, String> {
    let reader = ImageReader::open(source).map_err(|e| e.to_string())?;
    let image = reader.decode().map_err(|e| e.to_string())?;

    let target = compression_to_blp_target(settings.compression);
    let blp = image_to_blp(
        image,
        settings.generate_mipmaps,
        target,
        FilterType::Lanczos3,
    )
    .map_err(|e| e.to_string())?;

    let file_stem = source
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or_else(|| "Invalid source filename".to_string())?;

    let output_path = output_dir.join(format!("{file_stem}.blp"));
    save_blp(&blp, &output_path).map_err(|e| e.to_string())?;

    Ok(output_path)
}

pub fn compression_to_blp_target(compression: CompressionFormat) -> BlpTarget {
    let dxt_algo = DxtAlgorithm::ClusterFit;

    match compression {
        CompressionFormat::Raw => BlpTarget::Blp2(Blp2Format::Raw3),
        CompressionFormat::Dxt1 => BlpTarget::Blp2(Blp2Format::Dxt1 {
            has_alpha: false,
            compress_algorithm: dxt_algo,
        }),
        CompressionFormat::Dxt5 => BlpTarget::Blp2(Blp2Format::Dxt5 {
            has_alpha: true,
            compress_algorithm: dxt_algo,
        }),
    }
}

pub fn convert_paths_batch(
    paths: &[String],
    kind: AssetKind,
    settings: &ConversionSettings,
) -> BatchConvertResult {
    let (files, scan_errors) = collect_supported_files(paths);
    let sources: Vec<PathBuf> = files
        .into_iter()
        .filter(|path| file_kind_from_path(path) == kind)
        .collect();

    if sources.is_empty() {
        return BatchConvertResult {
            succeeded: 0,
            failed: 0,
            results: Vec::new(),
        };
    }

    ensure_output_dirs(&sources, settings);

    let results: Vec<QueueItem> = sources
        .par_iter()
        .map(|source| convert_path(source, kind, settings))
        .collect();

    let succeeded = results
        .iter()
        .filter(|r| r.queue_status == QueueStatus::Completed)
        .count() as u32;
    let failed = results
        .iter()
        .filter(|r| r.queue_status == QueueStatus::Failed)
        .count() as u32;

    let _ = scan_errors;

    BatchConvertResult {
        succeeded,
        failed,
        results,
    }
}

fn ensure_output_dirs(sources: &[PathBuf], settings: &ConversionSettings) {
    let dirs: HashSet<PathBuf> = sources
        .iter()
        .filter_map(|source| resolve_output_dir(source, settings).ok())
        .collect();

    for dir in dirs {
        let _ = fs::create_dir_all(&dir);
    }
}

fn convert_path(source: &Path, kind: AssetKind, settings: &ConversionSettings) -> QueueItem {
    let name = source
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();
    let path_string = source.to_string_lossy().to_string();
    let target_format = target_format_for(kind, settings.compression);

    let mut item = QueueItem {
        id: create_asset_id(source),
        name: name.clone(),
        path: path_string,
        width: 0,
        height: 0,
        format: String::new(),
        mipmap_count: 0,
        kind,
        error: None,
        queue_status: QueueStatus::Processing,
        progress: 0,
        target_format,
        output_path: None,
        error_message: None,
    };

    let output_dir = match resolve_output_dir(source, settings) {
        Ok(dir) => dir,
        Err(err) => {
            item.queue_status = QueueStatus::Failed;
            item.error_message = Some(err);
            return item;
        }
    };

    let result = match kind {
        AssetKind::Blp => convert_blp_to_png(source, &output_dir),
        AssetKind::Png => convert_png_to_blp(source, &output_dir, settings),
    };

    match result {
        Ok(output_path) => {
            item.queue_status = QueueStatus::Completed;
            item.progress = 100;
            item.output_path = Some(output_path.to_string_lossy().to_string());
        }
        Err(err) => {
            item.queue_status = QueueStatus::Failed;
            item.progress = 100;
            item.error_message = Some(err);
        }
    }

    item
}

fn target_format_for(kind: AssetKind, compression: CompressionFormat) -> String {
    match kind {
        AssetKind::Blp => "PNG".into(),
        AssetKind::Png => match compression {
            CompressionFormat::Raw => "BLP (RAW)".into(),
            CompressionFormat::Dxt1 => "BLP (DXT1)".into(),
            CompressionFormat::Dxt5 => "BLP (DXT5)".into(),
        },
    }
}

fn resolve_output_dir(source: &Path, settings: &ConversionSettings) -> Result<PathBuf, String> {
    if settings.output_directory.is_empty() {
        source
            .parent()
            .map(Path::to_path_buf)
            .ok_or_else(|| "Cannot determine source folder".to_string())
    } else {
        Ok(PathBuf::from(&settings.output_directory))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn compression_targets_are_constructible() {
        let _ = compression_to_blp_target(CompressionFormat::Raw);
        let _ = compression_to_blp_target(CompressionFormat::Dxt1);
        let _ = compression_to_blp_target(CompressionFormat::Dxt5);
    }

    #[test]
    fn empty_output_dir_uses_source_parent() {
        let source = PathBuf::from(r"C:\textures\icon.blp");
        let settings = ConversionSettings {
            compression: CompressionFormat::Dxt5,
            generate_mipmaps: true,
            output_directory: String::new(),
        };

        let dir = resolve_output_dir(&source, &settings).unwrap();
        assert_eq!(dir, PathBuf::from(r"C:\textures"));
    }
}
