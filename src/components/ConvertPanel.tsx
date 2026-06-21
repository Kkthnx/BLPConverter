import { ArrowRight, FileImage, ImageIcon } from "lucide-react";
import type { ConvertDirection } from "../types";

interface ConvertPanelProps {
  direction: ConvertDirection;
  active: boolean;
}

const PANEL_CONFIG = {
  "to-png": {
    label: "BLP",
    target: "PNG",
    hint: "Drop .blp files or folders",
    subhint: "Exports transparent PNG",
    Icon: FileImage,
  },
  "to-blp": {
    label: "PNG",
    target: "BLP",
    hint: "Drop .png files or folders",
    subhint: "Encodes with your compression settings",
    Icon: ImageIcon,
  },
};

export function ConvertPanel({ direction, active }: ConvertPanelProps) {
  const config = PANEL_CONFIG[direction];
  const Icon = config.Icon;

  return (
    <div
      className={`relative flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-5 transition-all ${
        active
          ? "border-workspace-cyan bg-workspace-cyan/5 shadow-cyan"
          : "border-workspace-border/80 bg-workspace-surface/40 hover:border-workspace-silver/30"
      }`}
    >
      <div className="relative flex items-center gap-3">
        <div
          className={`flex flex-col items-center rounded-lg border bg-workspace-panel px-6 py-4 transition ${
            active ? "border-workspace-cyan/40" : "border-workspace-border"
          }`}
        >
          <Icon
            className={`mb-2 h-10 w-10 ${active ? "text-workspace-cyan" : "text-workspace-silver"}`}
            strokeWidth={1.25}
          />
          <span className="text-lg font-bold tracking-wide text-white">
            {config.label}
          </span>
        </div>

        <ArrowRight className="h-8 w-8 shrink-0 text-workspace-cyan/70" />

        <div className="flex flex-col items-center rounded-lg border border-workspace-border/60 bg-workspace-elevated/50 px-5 py-4">
          <span className="text-lg font-bold tracking-wide text-workspace-cyan">
            {config.target}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-medium text-workspace-silver">{config.hint}</p>
        <p className="mt-0.5 text-[10px] text-workspace-silver-muted">
          {config.subhint}
        </p>
      </div>
    </div>
  );
}
