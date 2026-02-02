'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshReflectorMaterial,
  Sparkles,
  Stars
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Stylized Sports Car Component
function SportsCar({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const carRef = useRef<THREE.Group>(null);
  const leftHeadlightRef = useRef<THREE.PointLight>(null);
  const rightHeadlightRef = useRef<THREE.PointLight>(null);
  
  // Animate the car slightly
  useFrame((state) => {
    if (carRef.current) {
      carRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      carRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
    
    // Subtle pulsating headlights
    const intensity = 8 + Math.sin(state.clock.elapsedTime * 2) * 2;
    if (leftHeadlightRef.current) leftHeadlightRef.current.intensity = intensity;
    if (rightHeadlightRef.current) rightHeadlightRef.current.intensity = intensity;
  });

  return (
    <group ref={carRef} position={position}>
      {/* Car Body - Sleek Sports Car Shape */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 5]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Car Cabin */}
      <mesh position={[0, 0.8, -0.3]} castShadow>
        <boxGeometry args={[1.8, 0.5, 2]} />
        <meshStandardMaterial 
          color="#0f0f1a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.85, 0.9]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.02, 1]} />
        <meshStandardMaterial 
          color="#2a2a4e" 
          metalness={0.9} 
          roughness={0}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Hood - Angled */}
      <mesh position={[0, 0.5, 1.8]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.15, 1.5]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>

      {/* Front Bumper */}
      <mesh position={[0, 0.25, 2.4]} castShadow>
        <boxGeometry args={[2.4, 0.35, 0.3]} />
        <meshStandardMaterial 
          color="#151525" 
          metalness={0.8} 
          roughness={0.3}
        />
      </mesh>

      {/* Accent Lines on Body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.42, 0.02, 5.02]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Wheels */}
      {[[-0.9, 0.2, 1.5], [0.9, 0.2, 1.5], [-0.9, 0.2, -1.5], [0.9, 0.2, -1.5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.25, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Wheel rim glow */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.26, 16]} />
            <meshStandardMaterial 
              color="#333" 
              emissive="#0066ff"
              emissiveIntensity={0.1}
              metalness={0.9} 
              roughness={0.1} 
            />
          </mesh>
        </group>
      ))}

      {/* LEFT HEADLIGHT - HIGH BEAM */}
      <group position={[-0.7, 0.4, 2.5]}>
        {/* Headlight Housing */}
        <mesh>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial 
            color="#ffffee" 
            emissive="#ffff99"
            emissiveIntensity={1}
          />
        </mesh>
        {/* High Beam Light - Reduced intensity */}
        <pointLight
          ref={leftHeadlightRef}
          position={[0, 0, 0.5]}
          intensity={8}
          color="#fff8e7"
          distance={15}
          decay={2}
        />
        {/* Spotlight for beam effect - Reduced */}
        <spotLight
          position={[0, 0, 0.3]}
          angle={0.3}
          penumbra={0.8}
          intensity={15}
          color="#fff5e0"
          distance={20}
          target-position={[0, -2, 15]}
        />
      </group>

      {/* RIGHT HEADLIGHT - HIGH BEAM */}
      <group position={[0.7, 0.4, 2.5]}>
        {/* Headlight Housing */}
        <mesh>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshStandardMaterial 
            color="#ffffee" 
            emissive="#ffff99"
            emissiveIntensity={1}
          />
        </mesh>
        {/* High Beam Light - Reduced intensity */}
        <pointLight
          ref={rightHeadlightRef}
          position={[0, 0, 0.5]}
          intensity={8}
          color="#fff8e7"
          distance={15}
          decay={2}
        />
        {/* Spotlight for beam effect - Reduced */}
        <spotLight
          position={[0, 0, 0.3]}
          angle={0.3}
          penumbra={0.8}
          intensity={15}
          color="#fff5e0"
          distance={20}
          target-position={[0, -2, 15]}
        />
      </group>

      {/* Tail Lights */}
      <mesh position={[-0.8, 0.4, -2.4]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.8, 0.4, -2.4]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>

      {/* Underglow */}
      <pointLight position={[0, 0.1, 0]} intensity={2} color="#0066ff" distance={4} />
    </group>
  );
}

// Subtle Light Beam Rays Effect
function HeadlightBeams() {
  const beamRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (beamRef.current) {
      const material = beamRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.03 + Math.sin(state.clock.elapsedTime * 3) * 0.01;
    }
  });

  return (
    <group position={[0, 0.5, 5]}>
      {/* Left Beam - Very subtle */}
      <mesh ref={beamRef} position={[-0.7, 0, 3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2, 8, 32, 1, true]} />
        <meshBasicMaterial 
          color="#fffde7" 
          transparent 
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right Beam - Very subtle */}
      <mesh position={[0.7, 0, 3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[2, 8, 32, 1, true]} />
        <meshBasicMaterial 
          color="#fffde7" 
          transparent 
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Ground with Reflections
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={20}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#080810"
        metalness={0.5}
        mirror={0.3}
      />
    </mesh>
  );
}

// Police Scanner Effect - More subtle
function PoliceScannerLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime;
      // Alternate between red and blue
      const isRed = Math.floor(time * 2) % 2 === 0;
      lightRef.current.color.setHex(isRed ? 0xff0000 : 0x0066ff);
      lightRef.current.intensity = 3 + Math.sin(time * 8) * 1;
      lightRef.current.position.x = Math.sin(time * 1.5) * 8;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 6, -8]}
      intensity={3}
      color="#ff0000"
      distance={25}
    />
  );
}

// Main Scene Component
function Scene() {
  return (
    <>
      {/* Ambient Light - Increased for visibility */}
      <ambientLight intensity={0.15} />
      
      {/* Main Lighting - Better car visibility */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        color="#6688ff"
      />
      <directionalLight
        position={[-5, 8, -5]}
        intensity={0.3}
        color="#ff6688"
      />

      {/* Stars Background */}
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />
      
      {/* Police Scanner Effect - Subtle */}
      <PoliceScannerLight />
      
      {/* The Car - Positioned for better visibility */}
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.2}>
        <SportsCar position={[0, 0, -2]} />
      </Float>
      
      {/* Headlight Beams - Subtle */}
      <HeadlightBeams />
      
      {/* Ground */}
      <Ground />
      
      {/* Dust Particles - Reduced */}
      <Sparkles
        count={100}
        scale={15}
        size={1}
        speed={0.2}
        color="#4488ff"
        opacity={0.3}
      />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Post Processing - Reduced bloom */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={0.4}
        />
      </EffectComposer>
    </>
  );
}

// Exported Canvas Component
export default function CarScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
