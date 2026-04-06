import React, { useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function OrbitalViewer({ type = '1s' }) {
  const count = 5000; // 点云数量

  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x, y, z, r, theta, phi;
      
      // 简单的概率密度模拟逻辑
      if (type === '1s') {
        // 球形分布
        r = -Math.log(Math.random()) * 1.5;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      } else if (type === '2p') {
        // 哑铃形分布 (沿 Z 轴)
        r = -Math.log(Math.random()) * 2;
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(Math.pow(Math.random() * 2 - 1, 3)); // 增强两极分布
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }
      
      p.set([x, y, z], i * 3);
    }
    return p;
  }, [type]);

  return (
    <Points positions={points} stride={3}>
      <PointMaterial
        transparent
        color={type === '1s' ? "#60a5fa" : "#f87171"}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}