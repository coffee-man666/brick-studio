import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const ROWS: { keys: string; desc: string }[] = [
  { keys: 'B / E / P / I', desc: '切换 搭建 / 擦除 / 填色 / 取样 工具' },
  { keys: 'R', desc: '旋转手中砖块 90°' },
  { keys: 'L', desc: '锁定 / 解锁视角（锁定后无法旋转、平移、缩放）' },
  { keys: 'Ctrl + Z', desc: '撤销' },
  { keys: 'Ctrl + Shift + Z / Ctrl + Y', desc: '重做' },
  { keys: 'Ctrl + S', desc: '保存到浏览器' },
  { keys: 'Delete / Backspace', desc: '删除指针下的砖块' },
  { keys: '鼠标左键拖动', desc: '旋转视角' },
  { keys: '鼠标右键拖动', desc: '平移视角' },
  { keys: '滚轮', desc: '缩放视角' },
  { keys: '右键点击砖块', desc: '快速删除该砖块' },
];

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#161b26] text-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">操作指南</DialogTitle>
          <DialogDescription className="text-neutral-400">
            在底板上点击即可放置砖块；砖块会自动吸附网格并堆叠到已有砖块上。
            放置位置需要平整的支撑面，红色预览表示当前位置不可放置。
          </DialogDescription>
        </DialogHeader>
        <div className="mt-1 divide-y divide-white/5 rounded-lg border border-white/10">
          {ROWS.map((r) => (
            <div key={r.keys} className="flex items-center justify-between gap-4 px-3 py-2 text-xs">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-amber-300">
                {r.keys}
              </kbd>
              <span className="flex-1 text-right text-neutral-300">{r.desc}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
          作品会自动保存在浏览器中，下次打开自动恢复；也可通过顶栏导出 / 导入 .json 文件分享作品。
        </p>
      </DialogContent>
    </Dialog>
  );
}
