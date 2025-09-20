import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';


const DroneModel = ({ color = 'red' }: { color?: string }) => {
  const gltf = useGLTF('/models/drone.glb'); // make sure drone.glb is in public/models/
  const droneRef = useRef<THREE.Group>(null);

  // Apply color change dynamically
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(color);
        }
      });
    }
  }, [gltf, color]);

  // Simple floating animation
  useFrame((state) => {
    if (droneRef.current) {
      const t = state.clock.getElapsedTime();
      droneRef.current.position.y = Math.sin(t * 0.8) * 0.3;
      droneRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  return <primitive ref={droneRef} object={gltf.scene} scale={1} />;
};

// -------------------------
// Main Drone Simulation Scene
// -------------------------
const DroneSim = () => {
  const [droneColor, setDroneColor] = useState('#4a90e2');

  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden relative">
      {/* UI to change color */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="color"
          value={droneColor}
          onChange={(e) => setDroneColor(e.target.value)}
          className="w-16 h-8 cursor-pointer"
        />
      </div>

      <Canvas camera={{ position: [5, 2, 5], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a90e2" />
        

        {/* Drone with floating effect */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <DroneModel color={droneColor} />
        </Float>

        {/* Ground */}
        <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="red" transparent opacity={0.3} wireframe />
        </mesh>

        {/* Camera controls */}
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
};

export default DroneSim;
