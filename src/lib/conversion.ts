import type { AssetKind, ConvertDirection } from "../types";
import { convertDroppedPaths } from "./tauri";
import { useAppStore } from "../store/useAppStore";

function kindFromDirection(direction: ConvertDirection): AssetKind {
  return direction === "to-png" ? "blp" : "png";
}

export async function convertPaths(
  paths: string[],
  direction: ConvertDirection,
): Promise<void> {
  const store = useAppStore.getState();
  const settings = store.settings;
  const kind = kindFromDirection(direction);

  const label = kind === "blp" ? "BLP → PNG" : "PNG → BLP";
  store.addLog(`Converting ${paths.length} file(s) (${label})…`);

  if (!settings.outputDirectory) {
    store.addLog("Output: same folder as source");
  }

  store.setConverting(true);

  try {
    const result = await convertDroppedPaths(paths, kind, settings);

    if (result.results.length === 0) {
      const expected = kind === "blp" ? "BLP" : "PNG";
      store.addLog(`No ${expected} files found for this side.`, "error");
      return;
    }

    for (const item of result.results) {
      if (item.queueStatus === "completed" && item.outputPath) {
        store.addLog(`${item.name} → ${item.outputPath}`, "success");
      } else if (item.queueStatus === "failed") {
        store.addLog(
          `${item.name}: ${item.errorMessage ?? "Conversion failed"}`,
          "error",
        );
      }
    }

    store.addLog(
      `Done — ${result.succeeded} succeeded, ${result.failed} failed.`,
      result.failed > 0 ? "error" : "success",
    );
  } catch (err) {
    store.addLog(
      err instanceof Error ? err.message : "Conversion failed",
      "error",
    );
  } finally {
    store.setConverting(false);
  }
}
