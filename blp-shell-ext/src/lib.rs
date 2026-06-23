mod class_factory;
mod decode;
mod dll_export;
mod registry;
mod thumbnail_provider;
mod utils;

pub use registry::*;

use std::sync::atomic::AtomicU32;
use windows_core::HRESULT;

pub(crate) const CLASS_E_CLASSNOTAVAILABLE: HRESULT = HRESULT(0x80040111u32 as i32);

pub(crate) static DLL_LOCK_COUNT: AtomicU32 = AtomicU32::new(0);

#[derive(Default)]
pub(crate) struct ProviderState {
    pub path_utf8: Option<String>,
    pub stream_data: Option<std::sync::Arc<[u8]>>,
}
