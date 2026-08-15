import { useState } from 'react';
import type { Category } from '@/lib/lego';
import { BRICK_TYPES, CATEGORY_LABEL, COLOR_MAP } from '@/lib/lego';
import { useStudio } from '@/store';
import { BrickThumb } from './BrickThumb';
import { cn } from '@/lib/utils';

const CATS: Category[] = ['brick', 'plate', 'tile'];

/** 左侧面板: 砖块库 */
export function BrickLibrary() {
  const [cat, setCat] = useState<Category>('brick');
  const selectedType = useStudio((s) => s.selectedType);
  const selectedColor = useStudio((s) => s.selectedColor);
  const setSelectedType = useStudio((s) => s.setSelectedType);

  const hex = COLOR_MAP[selectedColor]?.hex ?? '#C91A09';
  const list = BRICK_TYPES.filter((t) => t.category === cat);

  return (
    <aside className="w-[212px] shrink-0 flex flex-col border-r border-white/10 bg-[#141822]/95">
      <div className="px-3 pt-3 pb-2">
        <h2 className="text-xs font-semibold tracking-widest text-neutral-400">
          砖块库
        </h2>
      </div>
      {/* 分类标签 */}
      <div className="px-3 flex gap-1">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              cat === c
                ? 'bg-amber-400/90 text-neutral-900'
                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200',
            )}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      {/* 砖块列表 */}
      <div className="mt-2 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
        <div className="grid grid-cols-3 gap-1.5">
          {list.map((t) => {
            const active = t.id === selectedType;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                title={t.name}
                className={cn(
                  'group flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-all',
                  active
                    ? 'border-amber-400/80 bg-amber-400/10'
                    : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]',
                )}
              >
                <div className="flex h-11 items-center justify-center">
                  <BrickThumb type={t} hex={hex} size={40} />
                </div>
                <span
                  className={cn(
                    'text-[10px] leading-none',
                    active ? 'text-amber-300' : 'text-neutral-500 group-hover:text-neutral-300',
                  )}
                >
                  {t.w}×{t.d}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="border-t border-white/10 px-3 py-2 text-[10px] leading-relaxed text-neutral-500">
        选中砖块后，在底板上点击放置；按 <kbd className="rounded bg-white/10 px-1 text-neutral-300">R</kbd> 旋转
      </div>
    </aside>
  );
}
