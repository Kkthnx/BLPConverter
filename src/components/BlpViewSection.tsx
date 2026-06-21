import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Monitor, RefreshCw, Unplug } from "lucide-react";
import type { BlpViewStatus } from "../types";
import {
  getBlpViewStatus,
  installBlpView,
  restartExplorer,
  uninstallBlpView,
} from "../lib/tauri";

export function BlpViewSection() {
  const [status, setStatus] = useState<BlpViewStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setStatus(await getBlpViewStatus());
    } catch {
      setFeedback("Could not read BLPView status.");
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const handleInstall = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await installBlpView();
      setFeedback(result.message);
      await refreshStatus();
      if (result.restartRequired) {
        await restartExplorer();
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Install failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await uninstallBlpView();
      setFeedback(result.message);
      await refreshStatus();
      if (result.restartRequired) {
        await restartExplorer();
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Uninstall failed");
    } finally {
      setLoading(false);
    }
  };

  if (!status?.supported) {
    return null;
  }

  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-workspace-silver-muted">
        Explorer Thumbnails (BLPView)
      </h3>

      <div className="space-y-2 rounded-lg border border-workspace-border bg-workspace-surface p-2.5">
        <div className="flex items-start gap-2">
          {status.installed ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          ) : (
            <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-workspace-silver-muted" />
          )}
          <p className="text-[11px] leading-relaxed text-workspace-silver-muted">
            {status.message}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {!status.installed ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleInstall}
              className="rounded-md bg-workspace-cyan/15 px-2.5 py-1.5 text-[11px] font-medium text-workspace-cyan ring-1 ring-workspace-cyan/30 disabled:opacity-40"
            >
              Install
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleUninstall}
              className="rounded-md border border-workspace-border px-2.5 py-1.5 text-[11px] text-workspace-silver-muted hover:text-red-400 disabled:opacity-40"
            >
              <Unplug className="mr-1 inline h-3 w-3" />
              Uninstall
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => void restartExplorer()}
            className="rounded-md border border-workspace-border px-2.5 py-1.5 text-[11px] text-workspace-silver-muted hover:text-workspace-cyan disabled:opacity-40"
          >
            <RefreshCw className="mr-1 inline h-3 w-3" />
            Restart Explorer
          </button>
        </div>

        {feedback && (
          <p className="text-[10px] text-workspace-cyan">{feedback}</p>
        )}
      </div>
    </section>
  );
}
