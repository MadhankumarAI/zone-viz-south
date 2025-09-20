/**
 * React Component for Drone Animation
 * Ready-to-use component with customizable props
 */

import React from 'react';
import { useDroneAnimation } from './useDroneAnimation.js';

/**
 * Drone Animation React Component
 * @param {Object} props - Component props
 * @param {string} props.modelPath - Path to the 3D model
 * @param {number} props.size - Final size of the drone (default: 0.25)
 * @param {number} props.animationSpeed - Speed of animations (default: 1)
 * @param {boolean} props.enableAutoRotate - Enable continuous rotation (default: false)
 * @param {number} props.autoRotateSpeed - Speed of auto-rotation (default: 0.01)
 * @param {string} props.backgroundColor - Background color (default: '#000000')
 * @param {boolean} props.enableLighting - Enable lighting (default: true)
 * @param {Function} props.onModelLoaded - Callback when model loads
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 * @param {string} props.className - CSS class name for the container
 * @param {Object} props.style - Inline styles for the container
 * @param {React.ReactNode} props.children - Children to render over the animation
 * @param {React.ReactNode} props.loadingComponent - Component to show while loading
 * @param {React.ReactNode} props.errorComponent - Component to show on error
 */
const DroneComponent = ({
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
      color: 'white',
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
