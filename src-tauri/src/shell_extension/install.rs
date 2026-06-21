use std::env;
use std::fs;
use std::io;
use std::path::PathBuf;

use blp_shell_ext::{
    GuidExt, CLSID_BLP_THUMB, DEFAULT_EXT, DEFAULT_PROGID, DLL_FILENAME, FRIENDLY_NAME,
    INSTALL_FOLDER, SHELL_PREVIEW_HANDLER_CATID, SHELL_THUMB_HANDLER_CATID,
};
use winreg::enums::{HKEY_CURRENT_USER, KEY_READ, KEY_SET_VALUE};
use winreg::RegKey;

use crate::types::BlpViewActionResult;
use super::reg_helpers::{notify_shell_assoc, RegKeyHelper};

#[cfg(windows)]
static DLL_BYTES: &[u8] = include_bytes!("../../resources/blpview_thumb.dll");

pub fn install_blpview() -> Result<BlpViewActionResult, String> {
    install_inner().map_err(|err| err.to_string())?;
    Ok(BlpViewActionResult {
        success: true,
        message: "BLPView installed for the current user. Restart Explorer to refresh thumbnails.".into(),
        restart_required: true,
    })
}

fn install_inner() -> io::Result<()> {
    let dll_path = materialize_dll()?;

    let root = RegKey::predef(HKEY_CURRENT_USER);
    let thumb_clsid = CLSID_BLP_THUMB.to_braced_upper();
    let thumb_catid = SHELL_THUMB_HANDLER_CATID.to_braced_upper();
    let preview_catid = SHELL_PREVIEW_HANDLER_CATID.to_braced_upper();

    pre_clean(&root, DEFAULT_EXT, DEFAULT_PROGID, &thumb_clsid, &thumb_catid, &preview_catid)?;

    RegKeyHelper::open(&root, r"Software\Microsoft\Windows\CurrentVersion\Shell Extensions\Approved")?
        .set(&thumb_clsid, FRIENDLY_NAME)?;

    {
        let cls = RegKeyHelper::open(&root, format!(r"Software\Classes\CLSID\{thumb_clsid}"))?;
        cls.set_default(FRIENDLY_NAME)?;
        cls.set("DisableProcessIsolation", 1u32)?;
        let inproc = cls.sub("InprocServer32")?;
        inproc.set_default(dll_path.as_os_str())?;
        inproc.set("ThreadingModel", "Apartment")?;
        let _ = cls.sub(&format!(r"Implemented Categories\{thumb_catid}"));
    }

    {
        let ext_key = RegKeyHelper::open(&root, format!(r"Software\Classes\{DEFAULT_EXT}"))?;
        ext_key.set("Content Type", "image/x-blp")?;
        ext_key.set("PerceivedType", "image")?;
        ext_key.set_default(DEFAULT_PROGID)?;
        let _ = root.delete_subkey_all(&format!(
            r"Software\Classes\{DEFAULT_EXT}\PersistentHandler"
        ));
    }

    {
        let progid = RegKeyHelper::open(&root, format!(r"Software\Classes\{DEFAULT_PROGID}"))?;
        progid.set_default(FRIENDLY_NAME)?;
        let shellex = progid.sub("ShellEx")?;
        shellex.sub(&thumb_catid)?.set_default(thumb_clsid.as_str())?;
        shellex.sub(&preview_catid)?.set_default(thumb_clsid.as_str())?;
    }

    {
        let ext_sx = RegKeyHelper::open(&root, format!(r"Software\Classes\{DEFAULT_EXT}\ShellEx"))?;
        ext_sx.sub(&thumb_catid)?.set_default(thumb_clsid.as_str())?;
        ext_sx.sub(&preview_catid)?.set_default(thumb_clsid.as_str())?;

        let sfa = RegKeyHelper::open(
            &root,
            format!(r"Software\Classes\SystemFileAssociations\{DEFAULT_EXT}\ShellEx"),
        )?;
        sfa.sub(&thumb_catid)?.set_default(thumb_clsid.as_str())?;
        sfa.sub(&preview_catid)?.set_default(thumb_clsid.as_str())?;
    }

    RegKeyHelper::open(
        &root,
        r"Software\Microsoft\Windows\CurrentVersion\Explorer\ThumbnailHandlers",
    )?
    .set(DEFAULT_EXT, thumb_clsid.as_str())?;

    if let Ok((advanced, _)) =
        root.create_subkey(r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced")
    {
        let _ = advanced.set_value("ShowPreviewHandlers", &1u32);
        let _ = advanced.set_value("IconsOnly", &0u32);
        let _ = advanced.set_value("DisableThumbnails", &0u32);
        let _ = advanced.set_value("DisableThumbnailCache", &0u32);
        let _ = advanced.set_value("DisableThumbnailsOnNetworkFolders", &0u32);
    }

    notify_shell_assoc("install");
    Ok(())
}

fn materialize_dll() -> io::Result<PathBuf> {
    if DLL_BYTES.is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::NotFound,
            "BLPView thumbnail DLL was not bundled with this build",
        ));
    }

    let base = env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(r"C:\Users\Default\AppData\Local"));
    let dir = base.join(INSTALL_FOLDER);
    fs::create_dir_all(&dir)?;
    let path = dir.join(DLL_FILENAME);
    fs::write(&path, DLL_BYTES)?;
    Ok(path)
}

fn pre_clean(
    root: &RegKey,
    ext: &str,
    progid: &str,
    thumb_clsid: &str,
    thumb_catid: &str,
    preview_catid: &str,
) -> io::Result<()> {
    let del_tree = |path: &str| -> io::Result<()> {
        match root.delete_subkey_all(path) {
            Ok(()) => Ok(()),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(e),
        }
    };

    let del_value = |key_path: &str, value_name: &str| -> io::Result<()> {
        match root.open_subkey_with_flags(key_path, KEY_READ | KEY_SET_VALUE) {
            Ok(key) => match key.delete_value(value_name) {
                Ok(()) => Ok(()),
                Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
                Err(e) => Err(e),
            },
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
            Err(e) => Err(e),
        }
    };

    for path in [
        format!(r"Software\Classes\CLSID\{thumb_clsid}"),
        format!(r"Software\Classes\{ext}\ShellEx\{thumb_catid}"),
        format!(r"Software\Classes\{ext}\ShellEx\{preview_catid}"),
        format!(r"Software\Classes\{progid}\ShellEx\{thumb_catid}"),
        format!(r"Software\Classes\{progid}\ShellEx\{preview_catid}"),
        format!(r"Software\Classes\SystemFileAssociations\{ext}\ShellEx\{thumb_catid}"),
        format!(r"Software\Classes\SystemFileAssociations\{ext}\ShellEx\{preview_catid}"),
        format!(r"Software\Classes\{ext}\PersistentHandler"),
    ] {
        let _ = del_tree(&path);
    }

    del_value(
        r"Software\Microsoft\Windows\CurrentVersion\Explorer\ThumbnailHandlers",
        ext,
    )?;
    del_value(
        r"Software\Microsoft\Windows\CurrentVersion\Shell Extensions\Approved",
        thumb_clsid,
    )?;

    Ok(())
}
