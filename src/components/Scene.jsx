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
  return (
    <>
      <ambientLight intensity={colorTheme === 'neon' ? 0.4 : 0.8} />
      <directionalLight 
        position={[6, 12, 6]} 
        intensity={colorTheme === 'neon' ? 0.6 : 1.4} 
        castShadow 
      />
      <pointLight 
        position={[-6, 6, -3]} 
        intensity={colorTheme === 'neon' ? 2.0 : 0.6} 
        color={colorTheme === 'neon' ? '#ff00ff' : '#ffffff'} 
      />
      <pointLight 
        position={[6, 6, 3]} 
        intensity={colorTheme === 'neon' ? 2.0 : 0.6} 
        color={colorTheme === 'neon' ? '#00ffff' : '#ffffff'} 
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

        {/* 床 */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, -4.5, 0]} restitution={0.2} friction={0.65}>
          <mesh receiveShadow>
            <boxGeometry args={[16, 0.5, 3]} />
            <meshPhysicalMaterial 
              color={colorTheme === 'neon' ? '#111827' : '#f3f4f6'} 
              roughness={colorTheme === 'neon' ? 0.3 : 0.15}
              metalness={colorTheme === 'neon' ? 0.85 : 0.05}
              transmission={colorTheme === 'neon' ? 0.1 : 0.75}
              thickness={0.5}
              ior={1.4}
            />
          </mesh>
        </RigidBody>

        {/* 左壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[-6.5, 2, 0]} restitution={0.1}>
          <mesh visible={false}>
            <boxGeometry args={[0.5, 14, 3]} />
          </mesh>
        </RigidBody>

        {/* 右壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[6.5, 2, 0]} restitution={0.1}>
          <mesh visible={false}>
            <boxGeometry args={[0.5, 14, 3]} />
          </mesh>
        </RigidBody>

        {/* 奥壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 2, -1.2]} restitution={0.1}>
          <mesh visible={false}>
            <boxGeometry args={[16, 14, 0.5]} />
          </mesh>
        </RigidBody>

        {/* 手前壁 */}
        <RigidBody type="fixed" colliders="cuboid" position={[0, 2, 1.2]} restitution={0.1}>
          <mesh visible={false}>
            <boxGeometry args={[16, 14, 0.5]} />
          </mesh>
        </RigidBody>
      </Physics>
    </>
  );
};
