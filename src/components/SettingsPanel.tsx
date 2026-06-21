import { Settings } from "lucide-react";
import type { CompressionFormat } from "../types";
import { useAppStore } from "../store/useAppStore";
import { pickOutputDirectory } from "../lib/tauri";
import { BlpViewSection } from "./BlpViewSection";
import { AboutSection } from "./AboutSection";

const COMPRESSION_OPTIONS: { value: CompressionFormat; label: string }[] = [
  { value: "raw", label: "Uncompressed / RAW" },
  { value: "dxt1", label: "DXT1" },
  { value: "dxt5", label: "DXT5 (alpha)" },
];

export function SettingsPanel() {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const settings = useAppStore((s) => s.settings);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const updateSettings = useAppStore((s) => s.updateSettings);

  if (!settingsOpen) {
    return null;
  }

  const handlePickOutput = async () => {
    const dir = await pickOutputDirectory();
    if (dir) {
      updateSettings({ outputDirectory: dir });
    }
  };

  const clearOutput = () => {
    updateSettings({ outputDirectory: "" });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col border-l border-workspace-border bg-workspace-panel shadow-panel"
        role="dialog"
        aria-label="Settings"
      >
        <div className="flex items-center justify-between border-b border-workspace-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-workspace-cyan" />
            <h2 className="text-sm font-semibold text-white">Settings</h2>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="text-xs text-workspace-silver-muted transition hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-auto p-4">
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-workspace-silver-muted">
              Output Folder
            </h3>
            <p className="mb-2 text-[10px] leading-relaxed text-workspace-silver-muted">
              Optional. Leave unset to save converted files next to the originals.
            </p>
            <button
              type="button"
              onClick={handlePickOutput}
              className="w-full rounded-lg border border-workspace-border px-3 py-2 text-left text-xs text-workspace-silver transition hover:border-workspace-cyan/40"
            >
              {settings.outputDirectory || "Same folder as source (default)"}
            </button>
            {settings.outputDirectory && (
              <button
                type="button"
                onClick={clearOutput}
                className="mt-1.5 text-[10px] text-workspace-silver-muted transition hover:text-workspace-cyan"
              >
                Reset to source folder
              </button>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-workspace-silver-muted">
              PNG → BLP Compression
            </h3>
            <div className="space-y-1.5">
              {COMPRESSION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition ${
                    settings.compression === option.value
                      ? "border-workspace-cyan/50 bg-workspace-cyan/10 text-workspace-cyan"
                      : "border-workspace-border text-workspace-silver hover:border-workspace-silver/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="compression"
                    value={option.value}
                    checked={settings.compression === option.value}
                    onChange={() =>
                      updateSettings({ compression: option.value })
                    }
                    className="accent-workspace-cyan"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          <section>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-workspace-border px-2.5 py-2 text-xs text-workspace-silver">
              <input
                type="checkbox"
                checked={settings.generateMipmaps}
                onChange={(e) =>
                  updateSettings({ generateMipmaps: e.target.checked })
                }
                className="accent-workspace-cyan"
              />
              Generate mipmaps for BLP output
            </label>
          </section>

          <BlpViewSection />
          <AboutSection />
        </div>
      </aside>
    </>
  );
}
