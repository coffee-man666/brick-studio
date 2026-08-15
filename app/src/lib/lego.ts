// ============================================================
// 积木工坊 - 核心数据模型与规则
// 单位约定:
//   - 1 个凸点间距 (stud pitch) = 1 世界单位
//   - 高度以"板 (plate)"计: 1 板 = 0.4 单位, 标准砖 = 3 板
//   - 网格: GRID x GRID 个凸点, 底板顶面位于 y = 0
// ============================================================

export const GRID = 32; // 底板边长(凸点数)
export const PLATE = 0.4; // 一板的高度(世界单位)
export const STUD_R = 0.3; // 凸点半径
export const STUD_H = 0.2; // 凸点高度
export const GAP = 0.04; // 砖块间视觉缝隙
export const MAX_LEVEL = 64; // 最大搭建高度(板)

export type Rotation = 0 | 1 | 2 | 3;
export type Category = 'brick' | 'plate' | 'tile';

export interface BrickType {
  id: string;
  name: string;
  w: number; // 宽(凸点, rot=0 时沿 x)
  d: number; // 深(凸点, rot=0 时沿 z)
  h: number; // 高(板)
  studs: boolean; // 顶面是否有凸点
  category: Category;
}

export interface LegoColor {
  id: string;
  name: string;
  hex: string;
}

export interface PlacedBrick {
  id: string;
  type: string; // BrickType.id
  color: string; // LegoColor.id
  gx: number; // 锚点格子 x (最小角)
  gz: number; // 锚点格子 z
  level: number; // 底面高度(板)
  rot: Rotation;
}

// ------------------------------------------------------------
// 砖块目录
// ------------------------------------------------------------
const B = (w: number, d: number): BrickType => ({
  id: `b${w}x${d}`,
  name: `${w}×${d} 砖`,
  w,
  d,
  h: 3,
  studs: true,
  category: 'brick',
});
const P = (w: number, d: number): BrickType => ({
  id: `p${w}x${d}`,
  name: `${w}×${d} 板`,
  w,
  d,
  h: 1,
  studs: true,
  category: 'plate',
});
const T = (w: number, d: number): BrickType => ({
  id: `t${w}x${d}`,
  name: `${w}×${d} 光面`,
  w,
  d,
  h: 1,
  studs: false,
  category: 'tile',
});

export const BRICK_TYPES: BrickType[] = [
  // 标准砖
  B(1, 1), B(1, 2), B(1, 3), B(1, 4), B(1, 6), B(1, 8),
  B(2, 2), B(2, 3), B(2, 4), B(2, 6), B(2, 8),
  // 薄板
  P(1, 1), P(1, 2), P(1, 3), P(1, 4), P(1, 6),
  P(2, 2), P(2, 3), P(2, 4), P(2, 6), P(4, 4), P(4, 6), P(6, 6),
  // 光面板
  T(1, 1), T(1, 2), T(1, 3), T(1, 4), T(1, 6), T(2, 2), T(2, 4),
];

export const BRICK_MAP: Record<string, BrickType> = Object.fromEntries(
  BRICK_TYPES.map((t) => [t.id, t]),
);

export const CATEGORY_LABEL: Record<Category, string> = {
  brick: '砖块',
  plate: '薄板',
  tile: '光面板',
};

// ------------------------------------------------------------
// 颜色目录(经典乐高色)
// ------------------------------------------------------------
export const COLORS: LegoColor[] = [
  { id: 'white', name: '白色', hex: '#FFFFFF' },
  { id: 'lgray', name: '浅灰', hex: '#A0A5A9' },
  { id: 'dgray', name: '深灰', hex: '#6C6E68' },
  { id: 'black', name: '黑色', hex: '#21262B' },
  { id: 'red', name: '红色', hex: '#C91A09' },
  { id: 'dred', name: '深红', hex: '#720E0F' },
  { id: 'orange', name: '橙色', hex: '#FE8A18' },
  { id: 'yellow', name: '黄色', hex: '#F2CD37' },
  { id: 'tan', name: '米色', hex: '#E4CD9E' },
  { id: 'brown', name: '棕色', hex: '#582A12' },
  { id: 'lime', name: '黄绿', hex: '#A5CA18' },
  { id: 'green', name: '绿色', hex: '#237841' },
  { id: 'bgreen', name: '亮绿', hex: '#4B9F4A' },
  { id: 'blue', name: '蓝色', hex: '#0055BF' },
  { id: 'dblue', name: '深蓝', hex: '#0A3463' },
  { id: 'sky', name: '天蓝', hex: '#9BC4E2' },
  { id: 'purple', name: '紫色', hex: '#81007B' },
  { id: 'pink', name: '粉色', hex: '#FC97AC' },
];

export const COLOR_MAP: Record<string, LegoColor> = Object.fromEntries(
  COLORS.map((c) => [c.id, c]),
);

// ------------------------------------------------------------
// 几何/网格工具
// ------------------------------------------------------------

/** 旋转后的有效占地 */
export function footprint(type: BrickType, rot: Rotation): { w: number; d: number } {
  return rot % 2 === 0 ? { w: type.w, d: type.d } : { w: type.d, d: type.w };
}

/** 格子 i 中心的世界坐标(一维) */
export function cellCenter(i: number): number {
  return i - GRID / 2 + 0.5;
}

/** 砖块中心的世界坐标 */
export function brickWorld(
  type: BrickType,
  gx: number,
  gz: number,
  level: number,
  rot: Rotation,
): { x: number; y: number; z: number } {
  const { w, d } = footprint(type, rot);
  return {
    x: gx + w / 2 - GRID / 2,
    z: gz + d / 2 - GRID / 2,
    y: (level + type.h / 2) * PLATE,
  };
}

/** 世界坐标 -> 连续格子坐标(未取整) */
export function pointToCellFloat(x: number, z: number): { fx: number; fz: number } {
  return { fx: x + GRID / 2, fz: z + GRID / 2 };
}

/** 由高度表重建: heights[j][i] = 该列已堆到的板数 */
export function computeHeights(bricks: PlacedBrick[]): number[][] {
  const h: number[][] = Array.from({ length: GRID }, () => new Array(GRID).fill(0));
  const sorted = [...bricks].sort((a, b) => a.level - b.level);
  for (const b of sorted) {
    const t = BRICK_MAP[b.type];
    if (!t) continue;
    const { w, d } = footprint(t, b.rot);
    const top = b.level + t.h;
    for (let j = b.gz; j < b.gz + d; j++) {
      for (let i = b.gx; i < b.gx + w; i++) {
        if (i >= 0 && i < GRID && j >= 0 && j < GRID) h[j][i] = top;
      }
    }
  }
  return h;
}

export interface PlacementResult {
  ok: boolean;
  gx: number;
  gz: number;
  level: number;
}

/**
 * 由连续命中点计算放置结果。
 * 规则: 占地完全在底板内, 且占地内所有列高度一致(平稳支撑), 不超过最大高度。
 */
export function resolvePlacement(
  type: BrickType,
  rot: Rotation,
  fx: number,
  fz: number,
  heights: number[][],
): PlacementResult {
  const { w, d } = footprint(type, rot);
  let gx = Math.round(fx - w / 2);
  let gz = Math.round(fz - d / 2);
  gx = Math.max(0, Math.min(GRID - w, gx));
  gz = Math.max(0, Math.min(GRID - d, gz));

  let level = -1;
  let ok = true;
  for (let j = gz; j < gz + d && ok; j++) {
    for (let i = gx; i < gx + w && ok; i++) {
      const c = heights[j][i];
      if (level === -1) level = c;
      else if (c !== level) ok = false; // 支撑不平整
    }
  }
  if (level === -1) level = 0;
  if (level + type.h > MAX_LEVEL) ok = false;
  return { ok, gx, gz, level };
}

// ------------------------------------------------------------
// 序列化
// ------------------------------------------------------------
export interface SaveFile {
  app: 'brickcraft';
  version: 1;
  savedAt: string;
  bricks: PlacedBrick[];
}

export function serialize(bricks: PlacedBrick[]): string {
  const data: SaveFile = {
    app: 'brickcraft',
    version: 1,
    savedAt: new Date().toISOString(),
    bricks,
  };
  return JSON.stringify(data, null, 2);
}

export function deserialize(json: string): PlacedBrick[] {
  const data = JSON.parse(json) as Partial<SaveFile>;
  if (data.app !== 'brickcraft' || !Array.isArray(data.bricks)) {
    throw new Error('无法识别的文件格式');
  }
  // 校验并过滤非法数据
  const valid = data.bricks.filter(
    (b) =>
      b &&
      typeof b.id === 'string' &&
      BRICK_MAP[b.type] &&
      COLOR_MAP[b.color] &&
      Number.isInteger(b.gx) &&
      Number.isInteger(b.gz) &&
      Number.isInteger(b.level) &&
      [0, 1, 2, 3].includes(b.rot),
  );
  return valid;
}

let counter = 0;
export function newBrickId(): string {
  counter += 1;
  return `bk_${Date.now().toString(36)}_${counter}`;
}
