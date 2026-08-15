import type { BrickType } from '@/lib/lego';

/** 砖块 2D 俯视图缩略图 */
export function BrickThumb({
  type,
  hex,
  size = 44,
}: {
  type: BrickType;
  hex: string;
  size?: number;
}) {
  const cell = Math.min(size / type.w, size / type.d);
  const w = Math.max(6, Math.round(type.w * cell));
  const h = Math.max(6, Math.round(type.d * cell));
  const dot = Math.max(3, cell * 0.52);

  return (
    <div
      className="rounded-[3px] shadow-inner"
      style={{
        width: w,
        height: h,
        backgroundColor: hex,
        backgroundImage: type.studs
          ? `radial-gradient(circle, rgba(255,255,255,0.35) ${dot * 0.32}px, rgba(0,0,0,0.14) ${dot * 0.42}px, transparent ${dot * 0.5}px)`
          : undefined,
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.18)',
      }}
    />
  );
}
