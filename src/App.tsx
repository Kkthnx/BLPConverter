import { TitleBar } from "./components/TitleBar";
import { ConvertPanel } from "./components/ConvertPanel";
import { StatusLog } from "./components/StatusLog";
import { SettingsPanel } from "./components/SettingsPanel";
import { useDragDrop } from "./hooks/useDragDrop";
import { useAppStore } from "./store/useAppStore";

function App() {
  useDragDrop();

  const dragTarget = useAppStore((s) => s.dragTarget);

  return (
    <div className="flex h-full flex-col">
      <TitleBar />

      <main className="flex flex-1 gap-3 overflow-hidden p-3">
        <ConvertPanel
          direction="to-png"
          active={dragTarget === "to-png"}
        />
        <ConvertPanel
          direction="to-blp"
          active={dragTarget === "to-blp"}
        />
      </main>

      <StatusLog />
      <SettingsPanel />
    </div>
  );
}

export default App;
