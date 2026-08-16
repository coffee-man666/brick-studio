import { create } from 'zustand';
import type { PlacedBrick, Rotation } from '@/lib/lego';
import { newBrickId, serialize, deserialize } from '@/lib/lego';

export type Tool = 'place' | 'erase' | 'paint' | 'picker';
export type ViewName = 'iso' | 'top' | 'front' | 'right';

const STORAGE_KEY = 'brickcraft-save-v1';
const HISTORY_LIMIT = 80;

interface HoverInfo {
  fx: number; // 连续格子坐标
  fz: number;
  brickId: string | null; // 指针下的已放置砖块
}

interface StudioState {
  bricks: PlacedBrick[];
  tool: Tool;
  selectedType: string;
  selectedColor: string;
  rotation: Rotation;
  hover: HoverInfo | null;
  past: PlacedBrick[][];
  future: PlacedBrick[][];
  viewRequest: { name: ViewName; ts: number } | null;
  viewLocked: boolean;
  toast: string | null;

  setTool: (t: Tool) => void;
  setSelectedType: (id: string) => void;
  setSelectedColor: (id: string) => void;
  rotateGhost: () => void;
  setHover: (h: HoverInfo | null) => void;
  placeBrick: (gx: number, gz: number, level: number) => void;
  eraseBrick: (id: string) => void;
  paintBrick: (id: string) => void;
  pickBrick: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  requestView: (v: ViewName) => void;
  toggleViewLock: () => void;
  saveLocal: () => void;
  loadLocal: () => boolean;
  exportFile: () => void;
  importFile: (json: string) => boolean;
  showToast: (msg: string) => void;
}

function snapshotPush(past: PlacedBrick[][], bricks: PlacedBrick[]): PlacedBrick[][] {
  const next = [...past, bricks];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useStudio = create<StudioState>()((set, get) => ({
  bricks: [],
  tool: 'place',
  selectedType: 'b2x4',
  selectedColor: 'red',
  rotation: 0,
  hover: null,
  past: [],
  future: [],
  viewRequest: null,
  viewLocked: false,
  toast: null,

  setTool: (tool) => set({ tool }),
  setSelectedType: (selectedType) => set({ selectedType, tool: 'place' }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  rotateGhost: () => set((s) => ({ rotation: ((s.rotation + 1) % 4) as Rotation })),
  setHover: (hover) => set({ hover }),

  placeBrick: (gx, gz, level) =>
    set((s) => ({
      past: snapshotPush(s.past, s.bricks),
      future: [],
      bricks: [
        ...s.bricks,
        {
          id: newBrickId(),
          type: s.selectedType,
          color: s.selectedColor,
          gx,
          gz,
          level,
          rot: s.rotation,
        },
      ],
    })),

  eraseBrick: (id) =>
    set((s) => {
      if (!s.bricks.some((b) => b.id === id)) return s;
      return {
        past: snapshotPush(s.past, s.bricks),
        future: [],
        bricks: s.bricks.filter((b) => b.id !== id),
      };
    }),

  paintBrick: (id) =>
    set((s) => {
      const target = s.bricks.find((b) => b.id === id);
      if (!target || target.color === s.selectedColor) return s;
      return {
        past: snapshotPush(s.past, s.bricks),
        future: [],
        bricks: s.bricks.map((b) =>
          b.id === id ? { ...b, color: s.selectedColor } : b,
        ),
      };
    }),

  pickBrick: (id) =>
    set((s) => {
      const target = s.bricks.find((b) => b.id === id);
      if (!target) return s;
      return {
        selectedType: target.type,
        selectedColor: target.color,
        tool: 'place',
      };
    }),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1];
      return {
        bricks: prev,
        past: s.past.slice(0, -1),
        future: [s.bricks, ...s.future].slice(0, HISTORY_LIMIT),
      };
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      return {
        bricks: next,
        past: snapshotPush(s.past, s.bricks),
        future: rest,
      };
    }),

  clearAll: () =>
    set((s) =>
      s.bricks.length === 0
        ? s
        : { past: snapshotPush(s.past, s.bricks), future: [], bricks: [] },
    ),

  requestView: (name) => {
    // 锁定视角时冻结相机, 忽略机位切换请求
    if (get().viewLocked) return;
    set({ viewRequest: { name, ts: Date.now() } });
  },

  toggleViewLock: () =>
    set((s) => {
      const viewLocked = !s.viewLocked;
      return { viewLocked, viewRequest: viewLocked ? null : s.viewRequest };
    }),

  saveLocal: () => {
    try {
      localStorage.setItem(STORAGE_KEY, serialize(get().bricks));
      get().showToast('已保存到本地浏览器');
    } catch {
      get().showToast('保存失败');
    }
  },

  loadLocal: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const bricks = deserialize(raw);
      set((s) => ({ past: snapshotPush(s.past, s.bricks), future: [], bricks }));
      return true;
    } catch {
      return false;
    }
  },

  exportFile: () => {
    const json = serialize(get().bricks);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `积木工坊作品_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    get().showToast('已导出作品文件');
  },

  importFile: (json) => {
    try {
      const bricks = deserialize(json);
      set((s) => ({ past: snapshotPush(s.past, s.bricks), future: [], bricks }));
      get().showToast(`已导入 ${bricks.length} 块积木`);
      return true;
    } catch {
      get().showToast('导入失败: 文件格式不正确');
      return false;
    }
  },

  showToast: (msg) => {
    set({ toast: msg });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2200);
  },
}));

// 启动时自动恢复上次作品
export function restoreOnBoot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const bricks = deserialize(raw);
      if (bricks.length > 0) useStudio.setState({ bricks });
    }
  } catch {
    /* 忽略损坏的存档 */
  }
}

// 自动保存(防抖)
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
useStudio.subscribe((state, prev) => {
  if (state.bricks === prev.bricks) return;
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serialize(useStudio.getState().bricks));
    } catch {
      /* 存储空间不足等情况忽略 */
    }
  }, 800);
});
