import { Settings } from "lucide-react";
import { APP_NAME } from "../constants/app";
import { useAppStore } from "../store/useAppStore";

export function TitleBar() {
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const outputDirectory = useAppStore((s) => s.settings.outputDirectory);
  const isConverting = useAppStore((s) => s.isConverting);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-workspace-border bg-workspace-panel px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <img
          src="/app-icon.svg"
          alt=""
          className="h-7 w-7 shrink-0 rounded-md ring-1 ring-workspace-border"
        />
        <div>
          <h1 className="text-sm font-semibold leading-none text-white">
            {APP_NAME}
          </h1>
          <p className="mt-0.5 text-[10px] text-workspace-silver-muted">
            Drop files to convert
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isConverting && (
          <span className="text-[10px] font-medium text-workspace-cyan animate-pulse">
            Converting…
          </span>
        )}
        {outputDirectory && (
          <span
            className="hidden max-w-[140px] truncate text-[10px] text-workspace-silver-muted sm:inline"
            title={outputDirectory}
          >
            {outputDirectory}
          </span>
        )}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-workspace-border text-workspace-silver-muted transition hover:border-workspace-cyan/40 hover:text-workspace-cyan"
          aria-label="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
