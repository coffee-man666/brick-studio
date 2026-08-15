import { useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  BRICK_MAP,
  computeHeights,
  pointToCellFloat,
  resolvePlacement,
} from '@/lib/lego';
import { useStudio } from '@/store';
import { Baseplate } from './Baseplate';
import { BrickMesh } from './BrickMesh';
import { GhostBrick } from './GhostBrick';
import { CameraRig } from './CameraRig';

/** 判断命中面是否为"上表面" */
function isTopFace(e: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>): boolean {
  if (!e.face) return true;
  const n = e.face.normal.clone().transformDirection(e.object.matrixWorld);
  return n.y > 0.5;
}

export function Scene() {
  const bricks = useStudio((s) => s.bricks);
  const hover = useStudio((s) => s.hover);
  const tool = useStudio((s) => s.tool);
  const selectedType = useStudio((s) => s.selectedType);
  const rotation = useStudio((s) => s.rotation);
  const setHover = useStudio((s) => s.setHover);

  const heights = useMemo(() => computeHeights(bricks), [bricks]);

  const handleMove = useCallback(
    (e: ThreeEvent<PointerEvent>, brickId: string | null) => {
      if (!isTopFace(e)) return;
      const { fx, fz } = pointToCellFloat(e.point.x, e.point.z);
      setHover({ fx, fz, brickId });
    },
    [setHover],
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>, brickId: string | null) => {
      if (e.delta > 6) return; // 视为拖拽视角
      if (!isTopFace(e)) return;
      const st = useStudio.getState();
      const { fx, fz } = pointToCellFloat(e.point.x, e.point.z);
      switch (st.tool) {
        case 'place': {
          const t = BRICK_MAP[st.selectedType];
          if (!t) return;
          const p = resolvePlacement(t, st.rotation, fx, fz, computeHeights(st.bricks));
          if (p.ok) st.placeBrick(p.gx, p.gz, p.level);
          else st.showToast('此处无法放置：需要平整的支撑面');
          break;
        }
        case 'erase':
          if (brickId) st.eraseBrick(brickId);
          break;
        case 'paint':
          if (brickId) st.paintBrick(brickId);
          break;
        case 'picker':
          if (brickId) st.pickBrick(brickId);
          break;
      }
    },
    [],
  );

  const handleContext = useCallback(
    (e: ThreeEvent<MouseEvent>, brickId: string | null) => {
      if (e.delta > 6 || !brickId) return;
      useStudio.getState().eraseBrick(brickId); // 右键快速删除
    },
    [],
  );

  const handleOut = useCallback(() => setHover(null), [setHover]);

  // 幽灵预览
  const ghost = useMemo(() => {
    if (tool !== 'place' || !hover) return null;
    const t = BRICK_MAP[selectedType];
    if (!t) return null;
    const p = resolvePlacement(t, rotation, hover.fx, hover.fz, heights);
    return { type: t, ...p };
  }, [tool, hover, selectedType, rotation, heights]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [26, 23, 26], fov: 38, near: 0.1, far: 400 }}
      onPointerLeave={handleOut}
    >
      <color attach="background" args={['#0e1117']} />
      <fog attach="fog" args={['#0e1117', 70, 160]} />

      <hemisphereLight args={['#cdd7e1', '#3a3f4a', 0.75]} />
      <directionalLight
        position={[16, 26, 12]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-14, 10, -14]} intensity={0.45} />

      <Baseplate
        onSurfaceMove={handleMove}
        onSurfaceClick={handleClick}
        onSurfaceOut={handleOut}
      />

      {bricks.map((b) => (
        <BrickMesh
          key={b.id}
          brick={b}
          interactive
          hovered={tool !== 'place' && hover?.brickId === b.id}
          onSurfaceMove={handleMove}
          onSurfaceClick={handleClick}
          onSurfaceContext={handleContext}
          onSurfaceOut={handleOut}
        />
      ))}

      {ghost && (
        <GhostBrick
          type={ghost.type}
          rot={rotation}
          gx={ghost.gx}
          gz={ghost.gz}
          level={ghost.level}
          ok={ghost.ok}
        />
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.09}
        minDistance={6}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2 - 0.04}
        target={[0, 0, 0]}
      />
      <CameraRig />
    </Canvas>
  );
}
