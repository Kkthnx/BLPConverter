import { ArrowRight, FileImage, FolderOpen, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ConvertDirection } from "../types";
import { convertPaths } from "../lib/conversion";
import { pickSourceFiles } from "../lib/tauri";
import { useAppStore } from "../store/useAppStore";

interface ConvertPanelProps {
  direction: ConvertDirection;
  active: boolean;
}

export function ConvertPanel({ direction, active }: ConvertPanelProps) {
  const { t } = useTranslation();
  const isConverting = useAppStore((s) => s.isConverting);
  const addLog = useAppStore((s) => s.addLog);
  const isToPng = direction === "to-png";
  const Icon = isToPng ? FileImage : ImageIcon;

  const handleBrowse = async () => {
    try {
      const paths = await pickSourceFiles(isToPng ? "blp" : "png");
      if (paths.length === 0) {
        return;
      }
      if (useAppStore.getState().isConverting) {
        addLog(t("conversion.busy"), "error");
        return;
      }
      await convertPaths(paths, direction);
    } catch (err) {
      addLog(
        err instanceof Error ? err.message : t("conversion.dropFailed"),
        "error",
      );
    }
  };

  return (
    <div
      className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border-2 p-4 transition-colors ${
        active
          ? "border-solid border-workspace-accent bg-workspace-accent/5 shadow-accent"
          : "border-dashed border-workspace-outline bg-workspace-surface/40 hover:border-workspace-silver-muted"
      }`}
    >
      <div className="relative flex items-center gap-2 [@media(min-width:560px)]:gap-3">
        <div
          className={`flex flex-col items-center rounded-lg border bg-workspace-panel px-4 py-3 transition [@media(min-width:560px)]:px-6 ${
            active ? "border-workspace-accent/40" : "border-workspace-border"
          }`}
        >
          <Icon
            className={`mb-1.5 h-9 w-9 ${active ? "text-workspace-accent" : "text-workspace-silver"}`}
            strokeWidth={1.25}
            aria-hidden
          />
          <span className="text-lg font-bold tracking-wide text-white">
            {isToPng ? "BLP" : "PNG"}
          </span>
        </div>

        <ArrowRight
          className="h-6 w-6 shrink-0 text-workspace-accent/70 [@media(min-width:560px)]:h-8 [@media(min-width:560px)]:w-8"
          aria-hidden
        />

        <div className="flex flex-col items-center rounded-lg border border-workspace-border/60 bg-workspace-elevated/50 px-3 py-3 [@media(min-width:560px)]:px-5">
          <span className="text-lg font-bold tracking-wide text-workspace-accent">
            {isToPng ? "PNG" : "BLP"}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-medium text-workspace-silver">
          {t(isToPng ? "panels.toPng.hint" : "panels.toBlp.hint")}
        </p>
        <p className="mt-0.5 text-xs text-workspace-silver-muted [@media(max-height:379px)]:hidden">
          {t(isToPng ? "panels.toPng.subhint" : "panels.toBlp.subhint")}
        </p>
      </div>

      <button
        type="button"
        onClick={handleBrowse}
        disabled={isConverting}
        className="flex min-h-[24px] items-center gap-1.5 rounded-md border border-workspace-outline px-2.5 py-1 text-xs text-workspace-silver transition hover:border-workspace-accent/40 hover:text-workspace-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FolderOpen className="h-3.5 w-3.5" aria-hidden />
        {t("panels.browse")}
      </button>
    </div>
  );
}
