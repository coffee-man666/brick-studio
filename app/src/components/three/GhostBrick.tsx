import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BrickType, Rotation } from '@/lib/lego';
import { brickWorld } from '@/lib/lego';
import { boxGeoFor, ghostBadMat, ghostOkMat, studGeo, studMatrices } from './resources';

interface Props {
  type: BrickType;
  rot: Rotation;
  gx: number;
  gz: number;
  level: number;
  ok: boolean;
}

/** 放置预览(幽灵砖块) */
export function GhostBrick({ type, rot, gx, gz, level, ok }: Props) {
  const instRef = useRef<THREE.InstancedMesh>(null);
  const studs = useMemo(() => (type.studs ? studMatrices(type) : []), [type]);

  useLayoutEffect(() => {
    const inst = instRef.current;
    if (!inst || studs.length === 0) return;
    studs.forEach((m, i) => inst.setMatrixAt(i, m));
    inst.instanceMatrix.needsUpdate = true;
  }, [studs]);

  const pos = brickWorld(type, gx, gz, level, rot);
  const mat = ok ? ghostOkMat : ghostBadMat;

  return (
    <group position={[pos.x, pos.y, pos.z]} rotation={[0, (-rot * Math.PI) / 2, 0]}>
      <mesh geometry={boxGeoFor(type)} material={mat} />
      {studs.length > 0 && (
        <instancedMesh ref={instRef} args={[studGeo, mat, studs.length]} />
      )}
    </group>
  );
}
