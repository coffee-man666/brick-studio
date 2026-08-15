import { Hammer, Eraser, PaintBucket, Pipette, RotateCw } from 'lucide-react';
import type { Tool } from '@/store';
import { useStudio } from '@/store';
import { BRICK_MAP, COLOR_MAP } from '@/lib/lego';
import { cn } from '@/lib/utils';

const TOOLS: { id: Tool; label: string; key: string; icon: React.ReactNode }[] = [
  { id: 'place', label: '搭建', key: 'B', icon: <Hammer className="h-4 w-4" /> },
  { id: 'erase', label: '擦除', key: 'E', icon: <Eraser className="h-4 w-4" /> },
  { id: 'paint', label: '填色', key: 'P', icon: <PaintBucket className="h-4 w-4" /> },
  { id: 'picker', label: '取样', key: 'I', icon: <Pipette className="h-4 w-4" /> },
];

const TOOL_HINT: Record<Tool, string> = {
  place: '在底板或砖块顶面点击放置',
  erase: '点击砖块将其移除',
  paint: '点击砖块改为当前颜色',
  picker: '点击砖块吸取其型号与颜色',
};

/** 底部悬浮工具坞 + 状态信息 */
export function ToolDock() {
  const tool = useStudio((s) => s.tool);
  const setTool = useStudio((s) => s.setTool);
  const rotateGhost = useStudio((s) => s.rotateGhost);
  const rotation = useStudio((s) => s.rotation);
  const bricks = useStudio((s) => s.bricks);
  const selectedType = useStudio((s) => s.selectedType);
  const selectedColor = useStudio((s) => s.selectedColor);

  const typeName = BRICK_MAP[selectedType]?.name ?? '';
  const colorHex = COLOR_MAP[selectedColor]?.hex ?? '#888';
  const colorName = COLOR_MAP[selectedColor]?.name ?? '';

  return (
    <>
      {/* 工具坞 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-[#161b26]/95 p-1.5 shadow-2xl backdrop-blur">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.key}) — ${TOOL_HINT[t.id]}`}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
                tool === t.id
                  ? 'bg-amber-400 text-neutral-900 shadow'
                  : 'text-neutral-400 hover:bg-white/10 hover:text-neutral-100',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          <div className="mx-1 h-6 w-px bg-white/10" />
          <button
            onClick={rotateGhost}
            title="旋转手中砖块 (R)"
            className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-neutral-400 transition-all hover:bg-white/10 hover:text-neutral-100"
          >
            <RotateCw className="h-4 w-4" />
            旋转
            <span className="rounded bg-white/10 px-1 font-mono text-[10px] text-amber-300">
              {rotation * 90}°
            </span>
          </button>
        </div>
      </div>

      {/* 左下状态 */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/10 bg-[#161b26]/90 px-3 py-2 text-[11px] leading-relaxed text-neutral-400 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: colorHex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }}
          />
          <span className="text-neutral-200">{typeName}</span>
          <span className="text-neutral-500">· {colorName}</span>
        </div>
        <div className="mt-0.5">
          {TOOL_HINT[tool]} · 共 <span className="font-mono text-amber-300">{bricks.length}</span> 块
        </div>
      </div>
    </>
  );
}

/** 轻提示 */
export function Toast() {
  const toast = useStudio((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
      <div className="rounded-full border border-amber-400/30 bg-[#1c212e]/95 px-4 py-1.5 text-xs text-amber-200 shadow-xl">
        {toast}
      </div>
    </div>
  );
}
