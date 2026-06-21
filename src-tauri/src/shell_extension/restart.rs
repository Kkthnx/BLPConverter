use std::process::{Command, Stdio};
use std::thread::sleep;
use std::time::Duration;

pub fn restart_explorer() -> Result<(), String> {
    let _ = Command::new("taskkill")
        .args(["/F", "/IM", "explorer.exe"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();

    sleep(Duration::from_millis(400));

    Command::new("explorer.exe")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .or_else(|_| {
            Command::new("cmd")
                .args(["/C", "start", "", "explorer.exe"])
                .stdin(Stdio::null())
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
        })
        .map_err(|err| err.to_string())?;

    Ok(())
}
