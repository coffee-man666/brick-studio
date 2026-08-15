import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { PlacedBrick } from '@/lib/lego';
import { BRICK_MAP, COLOR_MAP, brickWorld } from '@/lib/lego';
import { boxGeoFor, hoverMat, materialFor, studGeo, studMatrices } from './resources';

interface Props {
  brick: PlacedBrick;
  hovered: boolean;
  interactive: boolean;
  onSurfaceMove: (e: ThreeEvent<PointerEvent>, brickId: string | null) => void;
  onSurfaceClick: (e: ThreeEvent<MouseEvent>, brickId: string | null) => void;
  onSurfaceContext: (e: ThreeEvent<MouseEvent>, brickId: string | null) => void;
  onSurfaceOut: () => void;
}

export const BrickMesh = memo(function BrickMesh({
  brick,
  hovered,
  interactive,
  onSurfaceMove,
  onSurfaceClick,
  onSurfaceContext,
  onSurfaceOut,
}: Props) {
  const type = BRICK_MAP[brick.type];
  const instRef = useRef<THREE.InstancedMesh>(null);

  const studs = useMemo(() => (type?.studs ? studMatrices(type) : []), [type]);

  useLayoutEffect(() => {
    const inst = instRef.current;
    if (!inst || studs.length === 0) return;
    studs.forEach((m, i) => inst.setMatrixAt(i, m));
    inst.instanceMatrix.needsUpdate = true;
  }, [studs]);

  if (!type) return null;
  const pos = brickWorld(type, brick.gx, brick.gz, brick.level, brick.rot);
  const hex = COLOR_MAP[brick.color]?.hex ?? '#cccccc';

  const handlers = interactive
    ? {
        onPointerMove: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onSurfaceMove(e, brick.id);
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSurfaceClick(e, brick.id);
        },
        onContextMenu: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSurfaceContext(e, brick.id);
        },
        onPointerOut: () => onSurfaceOut(),
      }
    : {};

  return (
    <group
      position={[pos.x, pos.y, pos.z]}
      rotation={[0, (-brick.rot * Math.PI) / 2, 0]}
    >
      <mesh
        geometry={boxGeoFor(type)}
        material={materialFor(hex)}
        castShadow
        receiveShadow
        {...handlers}
      />
      {studs.length > 0 && (
        <instancedMesh
          ref={instRef}
          args={[studGeo, materialFor(hex), studs.length]}
          castShadow
          receiveShadow
          {...handlers}
        />
      )}
      {hovered && (
        <mesh geometry={boxGeoFor(type)} material={hoverMat} scale={1.04} />
      )}
    </group>
  );
});
