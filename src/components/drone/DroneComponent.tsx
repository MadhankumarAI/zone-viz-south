/**
 * React Component for Drone Animation
 * Ready-to-use component with customizable props
 */

import React from 'react';
import { useDroneAnimation } from './useDroneAnimation';

interface DroneComponentProps {
  modelPath?: string;
  size?: number;
  animationSpeed?: number;
  enableAutoRotate?: boolean;
  autoRotateSpeed?: number;
  backgroundColor?: string;
  enableLighting?: boolean;
  onModelLoaded?: (model: any) => void;
  onAnimationComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((controls: any) => React.ReactNode);
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

/**
 * Drone Animation React Component
 */
const DroneComponent: React.FC<DroneComponentProps> = ({
  modelPath = '/models/drone.glb',
  size = 0.25,
  animationSpeed = 1,
  enableAutoRotate = false,
  autoRotateSpeed = 0.01,
  backgroundColor = '#000000',
  enableLighting = true,
  onModelLoaded,
  onAnimationComplete,
  className = '',
  style = {},
  children,
  loadingComponent,
  errorComponent
}) => {
  const {
    containerRef,
    isLoading,
    isLoaded,
    error,
    rotateDrone,
    scaleDrone,
    positionDrone,
    setAutoRotate,
    setAutoRotateSpeed,
    getModel,
    isAnimationComplete,
    isCurrentlyAnimating
  } = useDroneAnimation({
    modelPath,
    size,
    animationSpeed,
    enableAutoRotate,
    autoRotateSpeed,
    backgroundColor,
    enableLighting,
    onModelLoaded,
    onAnimationComplete
  });

  // Default loading component
  const defaultLoadingComponent = (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#008042', // Safence green color for visibility on white background
      fontSize: '18px',
      zIndex: 10
    }}>
      Loading Drone...
    </div>
  );

  // Default error component
  const defaultErrorComponent = (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'red',
      fontSize: '18px',
      zIndex: 10
    }}>
      Error: {error}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`drone-animation-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Loading state */}
      {isLoading && (loadingComponent || defaultLoadingComponent)}
      
      {/* Error state */}
      {error && (errorComponent || defaultErrorComponent)}
      
      {/* Children content (rendered over the animation) */}
      {isLoaded && children}
      
      {/* Expose animation controls to children via render prop */}
      {isLoaded && typeof children === 'function' && children({
        rotateDrone,
        scaleDrone,
        positionDrone,
        setAutoRotate,
        setAutoRotateSpeed,
        getModel,
        isAnimationComplete,
        isCurrentlyAnimating,
        isLoaded
      })}
    </div>
  );
};

export default DroneComponent;
