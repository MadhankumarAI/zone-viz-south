/**
 * React Hook for Drone Animation
 * Easy integration with React components
 */

import { useEffect, useRef, useState } from 'react';
import DroneAnimation from './DroneAnimation';

interface UseDroneAnimationOptions {
  modelPath?: string;
  size?: number;
  animationSpeed?: number;
  enableAutoRotate?: boolean;
  autoRotateSpeed?: number;
  backgroundColor?: string | number;
  enableLighting?: boolean;
  onModelLoaded?: (model: any) => void;
  onAnimationComplete?: () => void;
}

/**
 * Custom hook for drone animation
 */
export const useDroneAnimation = (options: UseDroneAnimationOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const droneRef = useRef<DroneAnimation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initDrone = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const drone = new DroneAnimation({
          container: containerRef.current!,
          ...options
        });

        const success = await drone.init();
        
        if (success) {
          droneRef.current = drone;
          setIsLoaded(true);
        } else {
          setError('Failed to initialize drone animation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Drone animation error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initDrone();

    // Cleanup on unmount
    return () => {
      if (droneRef.current) {
        droneRef.current.dispose();
      }
    };
  }, [options.modelPath, options.size, options.animationSpeed]);

  // Animation control methods
  const rotateDrone = (x: number, y: number, z: number) => {
    if (droneRef.current) {
      droneRef.current.rotateDrone(x, y, z);
    }
  };

  const scaleDrone = (scale: number) => {
    if (droneRef.current) {
      droneRef.current.scaleDrone(scale);
    }
  };

  const positionDrone = (x: number, y: number, z: number) => {
    if (droneRef.current) {
      droneRef.current.positionDrone(x, y, z);
    }
  };

  const setAutoRotate = (enabled: boolean) => {
    if (droneRef.current) {
      droneRef.current.setAutoRotate(enabled);
    }
  };

  const setAutoRotateSpeed = (speed: number) => {
    if (droneRef.current) {
      droneRef.current.setAutoRotateSpeed(speed);
    }
  };

  const getModel = () => {
    return droneRef.current ? droneRef.current.getModel() : null;
  };

  const isAnimationComplete = () => {
    return droneRef.current ? droneRef.current.isAnimationComplete() : false;
  };

  const isCurrentlyAnimating = () => {
    return droneRef.current ? droneRef.current.isCurrentlyAnimating() : false;
  };

  return {
    // Refs
    containerRef,
    
    // State
    isLoading,
    isLoaded,
    error,
    
    // Animation controls
    rotateDrone,
    scaleDrone,
    positionDrone,
    setAutoRotate,
    setAutoRotateSpeed,
    getModel,
    isAnimationComplete,
    isCurrentlyAnimating,
    
    // Direct access to drone instance
    drone: droneRef.current
  };
};

export default useDroneAnimation;

