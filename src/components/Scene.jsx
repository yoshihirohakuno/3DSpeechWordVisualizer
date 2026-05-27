import React from 'react';
import { Physics, RigidBody } from '@react-three/rapier';
import { OrbitControls } from '@react-three/drei';
import { FallingWord } from './FallingWord';

export const Scene = ({
  words,
  colorTheme,
  fontSize,
  bounciness,
  gravity,
  onDestroyWord
}) => {
  // 壁のアクリルマテリアルの共通設定
  const wallMaterialProps = {
    color: colorTheme === 'neon' ? '#00f0ff' : '#60a5fa',
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.75, // 高い透明度で文字が透けて見えるようにします
    thickness: 0.3,
    ior: 1.45,
    transparent: true,
    opacity: colorTheme === 'neon' ? 0.3 : 0.4
  };

  return (
    <>
      <ambientLight intensity={colorTheme === 'neon' ? 0.45 : 0.85} />
      <directionalLight 
        position={[6, 12, 6]} 
        intensity={colorTheme === 'neon' ? 0.75 : 1.4} 
        castShadow 
      />
      <pointLight 
        position={[-6, 6, -3]} 
        intensity={colorTheme === 'neon' ? 2.2 : 0.7} 
        color={colorTheme === 'neon' ? '#ff007f' : '#ffffff'} 
      />
      <pointLight 
        position={[6, 6, 3]} 
        intensity={colorTheme === 'neon' ? 2.2 : 0.7} 
        color={colorTheme === 'neon' ? '#00f0ff' : '#ffffff'} 
      />

      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        minDistance={5} 
        maxDistance={25}
        makeDefault
      />

      <Physics gravity={[0, gravity, 0]}>
        {words.map((w) => (
          <FallingWord
            key={w.id}
            id={w.id}
            word={w.word}
            pos={w.pos}
            colorTheme={colorTheme}
            speakerId={w.speakerId}
            fontSize={fontSize}
            bounciness={bounciness}
            initialPos={w.initialPos}
            onDestroy={onDestroyWord}
          />
        ))}

        {/* テーブル（床）: サイズをアクリル壁とぴったり合わせるため調整 */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, -4.5, 0]} restitution={0.2} friction={0.65}>
          <mesh receiveShadow>
            <boxGeometry args={[12, 0.5, 2.4]} />
            <meshPhysicalMaterial 
              color={colorTheme === 'neon' ? '#111827' : '#f1f5f9'} 
              roughness={colorTheme === 'neon' ? 0.25 : 0.15}
              metalness={colorTheme === 'neon' ? 0.85 : 0.1}
              transmission={colorTheme === 'neon' ? 0.15 : 0.8}
              thickness={0.5}
              ior={1.42}
            />
          </mesh>
        </RigidBody>

        {/* 左側のアクリル壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[-6.0, 0.25, 0]} restitution={0.1}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.2, 9, 2.4]} />
            <meshPhysicalMaterial {...wallMaterialProps} />
          </mesh>
        </RigidBody>

        {/* 右側のアクリル壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[6.0, 0.25, 0]} restitution={0.1}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.2, 9, 2.4]} />
            <meshPhysicalMaterial {...wallMaterialProps} />
          </mesh>
        </RigidBody>

        {/* 奥側のアクリル壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, -1.2]} restitution={0.1}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[12, 9, 0.2]} />
            <meshPhysicalMaterial {...wallMaterialProps} />
          </mesh>
        </RigidBody>

        {/* 手前の見えない壁（文字が手前にこぼれ落ちるのを物理的に防ぎつつ、視界を遮らない） */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 0.25, 1.2]} restitution={0.1}>
          <mesh visible={false}>
            <boxGeometry args={[12, 9, 0.2]} />
          </mesh>
        </RigidBody>
      </Physics>
    </>
  );
};
