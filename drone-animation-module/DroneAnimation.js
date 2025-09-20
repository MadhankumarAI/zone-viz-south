/**
 * Portable Drone Animation Module
 * Extracted from React Landing Page Project
 * 
 * Dependencies: three, gsap
 * Usage: Import and initialize in any React project
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

class DroneAnimation {
  constructor(options = {}) {
    // Configuration options
    this.config = {
      container: options.container || document.body,
      modelPath: options.modelPath || '/models/drone.glb',
      size: options.size || 0.25,
      initialScale: options.initialScale || 0.45,
      animationSpeed: options.animationSpeed || 1,
      enableAutoRotate: options.enableAutoRotate || false,
      autoRotateSpeed: options.autoRotateSpeed || 0.01,
      cameraDistance: options.cameraDistance || 1,
      initialCameraDistance: options.initialCameraDistance || 5,
      backgroundColor: options.backgroundColor || 0x000000,
      enableLighting: options.enableLighting !== false,
      onModelLoaded: options.onModelLoaded || (() => {}),
      onAnimationComplete: options.onAnimationComplete || (() => {})
    };

    // Three.js objects
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.model = null;
    this.loader = new GLTFLoader();
    this.animationId = null;
    this.isInitialized = false;

    // Animation state
    this.isAnimating = false;
    this.animationComplete = false;
  }

  /**
   * Initialize the drone animation
   */
  async init() {
    try {
      this.setupScene();
      this.setupCamera();
      this.setupRenderer();
      this.setupLighting();
      await this.loadModel();
      this.startRenderLoop();
      this.setupResizeHandler();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize drone animation:', error);
      return false;
    }
  }

  /**
   * Setup the Three.js scene
   */
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
  }

  /**
   * Setup the camera
   */
  setupCamera() {
    const aspect = this.config.container.clientWidth / this.config.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.01, 10);
    this.camera.position.z = this.config.initialCameraDistance;
    this.camera.rotation.z = 1;
  }

  /**
   * Setup the WebGL renderer
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(
      this.config.container.clientWidth, 
      this.config.container.clientHeight
    );
    this.renderer.setClearColor(this.config.backgroundColor, 1);
    this.config.container.appendChild(this.renderer.domElement);
  }

  /**
   * Setup lighting
   */
  setupLighting() {
    if (this.config.enableLighting) {
      const light = new THREE.AmbientLight(0xffffff, 2);
      this.scene.add(light);
    }
  }

  /**
   * Load the 3D drone model
   */
  loadModel() {
    return new Promise((resolve, reject) => {
      this.loader.load(
        this.config.modelPath,
        (gltf) => {
          this.model = gltf.scene;
          this.model.scale.set(
            this.config.initialScale, 
            this.config.initialScale, 
            this.config.initialScale
          );
          this.scene.add(this.model);
          this.config.onModelLoaded(this.model);
          this.startAnimation();
          resolve();
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Start the main animation sequence
   */
  startAnimation() {
    if (!this.model) return;

    this.isAnimating = true;
    const duration = this.config.animationSpeed;

    // Create animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        this.animationComplete = true;
        this.config.onAnimationComplete();
      }
    });

    // Camera zoom-in animation
    tl.to(this.camera.position, {
      z: this.config.cameraDistance,
      duration: duration,
      ease: "back.out(1.7)"
    });

    // Camera rotation animation
    tl.to(this.camera.rotation, {
      z: 0,
      duration: duration
    }, 0); // Start at the same time as camera zoom

    // Model animations (with delay)
    tl.to(this.model.rotation, {
      x: 1,
      duration: duration,
      delay: duration
    });

    tl.to(this.model.rotation, {
      y: Math.PI * 1.75,
      duration: duration * 2,
      delay: duration
    }, duration);

    tl.to(this.model.scale, {
      x: this.config.size,
      y: this.config.size,
      z: this.config.size,
      duration: duration,
      delay: duration
    }, duration);

    tl.to(this.model.position, {
      x: 0.35,
      y: 0.3,
      z: 0,
      duration: duration,
      delay: duration
    }, duration);
  }

  /**
   * Start the render loop
   */
  startRenderLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      // Auto-rotate if enabled
      if (this.config.enableAutoRotate && this.model && this.animationComplete) {
        this.model.rotation.y += this.config.autoRotateSpeed;
      }
      
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  /**
   * Setup window resize handler
   */
  setupResizeHandler() {
    const handleResize = () => {
      const width = this.config.container.clientWidth;
      const height = this.config.container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  }

  /**
   * Update animation configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Pause/Resume auto-rotation
   */
  setAutoRotate(enabled) {
    this.config.enableAutoRotate = enabled;
  }

  /**
   * Set auto-rotation speed
   */
  setAutoRotateSpeed(speed) {
    this.config.autoRotateSpeed = speed;
  }

  /**
   * Manually rotate the drone
   */
  rotateDrone(x, y, z) {
    if (this.model) {
      this.model.rotation.set(x, y, z);
    }
  }

  /**
   * Scale the drone
   */
  scaleDrone(scale) {
    if (this.model) {
      this.model.scale.setScalar(scale);
    }
  }

  /**
   * Position the drone
   */
  positionDrone(x, y, z) {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  /**
   * Get the current drone model
   */
  getModel() {
    return this.model;
  }

  /**
   * Get the current scene
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the current camera
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the current renderer
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Check if animation is complete
   */
  isAnimationComplete() {
    return this.animationComplete;
  }

  /**
   * Check if currently animating
   */
  isCurrentlyAnimating() {
    return this.isAnimating;
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.config.container.contains(this.renderer.domElement)) {
        this.config.container.removeChild(this.renderer.domElement);
      }
    }
    
    if (this.scene) {
      this.scene.clear();
    }
    
    this.isInitialized = false;
  }
}

export default DroneAnimation;
