fn main() {
    tauri_build::build();
    #[cfg(target_os = "windows")]
    bundle_shell_dll();
}

#[cfg(target_os = "windows")]
fn bundle_shell_dll() {
    use std::path::PathBuf;

    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let profile = std::env::var("PROFILE").unwrap_or_else(|_| "debug".into());
    let workspace = manifest_dir.join("..");
    let dll_src = workspace.join(format!("target/{profile}/blp_shell_ext.dll"));

    let resources_dir = manifest_dir.join("resources");
    let dll_dst = resources_dir.join("blpview_thumb.dll");
    std::fs::create_dir_all(&resources_dir).ok();

    if dll_src.exists() {
        std::fs::copy(&dll_src, &dll_dst).expect("failed to copy BLPView thumbnail DLL");
        println!("cargo:rerun-if-changed={}", dll_src.display());
    } else {
        let _ = std::fs::write(&dll_dst, []);
        println!(
            "cargo:warning=BLPView DLL missing. Build it first: cargo build -p blp-shell-ext"
        );
    }

    println!("cargo:rerun-if-changed=../blp-shell-ext/src");
}
