use std::env;
use std::path::PathBuf;

use blp_shell_ext::{GuidExt, CLSID_BLP_THUMB, DLL_FILENAME, INSTALL_FOLDER};
use winreg::enums::HKEY_CURRENT_USER;
use winreg::RegKey;

use crate::types::BlpViewStatus;

pub fn get_blpview_status() -> BlpViewStatus {
    let dll_path = expected_dll_path();
    let clsid = CLSID_BLP_THUMB.to_braced_upper();
    let root = RegKey::predef(HKEY_CURRENT_USER);

    let registry_installed = root
        .open_subkey(format!(r"Software\Classes\CLSID\{clsid}"))
        .is_ok();

    let dll_exists = dll_path.exists() && dll_path.metadata().map(|m| m.len() > 0).unwrap_or(false);

    let installed = registry_installed && dll_exists;

    let message = if installed {
        "BLPView is active for .blp files in Windows Explorer.".into()
    } else if registry_installed && !dll_exists {
        "BLPView registry entries exist but the thumbnail DLL is missing. Reinstall BLPView.".into()
    } else {
        "Install BLPView to show .blp thumbnails and previews directly in Windows Explorer.".into()
    };

    BlpViewStatus {
        installed,
        dll_path: dll_path.display().to_string(),
        supported: true,
        message,
    }
}

fn expected_dll_path() -> PathBuf {
    let base = env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(r"C:\Users\Default\AppData\Local"));
    base.join(INSTALL_FOLDER).join(DLL_FILENAME)
}
