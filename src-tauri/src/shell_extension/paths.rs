use std::env;
use std::path::PathBuf;

use blp_shell_ext::{DLL_FILENAME, INSTALL_FOLDER};

pub fn expected_dll_path() -> PathBuf {
    let base = env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(r"C:\Users\Default\AppData\Local"));
    base.join(INSTALL_FOLDER).join(DLL_FILENAME)
}
