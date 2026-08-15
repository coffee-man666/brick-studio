import { useRef } from 'react';
import {
  Blocks,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Trash2,
  CircleHelp,
} from 'lucide-react';
import type { ViewName } from '@/store';
import { useStudio } from '@/store';
import { cn } from '@/lib/utils';

const VIEWS: [ViewName, string][] = [
  ['iso', '等轴'],
  ['top', '顶视'],
  ['front', '前视'],
  ['right', '侧视'],
];

function BarButton({
  onClick,
  title,
  disabled,
  danger,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors',
        disabled
          ? 'opacity-30'
          : danger
            ? 'hover:bg-red-500/15 hover:text-red-400'
            : 'hover:bg-white/10 hover:text-neutral-100',
      )}
    >
      {children}
    </button>
  );
}

export function TopBar({ onHelp }: { onHelp: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canUndo = useStudio((s) => s.past.length > 0);
  const canRedo = useStudio((s) => s.future.length > 0);
  const hasBricks = useStudio((s) => s.bricks.length > 0);
  const { undo, redo, requestView, saveLocal, exportFile, importFile, clearAll, showToast } =
    useStudio.getState();

  const handleImport = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') importFile(reader.result);
    };
    reader.readAsText(file);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-[#141822] px-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 to-amber-500 text-neutral-900 shadow">
          <Blocks className="h-4.5 w-4.5" strokeWidth={2.2} />
        </span>
        <div className="leading-none">
          <div className="text-sm font-bold tracking-wide text-neutral-100">积木工坊</div>
          <div className="mt-0.5 text-[10px] tracking-widest text-neutral-500">BRICK STUDIO</div>
        </div>
      </div>

      <div className="mx-3 h-5 w-px bg-white/10" />

      {/* 视角 */}
      <div className="flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
        {VIEWS.map(([v, label]) => (
          <button
            key={v}
            onClick={() => requestView(v)}
            className="rounded-md px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-100"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mx-1 h-5 w-px bg-white/10" />

      <BarButton onClick={undo} title="撤销 (Ctrl+Z)" disabled={!canUndo}>
        <Undo2 className="h-4 w-4" />
      </BarButton>
      <BarButton onClick={redo} title="重做 (Ctrl+Shift+Z)" disabled={!canRedo}>
        <Redo2 className="h-4 w-4" />
      </BarButton>

      <div className="flex-1" />

      <BarButton onClick={saveLocal} title="保存到浏览器 (Ctrl+S)">
        <Save className="h-4 w-4" />
      </BarButton>
      <BarButton onClick={exportFile} title="导出作品文件 (.json)" disabled={!hasBricks}>
        <Download className="h-4 w-4" />
      </BarButton>
      <BarButton onClick={() => fileRef.current?.click()} title="导入作品文件">
        <Upload className="h-4 w-4" />
      </BarButton>
      <BarButton
        onClick={() => {
          if (window.confirm('确定要清空全部砖块吗？（可用撤销恢复）')) {
            clearAll();
            showToast('已清空画布');
          }
        }}
        title="清空全部"
        disabled={!hasBricks}
        danger
      >
        <Trash2 className="h-4 w-4" />
      </BarButton>

      <div className="mx-1 h-5 w-px bg-white/10" />

      <BarButton onClick={onHelp} title="帮助与快捷键">
        <CircleHelp className="h-4 w-4" />
      </BarButton>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          handleImport(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </header>
  );
}
