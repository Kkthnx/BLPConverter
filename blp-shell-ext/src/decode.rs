use image_blp::convert::blp_to_image;
use image_blp::parser::load_blp_from_buf;
use image_blp::types::image::BlpImage;

/// Decode a BLP for a thumbnail of at most `max_dim` pixels on its longest side.
///
/// Explorer asks for small sizes (often 96 to 256 px) while WoW textures can be
/// 2048 px or more. Decoding the smallest stored mip level that still covers
/// `max_dim` avoids decompressing and then downscaling the full image.
pub fn decode_blp_rgba(data: &[u8], max_dim: u32) -> Result<(u32, u32, Vec<u8>), ()> {
    let blp = load_blp_from_buf(data).map_err(|_| ())?;
    let level = thumbnail_mip_level(&blp, max_dim);

    // A damaged or truncated mip chain should not cost the thumbnail, so fall
    // back to the full-size level if the smaller one does not decode.
    let image = blp_to_image(&blp, level)
        .or_else(|_| blp_to_image(&blp, 0))
        .map_err(|_| ())?;
    let rgba = image.to_rgba8();
    let (width, height) = rgba.dimensions();
    Ok((width, height, rgba.into_raw()))
}

fn thumbnail_mip_level(blp: &BlpImage, max_dim: u32) -> usize {
    if !blp.header.has_mipmaps() {
        return 0;
    }

    let available = blp.image_count();
    let mut level = 0;
    for candidate in 1..available {
        let (w, h) = blp.header.mipmap_size(candidate);
        if w.max(h) < max_dim {
            break;
        }
        level = candidate;
    }
    level
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, Rgba, RgbaImage};
    use image_blp::convert::{image_to_blp, Blp2Format, BlpTarget, DxtAlgorithm, FilterType};
    use image_blp::encode::encode_blp;

    fn encoded_blp(size: u32, mipmaps: bool) -> Vec<u8> {
        let source = DynamicImage::ImageRgba8(RgbaImage::from_pixel(size, size, Rgba([10, 20, 30, 255])));
        let target = BlpTarget::Blp2(Blp2Format::Dxt1 {
            has_alpha: false,
            compress_algorithm: DxtAlgorithm::RangeFit,
        });
        let blp = image_to_blp(source, mipmaps, target, FilterType::Triangle).unwrap();
        encode_blp(&blp).unwrap()
    }

    #[test]
    fn picks_smallest_mip_covering_the_thumbnail() {
        let data = encoded_blp(512, true);
        let (w, h, rgba) = decode_blp_rgba(&data, 96).unwrap();
        assert_eq!((w, h), (128, 128));
        assert_eq!(rgba.len(), 128 * 128 * 4);

        let (w, _, _) = decode_blp_rgba(&data, 256).unwrap();
        assert_eq!(w, 256);
    }

    #[test]
    fn requests_larger_than_the_image_use_full_size() {
        let data = encoded_blp(64, true);
        let (w, h, _) = decode_blp_rgba(&data, 256).unwrap();
        assert_eq!((w, h), (64, 64));
    }

    #[test]
    fn files_without_mipmaps_decode_level_zero() {
        let data = encoded_blp(256, false);
        let (w, _, _) = decode_blp_rgba(&data, 96).unwrap();
        assert_eq!(w, 256);
    }
}
