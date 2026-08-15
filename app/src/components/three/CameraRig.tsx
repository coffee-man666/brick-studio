import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { ViewName } from '@/store';
import { useStudio } from '@/store';

const VIEWS: Record<ViewName, [number, number, number]> = {
  iso: [26, 23, 26],
  top: [0.01, 44, 0.01],
  front: [0, 10, 34],
  right: [34, 10, 0.01],
};

/** 响应视角切换请求, 平滑移动相机 */
export function CameraRig() {
  const viewRequest = useStudio((s) => s.viewRequest);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { addEventListener?: Function; removeEventListener?: Function } | null;
  const dest = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (viewRequest) dest.current = new THREE.Vector3(...VIEWS[viewRequest.name]);
  }, [viewRequest]);

  // 用户开始拖拽时取消动画
  useEffect(() => {
    if (!controls?.addEventListener) return;
    const cancel = () => {
      dest.current = null;
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener?.('start', cancel);
  }, [controls]);

  useFrame(() => {
    if (!dest.current) return;
    camera.position.lerp(dest.current, 0.12);
    if (camera.position.distanceTo(dest.current) < 0.1) dest.current = null;
  });

  return null;
}
