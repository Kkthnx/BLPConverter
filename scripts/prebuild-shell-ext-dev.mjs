import { execSync } from "node:child_process";

if (process.platform === "win32") {
  console.log("Building BLPView shell extension (debug)…");
  execSync("cargo build -p blp-shell-ext", { stdio: "inherit" });
} else {
  console.log("Skipping BLPView shell extension (Windows only).");
}
