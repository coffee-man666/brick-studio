import { useEffect, useState } from 'react';
import './App.css';
import { Scene } from '@/components/three/Scene';
import { TopBar } from '@/components/panels/TopBar';
import { BrickLibrary } from '@/components/panels/BrickLibrary';
import { SidePanel } from '@/components/panels/SidePanel';
import { ToolDock, Toast } from '@/components/panels/ToolDock';
import { HelpDialog } from '@/components/panels/HelpDialog';
import { useStudio } from '@/store';

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const st = useStudio.getState();
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) st.redo();
        else st.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        st.redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        st.saveLocal();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (key) {
        case 'b':
          st.setTool('place');
          break;
        case 'e':
          st.setTool('erase');
          break;
        case 'p':
          st.setTool('paint');
          break;
        case 'i':
          st.setTool('picker');
          break;
        case 'r':
          st.rotateGhost();
          break;
        case 'delete':
        case 'backspace': {
          const id = st.hover?.brickId;
          if (id) st.eraseBrick(id);
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);
  useKeyboard();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0e1117] font-sans text-neutral-200 select-none">
      <TopBar onHelp={() => setHelpOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <BrickLibrary />
        <main className="relative min-w-0 flex-1">
          <Scene />
          <ToolDock />
          <Toast />
        </main>
        <SidePanel />
      </div>
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
