import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Drone component for monitoring the fence
const DroneModel = ({ position }: { position: [number, number, number] }) => {
  const { scene } = useGLTF('/models/drone.glb');
  const droneRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (droneRef.current) {
      // Scale and position the drone (3x larger)
      droneRef.current.scale.set(0.45, 0.45, 0.45);
      droneRef.current.position.set(position[0], position[1], position[2]);
      
      // Apply green color to drone materials
      droneRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = new THREE.MeshStandardMaterial({
            color: '#008042',
            metalness: 0.7,
            roughness: 0.3
          });
          child.material = material;
        }
      });
      
      // Add horizontal roaming animation (left to right movement)
      const roamingTimeline = gsap.timeline({ repeat: -1, yoyo: true });
      
      roamingTimeline.to(droneRef.current.position, {
        x: -1.5, // Move left
        duration: 3,
        ease: "power2.inOut"
      })
      .to(droneRef.current.position, {
        x: 1.5, // Move right
        duration: 3,
        ease: "power2.inOut"
      });
      
      // Add subtle hovering animation
      gsap.to(droneRef.current.position, {
        y: position[1] + 0.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    }
  }, [position]);
  
  return (
    <group ref={droneRef}>
      <primitive object={scene.clone()} />
    </group>
  );
};

// Electric fence post component
const FencePost = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.025, 0.025, 1.2, 8]} />
      <meshStandardMaterial 
        color="#6b7280" 
        metalness={0.8} 
        roughness={0.2} 
      />
    </mesh>
  );
};

// Electric wire component with GSAP animations
const ElectricWire = ({ 
  start, 
  end, 
  isAlert = false,
  wireIndex = 0
}: { 
  start: [number, number, number]; 
  end: [number, number, number]; 
  isAlert?: boolean;
  wireIndex?: number;
}) => {
  const wireRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [time, setTime] = useState(0);
  
  useFrame((state) => {
    setTime(state.clock.getElapsedTime());
  });

  // Create straight wire geometry for front view
  const wireGeometry = useMemo(() => {
    const points = [];
    const segments = 80; // More segments for smoother electricity flow
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(start[0], end[0], t);
      const y = THREE.MathUtils.lerp(start[1], end[1], t);
      const z = start[2]; // Keep all points at the same Z depth for flat appearance
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, segments, 0.008, 8, false);
  }, [start, end]);

  // GSAP animation for electricity flow
  useEffect(() => {
    if (materialRef.current) {
      const tl = gsap.timeline({ repeat: -1 });
      
      // More pronounced electricity flow animation for front view
      tl.to(materialRef.current, {
        emissiveIntensity: 1.2,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(materialRef.current, {
        emissiveIntensity: 0.4,
        duration: 0.2,
        ease: "power2.in"
      })
      .to(materialRef.current, {
        emissiveIntensity: 0.9,
        duration: 0.15,
        ease: "power2.out"
      })
      .to(materialRef.current, {
        emissiveIntensity: 0.3,
        duration: 0.25,
        ease: "power2.in"
      })
      .to(materialRef.current, {
        emissiveIntensity: 0.7,
        duration: 0.1,
        ease: "power2.out"
      })
      .to(materialRef.current, {
        emissiveIntensity: 0.5,
        duration: 0.2,
        ease: "power2.inOut"
      });

      // Add delay based on wire index for staggered effect
      tl.delay(wireIndex * 0.15);
    }
  }, [wireIndex]);

  // Color change animation when alert state changes
  useEffect(() => {
    if (materialRef.current) {
      const targetColor = isAlert ? "#ef4444" : "#3b82f6";
      const targetEmissive = isAlert ? "#ef4444" : "#3b82f6";
      
      gsap.to(materialRef.current, {
        color: new THREE.Color(targetColor),
        emissive: new THREE.Color(targetEmissive),
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  }, [isAlert]);

  return (
    <mesh ref={wireRef} geometry={wireGeometry}>
      <meshStandardMaterial 
        ref={materialRef}
        color={isAlert ? "#ef4444" : "#3b82f6"} 
        emissive={isAlert ? "#ef4444" : "#3b82f6"}
        emissiveIntensity={0.4}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
};

// Spark particles with GSAP animations
const SparkParticles = ({ 
  position, 
  isActive,
  sparkIndex = 0
}: { 
  position: [number, number, number]; 
  isActive: boolean;
  sparkIndex?: number;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useMemo(() => {
    const newParticles = new Float32Array(15 * 3);
    for (let i = 0; i < 15; i++) {
      newParticles[i * 3] = position[0] + (Math.random() - 0.5) * 0.1;
      newParticles[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 0.1;
      newParticles[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.1;
    }
    return newParticles;
  }, [position]);

  // GSAP animation for spark particles
  useEffect(() => {
    if (pointsRef.current && isActive) {
      const tl = gsap.timeline({ repeat: -1 });
      
      tl.to(pointsRef.current.material, {
        opacity: 0.9,
        duration: 0.1,
        ease: "power2.out"
      })
      .to(pointsRef.current.material, {
        opacity: 0.3,
        duration: 0.2,
        ease: "power2.inOut"
      })
      .to(pointsRef.current.material, {
        opacity: 0.8,
        duration: 0.1,
        ease: "power2.out"
      })
      .to(pointsRef.current.material, {
        opacity: 0.2,
        duration: 0.3,
        ease: "power2.inOut"
      });

      // Staggered animation based on spark index
      tl.delay(sparkIndex * 0.15);
    }
  }, [isActive, sparkIndex]);

  useFrame((state) => {
    if (pointsRef.current && isActive) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(state.clock.getElapsedTime() * 12 + i) * 0.003;
        positions[i] += (Math.random() - 0.5) * 0.002;
        positions[i + 2] += (Math.random() - 0.5) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!isActive) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#ef4444"
        size={0.006}
        transparent
        opacity={0.7}
      />
    </points>
  );
};

// Main fence component with multiple wires
const Fence = ({ isAlert = false }: { isAlert?: boolean }) => {
  const { viewport } = useThree();
  // Extend fence to span full screen width with responsive design
  const fenceWidth = viewport.width * 1.2; // Extend beyond viewport for full coverage
  const postCount = Math.max(8, Math.floor(viewport.width * 0.8)); // More posts for wider fence
  const wireCount = 4; // Multiple horizontal wires
  const fenceDepth = 0; // Flat front-facing fence
  
  const posts = useMemo(() => {
    const postPositions: [number, number, number][] = [];
    for (let i = 0; i < postCount; i++) {
      const x = (i / (postCount - 1)) * fenceWidth - fenceWidth / 2;
      postPositions.push([x, 0, fenceDepth]); // All posts at same Z depth
    }
    return postPositions;
  }, [fenceWidth, fenceDepth, postCount]);

  const wireSegments = useMemo(() => {
    const segments: Array<{ 
      start: [number, number, number]; 
      end: [number, number, number]; 
      height: number;
    }> = [];
    
    // Create multiple horizontal wires at different heights, all at same Z depth
    for (let wire = 0; wire < wireCount; wire++) {
      const height = 0.2 + (wire * 0.25); // Evenly spaced heights for taller fence
      for (let i = 0; i < posts.length - 1; i++) {
        segments.push({
          start: [posts[i][0], height, fenceDepth],
          end: [posts[i + 1][0], height, fenceDepth],
          height
        });
      }
    }
    return segments;
  }, [posts, wireCount, fenceDepth]);

  return (
    <group>
      {/* Fence posts */}
      {posts.map((post, index) => (
        <FencePost key={index} position={post} />
      ))}
      
      {/* Electric wires */}
      {wireSegments.map((segment, index) => (
        <ElectricWire 
          key={index} 
          start={segment.start} 
          end={segment.end} 
          isAlert={isAlert}
          wireIndex={index % (postCount - 1)}
        />
      ))}
      
      {/* Drone positioned above fence for monitoring */}
      <DroneModel position={[0, 0.8, 0.3]} />
      
      {/* Spark particles at detection points */}
      {isAlert && (
        <>
          <SparkParticles position={[-fenceWidth * 0.4, 0.4, fenceDepth]} isActive={isAlert} sparkIndex={0} />
          <SparkParticles position={[-fenceWidth * 0.2, 0.6, fenceDepth]} isActive={isAlert} sparkIndex={1} />
          <SparkParticles position={[0, 0.5, fenceDepth]} isActive={isAlert} sparkIndex={2} />
          <SparkParticles position={[fenceWidth * 0.2, 0.8, fenceDepth]} isActive={isAlert} sparkIndex={3} />
          <SparkParticles position={[fenceWidth * 0.4, 0.4, fenceDepth]} isActive={isAlert} sparkIndex={4} />
        </>
      )}
    </group>
  );
};

// Alert indicator component
const AlertIndicator = ({ isAlert }: { isAlert: boolean }) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (indicatorRef.current) {
      if (isAlert) {
        gsap.fromTo(indicatorRef.current, 
          { scale: 0.8, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.3, 
            ease: "back.out(1.7)" 
          }
        );
        
        // Pulsing animation
        gsap.to(indicatorRef.current, {
          scale: 1.05,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut"
        });
      } else {
        gsap.to(indicatorRef.current, {
          scale: 1,
          opacity: 0.8,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
    }
  }, [isAlert]);

  return (
    <div 
      ref={indicatorRef}
      className={`absolute top-1 right-1 sm:right-2 md:right-3 bg-card/95 backdrop-blur-sm border rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 shadow-lg transition-all duration-300 ${
        isAlert ? 'border-red-500 bg-red-50/90' : 'border-border'
      }`}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${isAlert ? 'bg-red-500' : 'bg-blue-500'}`} />
        <span className={`text-xs sm:text-sm font-medium ${isAlert ? 'text-red-700' : 'text-foreground'}`}>
          {isAlert ? 'Alert: Intrusion Detected' : 'Status: Secure'}
        </span>
      </div>
    </div>
  );
};

// Main ElectricFence component
const ElectricFence = () => {
  const [isAlert, setIsAlert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate alert state changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAlert(prev => !prev);
    }, 6000); // Toggle every 6 seconds for demo

    return () => clearInterval(interval);
  }, []);

  // GSAP animation for container entrance
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: "power2.out",
          delay: 0.2
        }
      );
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-[180px] bg-gradient-to-b from-background via-safence-primary/3 to-background relative overflow-hidden"
    >
      <Canvas 
        camera={{ position: [0, 0.3, 2.5], fov: 60 }}
        performance={{ min: 0.5 }}
        dpr={[1, 2]}
      >
        {/* Lighting for front-facing view */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[0, 0, 1]} intensity={0.8} />
        <pointLight 
          position={[0, 0.5, 1]} 
          intensity={0.6} 
          color={isAlert ? "#ef4444" : "#3b82f6"}
          distance={5}
        />
        
        {/* Fence */}
        <Fence isAlert={isAlert} />
        
        {/* Remove ground for flat appearance */}
      </Canvas>
      
      {/* Alert indicator - positioned higher */}
      <AlertIndicator isAlert={isAlert} />
      
      {/* Title overlay - positioned higher */}
      <div className="absolute top-1 left-1 sm:left-2 md:left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1 sm:px-3 sm:py-2 shadow-lg">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">Electric Perimeter Fence</h3>
        <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Security System</p>
      </div>
    </div>
  );
};

export default ElectricFence;