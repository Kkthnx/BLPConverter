import { APP_AUTHOR, APP_DESCRIPTION, APP_NAME, APP_TAGLINE, APP_VERSION } from "../constants/app";

export function AboutSection() {
  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-workspace-silver-muted">
        About
      </h3>

      <div className="space-y-3 rounded-lg border border-workspace-border bg-workspace-surface p-3">
        <div className="flex items-center gap-3">
          <img
            src="/app-icon.svg"
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-workspace-border"
          />
          <div>
            <p className="text-sm font-semibold text-white">{APP_NAME}</p>
            <p className="text-[10px] text-workspace-silver-muted">v{APP_VERSION}</p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-workspace-silver-muted">
          {APP_TAGLINE}
        </p>

        <p className="text-[11px] leading-relaxed text-workspace-silver-muted/80">
          {APP_DESCRIPTION}
        </p>

        <p className="border-t border-workspace-border pt-2 text-[10px] text-workspace-silver-muted">
          Made by {APP_AUTHOR}
        </p>
      </div>
    </section>
  );
}
