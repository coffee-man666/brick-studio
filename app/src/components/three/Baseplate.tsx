import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { GRID, STUD_H } from '@/lib/lego';
import { studGeo } from './resources';

const PLATE_THICK = 0.5;

interface Props {
  onSurfaceMove: (e: ThreeEvent<PointerEvent>, brickId: string | null) => void;
  onSurfaceClick: (e: ThreeEvent<MouseEvent>, brickId: string | null) => void;
  onSurfaceOut: () => void;
}

/** 底板: 绿色基板 + 凸点阵列 + 地面 */
export function Baseplate({ onSurfaceMove, onSurfaceClick, onSurfaceOut }: Props) {
  const instRef = useRef<THREE.InstancedMesh>(null);

  const matrices = useMemo(() => {
    const arr: THREE.Matrix4[] = [];
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        const m = new THREE.Matrix4();
        m.makeTranslation(i - GRID / 2 + 0.5, STUD_H / 2, j - GRID / 2 + 0.5);
        arr.push(m);
      }
    }
    return arr;
  }, []);

  useLayoutEffect(() => {
    const inst = instRef.current;
    if (!inst) return;
    matrices.forEach((m, i) => inst.setMatrixAt(i, m));
    inst.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  const boardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1f7a33',
        roughness: 0.42,
        metalness: 0.03,
      }),
    [],
  );

  return (
    <group>
      {/* 底板主体 */}
      <mesh
        position={[0, -PLATE_THICK / 2, 0]}
        material={boardMat}
        receiveShadow
        onPointerMove={(e) => {
          e.stopPropagation();
          onSurfaceMove(e, null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSurfaceClick(e, null);
        }}
        onPointerOut={onSurfaceOut}
      >
        <boxGeometry args={[GRID, PLATE_THICK, GRID]} />
      </mesh>
      {/* 底板凸点 */}
      <instancedMesh
        ref={instRef}
        args={[studGeo, boardMat, matrices.length]}
        receiveShadow
        onPointerMove={(e) => {
          e.stopPropagation();
          onSurfaceMove(e, null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSurfaceClick(e, null);
        }}
        onPointerOut={onSurfaceOut}
      />
      {/* 地面 */}
      <mesh position={[0, -PLATE_THICK - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#12151d" roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}
