import React from 'react';
import DroneComponent from './drone/DroneComponent';

const DroneSim = () => {
  return (
    <div className="w-full h-[600px] bg-white rounded-lg overflow-hidden relative">
      <DroneComponent
        modelPath="/models/drone.glb"
        size={0.3}
        animationSpeed={1.2}
        enableAutoRotate={true}
        autoRotateSpeed={0.01}
        backgroundColor="#ffffff"
        onModelLoaded={(model) => {
          console.log('Drone model loaded successfully!', model);
        }}
        onAnimationComplete={() => {
          console.log('Drone animation sequence completed!');
        }}
      >
        {/* Optional: Add any overlay content here if needed */}
      </DroneComponent>
    </div>
  );
};

export default DroneSim;