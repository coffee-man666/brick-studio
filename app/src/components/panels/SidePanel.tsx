import { useMemo, useState } from 'react';
import { BRICK_MAP, COLORS, COLOR_MAP } from '@/lib/lego';
import { useStudio } from '@/store';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

type Tab = 'color' | 'parts';

/** 右侧面板: 调色板 + 零件清单 */
export function SidePanel() {
  const [tab, setTab] = useState<Tab>('color');
  const bricks = useStudio((s) => s.bricks);
  const selectedColor = useStudio((s) => s.selectedColor);
  const setSelectedColor = useStudio((s) => s.setSelectedColor);

  const parts = useMemo(() => {
    const map = new Map<string, { typeName: string; colorName: string; hex: string; count: number }>();
    for (const b of bricks) {
      const key = `${b.type}|${b.color}`;
      const t = BRICK_MAP[b.type];
      const c = COLOR_MAP[b.color];
      const row = map.get(key);
      if (row) row.count += 1;
      else
        map.set(key, {
          typeName: t?.name ?? b.type,
          colorName: c?.name ?? b.color,
          hex: c?.hex ?? '#888',
          count: 1,
        });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [bricks]);

  const totalStuds = useMemo(
    () =>
      bricks.reduce((acc, b) => {
        const t = BRICK_MAP[b.type];
        return acc + (t ? t.w * t.d : 0);
      }, 0),
    [bricks],
  );

  return (
    <aside className="w-[228px] shrink-0 flex flex-col border-l border-white/10 bg-[#141822]/95">
      <div className="px-3 pt-3 pb-2 flex gap-1">
        {(
          [
            ['color', '调色板'],
            ['parts', '零件清单'],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              tab === k
                ? 'bg-amber-400/90 text-neutral-900'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'color' ? (
        <div className="flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
          <div className="grid grid-cols-3 gap-1.5">
            {COLORS.map((c) => {
              const active = c.id === selectedColor;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  title={c.name}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-all',
                    active
                      ? 'border-amber-400/80 bg-amber-400/10'
                      : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]',
                  )}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: c.hex,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.4)',
                    }}
                  >
                    {active && (
                      <Check
                        className="h-4 w-4"
                        strokeWidth={3}
                        style={{
                          color:
                            c.id === 'white' || c.id === 'yellow' || c.id === 'tan' || c.id === 'lime' || c.id === 'sky' || c.id === 'pink'
                              ? '#1a1a1a'
                              : '#fff',
                        }}
                      />
                    )}
                  </span>
                  <span className={cn('text-[10px] leading-none', active ? 'text-amber-300' : 'text-neutral-500')}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-neutral-500">
            新放置的砖块使用所选颜色；用「填色」工具可修改已有砖块。
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden px-3 pb-3">
          <div className="flex-1 overflow-y-auto [scrollbar-width:thin]">
            {parts.length === 0 ? (
              <p className="mt-6 text-center text-xs text-neutral-500">
                还没有放置任何砖块
              </p>
            ) : (
              <table className="w-full text-xs">
                <tbody>
                  {parts.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-1.5 pr-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full align-[-2px]"
                          style={{ backgroundColor: p.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)' }}
                        />
                      </td>
                      <td className="py-1.5 pr-2 text-neutral-300">
                        {p.typeName}
                        <span className="ml-1 text-neutral-500">{p.colorName}</span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-amber-300">×{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>砖块总数</span>
              <span className="font-mono text-neutral-200">{bricks.length}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>凸点总数</span>
              <span className="font-mono text-neutral-200">{totalStuds}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
