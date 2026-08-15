import * as THREE from 'three';
import type { BrickType } from '@/lib/lego';
import { GAP, PLATE, STUD_R, STUD_H } from '@/lib/lego';

// 材质缓存: 每个颜色一个共享 PBR 材质
const matCache = new Map<string, THREE.MeshStandardMaterial>();

export function materialFor(hex: string): THREE.MeshStandardMaterial {
  let m = matCache.get(hex);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: hex,
      roughness: 0.32,
      metalness: 0.04,
    });
    matCache.set(hex, m);
  }
  return m;
}

// 幽灵预览材质
export const ghostOkMat = new THREE.MeshStandardMaterial({
  color: '#3ddc84',
  transparent: true,
  opacity: 0.55,
  roughness: 0.4,
  depthWrite: false,
});
export const ghostBadMat = new THREE.MeshStandardMaterial({
  color: '#ef4444',
  transparent: true,
  opacity: 0.5,
  roughness: 0.4,
  depthWrite: false,
});

// 悬停高亮(擦除/填色/取样时)
export const hoverMat = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});

// 盒体几何缓存(按砖型)
const geoCache = new Map<string, THREE.BoxGeometry>();

export function boxGeoFor(type: BrickType): THREE.BoxGeometry {
  const key = `${type.w}x${type.d}x${type.h}`;
  let g = geoCache.get(key);
  if (!g) {
    g = new THREE.BoxGeometry(
      type.w - GAP,
      type.h * PLATE,
      type.d - GAP,
    );
    geoCache.set(key, g);
  }
  return g;
}

// 共享凸点几何
export const studGeo = new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, 20);

/** 计算某砖型所有凸点的局部位移矩阵(盒体中心为原点) */
export function studMatrices(type: BrickType): THREE.Matrix4[] {
  const mats: THREE.Matrix4[] = [];
  const topY = (type.h * PLATE) / 2 + STUD_H / 2;
  for (let j = 0; j < type.d; j++) {
    for (let i = 0; i < type.w; i++) {
      const m = new THREE.Matrix4();
      m.makeTranslation(i - type.w / 2 + 0.5, topY, j - type.d / 2 + 0.5);
      mats.push(m);
    }
  }
  return mats;
}
