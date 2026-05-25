import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const getThemeColors = (pos, theme, speakerId) => {
  const speakerColors = [
    { bgStart: 'rgba(59, 130, 246, 0.2)', bgEnd: 'rgba(37, 99, 235, 0.45)', text: '#ffffff', border: '#60a5fa', shadow: '#3b82f6' }, // 話者1 (青)
    { bgStart: 'rgba(236, 72, 153, 0.2)', bgEnd: 'rgba(219, 39, 119, 0.45)', text: '#ffffff', border: '#f472b6', shadow: '#ec4899' }, // 話者2 (ピンク)
    { bgStart: 'rgba(16, 185, 129, 0.2)', bgEnd: 'rgba(5, 150, 105, 0.45)', text: '#ffffff', border: '#34d399', shadow: '#10b981' }, // 話者3 (緑)
    { bgStart: 'rgba(245, 158, 11, 0.2)', bgEnd: 'rgba(217, 119, 6, 0.45)', text: '#ffffff', border: '#fbbf24', shadow: '#f59e0b' }  // 話者4 (オレンジ)
  ];

  if (theme === 'speaker') {
    return speakerColors[speakerId % speakerColors.length];
  }

  const posThemes = {
    '名詞': {
      pastel: { bgStart: 'rgba(224, 242, 254, 0.45)', bgEnd: 'rgba(186, 230, 253, 0.65)', text: '#0369a1', border: '#7dd3fc', shadow: '#bae6fd' },
      neon: { bgStart: 'rgba(0, 240, 255, 0.15)', bgEnd: 'rgba(0, 114, 255, 0.45)', text: '#ffffff', border: '#00f0ff', shadow: '#00f0ff' }
    },
    '動詞': {
      pastel: { bgStart: 'rgba(220, 252, 231, 0.45)', bgEnd: 'rgba(187, 247, 208, 0.65)', text: '#15803d', border: '#86efac', shadow: '#bbf7d0' },
      neon: { bgStart: 'rgba(57, 255, 20, 0.15)', bgEnd: 'rgba(0, 170, 0, 0.45)', text: '#ffffff', border: '#39ff14', shadow: '#39ff14' }
    },
    '形容詞': {
      pastel: { bgStart: 'rgba(252, 231, 243, 0.45)', bgEnd: 'rgba(251, 207, 232, 0.65)', text: '#be185d', border: '#f9a8d4', shadow: '#fbcfe8' },
      neon: { bgStart: 'rgba(255, 0, 127, 0.15)', bgEnd: 'rgba(255, 0, 127, 0.45)', text: '#ffffff', border: '#ff007f', shadow: '#ff007f' }
    },
    '副詞': {
      pastel: { bgStart: 'rgba(243, 232, 255, 0.45)', bgEnd: 'rgba(233, 213, 255, 0.65)', text: '#6b21a8', border: '#d8b4fe', shadow: '#e9d5ff' },
      neon: { bgStart: 'rgba(189, 0, 255, 0.15)', bgEnd: 'rgba(189, 0, 255, 0.45)', text: '#ffffff', border: '#bd00ff', shadow: '#bd00ff' }
    },
    'default': {
      pastel: { bgStart: 'rgba(243, 244, 246, 0.45)', bgEnd: 'rgba(229, 231, 235, 0.65)', text: '#374151', border: '#d1d5db', shadow: '#e5e7eb' },
      neon: { bgStart: 'rgba(255, 255, 255, 0.1)', bgEnd: 'rgba(204, 204, 204, 0.35)', text: '#ffffff', border: '#ffffff', shadow: '#ffffff' }
    }
  };

  const currentPosTheme = posThemes[pos] || posThemes['default'];
  return theme === 'neon' ? currentPosTheme.neon : currentPosTheme.pastel;
};

export const FallingWord = ({
  id,
  word,
  pos,
  colorTheme = 'pastel',
  speakerId = 0,
  fontSize = 1,
  bounciness = 0.15,
  gravityScale = 1,
  initialPos = [0, 8, 0],
  onDestroy
}) => {
  const rigidBodyRef = useRef();

  const len = word.length;
  // アクリルプレートの寸法
  const width = Math.max(0.85, len * 0.45 + 0.25) * fontSize;
  const height = 0.72 * fontSize;
  const depth = 0.22 * fontSize; // 物理演算が完全に安定する厚み

  const colors = useMemo(() => {
    return getThemeColors(pos, colorTheme, speakerId);
  }, [pos, colorTheme, speakerId]);

  // 高解像度・アスペクト比一致の文字テクスチャ生成
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 文字のぼやけ・潰れを防ぐため高解像度で描画 (2倍スケール)
    const scale = 2.5; 
    const canvasWidth = Math.max(256, len * 110 + 70) * scale;
    const canvasHeight = 160 * scale;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 前面グラデーション
    const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    grad.addColorStop(0, colors.bgStart);
    grad.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = grad;
    
    // 角丸の背景を描画
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, 26 * scale);
    ctx.fill();

    // 枠線
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 9 * scale;
    ctx.stroke();

    // 文字
    ctx.fillStyle = colors.text;
    // フォントにモダンでクリアなフォントファミリーを指定
    ctx.font = `bold ${canvasHeight * 0.46}px "Outfit", "Inter", "Hiragino Sans", "Yu Gothic", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // ネオンテーマの発光
    if (colorTheme === 'neon') {
      ctx.shadowColor = colors.shadow;
      ctx.shadowBlur = 18 * scale;
    }

    ctx.fillText(word, canvasWidth / 2, canvasHeight / 2 + 3 * scale);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [word, colors, colorTheme, len]);

  // 初期トルク
  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyTorqueImpulse({
        x: (Math.random() - 0.5) * 0.12,
        y: (Math.random() - 0.5) * 0.25,
        z: (Math.random() - 0.5) * 0.12
      }, true);
    }
  }, []);

  useFrame(() => {
    if (rigidBodyRef.current) {
      const position = rigidBodyRef.current.translation();
      if (position.y < -12) {
        onDestroy(id);
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="cuboid"
      position={initialPos}
      restitution={bounciness}
      friction={0.65}
      gravityScale={gravityScale}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        
        {/* 6面のマテリアル: 側面は透明度の高いエッジ、前後面に高画質文字をマッピング */}
        <meshPhysicalMaterial attach="material-0" color={colors.border} roughness={0.1} transmission={0.9} thickness={0.4} ior={1.5} />
        <meshPhysicalMaterial attach="material-1" color={colors.border} roughness={0.1} transmission={0.9} thickness={0.4} ior={1.5} />
        <meshPhysicalMaterial attach="material-2" color={colors.border} roughness={0.1} transmission={0.9} thickness={0.4} ior={1.5} />
        <meshPhysicalMaterial attach="material-3" color={colors.border} roughness={0.1} transmission={0.9} thickness={0.4} ior={1.5} />
        
        <meshPhysicalMaterial 
          attach="material-4" 
          map={texture} 
          roughness={0.12} 
          metalness={0.1} 
          clearcoat={1.0} 
          clearcoatRoughness={0.08} 
          transmission={0.4} 
          thickness={0.15} 
          ior={1.42} 
        />
        
        <meshPhysicalMaterial 
          attach="material-5" 
          map={texture} 
          roughness={0.12} 
          metalness={0.1} 
          clearcoat={1.0} 
          clearcoatRoughness={0.08} 
          transmission={0.4} 
          thickness={0.15} 
          ior={1.42} 
        />
      </mesh>
    </RigidBody>
  );
};
