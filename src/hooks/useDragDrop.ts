import { useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import i18n from "../i18n";
import { convertPaths } from "../lib/conversion";
import { useAppStore } from "../store/useAppStore";
import type { ConvertDirection } from "../types";

// Tauri reports drag positions in physical pixels, while innerWidth is in CSS
// pixels. Convert first, or drops land on the wrong panel when display scaling
// is above 100%.
function directionFromPhysicalX(physicalX: number): ConvertDirection {
  const cssX = physicalX / (window.devicePixelRatio || 1);
  return cssX < window.innerWidth / 2 ? "to-png" : "to-blp";
}

export function useDragDrop() {
  useEffect(() => {
    if (!("__TAURI_INTERNALS__" in window)) {
      return;
    }

    // Registration is async. If cleanup runs before it resolves (StrictMode,
    // fast remounts), unregister as soon as it does so no listener leaks and
    // a single drop never fires twice.
    let disposed = false;
    let unlisten: (() => void) | undefined;
    const { setDragTarget, addLog } = useAppStore.getState();

    void getCurrentWebview()
      .onDragDropEvent(async (event) => {
        const payload = event.payload;

        if (payload.type === "over" || payload.type === "enter") {
          setDragTarget(directionFromPhysicalX(payload.position.x));
          return;
        }

        if (payload.type === "leave") {
          setDragTarget(null);
          return;
        }

        setDragTarget(null);

        if (useAppStore.getState().isConverting) {
          addLog(i18n.t("conversion.busy"), "error");
          return;
        }

        if (payload.paths.length === 0) {
          return;
        }

        try {
          await convertPaths(
            payload.paths,
            directionFromPhysicalX(payload.position.x),
          );
        } catch (err) {
          addLog(
            err instanceof Error ? err.message : i18n.t("conversion.dropFailed"),
            "error",
          );
        }
      })
      .then((fn) => {
        if (disposed) {
          fn();
        } else {
          unlisten = fn;
        }
      });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);
}
