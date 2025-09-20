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

interface DroneAnimationConfig {
  container: HTMLElement;
  modelPath: string;
  size: number;
  initialScale: number;
  animationSpeed: number;
  enableAutoRotate: boolean;
  autoRotateSpeed: number;
  cameraDistance: number;
  initialCameraDistance: number;
  backgroundColor: string | number;
  enableLighting: boolean;
  onModelLoaded: (model: any) => void;
  onAnimationComplete: () => void;
}

class DroneAnimation {
  private config: DroneAnimationConfig;
  private camera: THREE.PerspectiveCamera | null = null;
  private scene: THREE.Scene | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private model: THREE.Group | null = null;
  private loader: GLTFLoader;
  private animationId: number | null = null;
  private isInitialized: boolean = false;
  private isAnimating: boolean = false;
  private animationComplete: boolean = false;

  constructor(options: Partial<DroneAnimationConfig> = {}) {
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
    this.loader = new GLTFLoader();
  }

  /**
   * Initialize the drone animation
   */
  async init(): Promise<boolean> {
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
  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
  }

  /**
   * Setup the camera
   */
  private setupCamera(): void {
    const aspect = this.config.container.clientWidth / this.config.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.01, 10);
    this.camera.position.z = this.config.initialCameraDistance;
    this.camera.position.x = 0.2; // Slight offset to the right to better frame the drone
    this.camera.rotation.z = 1; // Restore original rotation for rolling effect
  }

  /**
   * Setup the WebGL renderer
   */
  private setupRenderer(): void {
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
  private setupLighting(): void {
    if (this.config.enableLighting && this.scene) {
      const light = new THREE.AmbientLight(0xffffff, 2);
      this.scene.add(light);
    }
  }

  /**
   * Load the 3D drone model
   */
  private loadModel(): Promise<void> {
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
          
          // Apply green color to drone materials
          this.applyDroneColor('#008042');
          
          if (this.scene) {
            this.scene.add(this.model);
          }
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
  private startAnimation(): void {
    if (!this.model || !this.camera) return;

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

    // Model animations (with reduced delays)
    tl.to(this.model.rotation, {
      x: 1,
      duration: duration,
      delay: duration * 0.3 // Reduced from duration to duration * 0.3
    });

    tl.to(this.model.rotation, {
      y: Math.PI * 1.75,
      duration: duration * 2,
      delay: duration * 0.3 // Reduced from duration to duration * 0.3
    }, duration * 0.3); // Start earlier

    tl.to(this.model.scale, {
      x: this.config.size,
      y: this.config.size,
      z: this.config.size,
      duration: duration,
      delay: duration * 0.3 // Reduced from duration to duration * 0.3
    }, duration * 0.3); // Start earlier

    tl.to(this.model.position, {
      x: 0.3,  // Keep positioned to the right
      y: 0.3,
      z: 0,
      duration: duration,
      delay: duration * 0.3 // Reduced from duration to duration * 0.3
    }, duration * 0.3); // Start earlier
  }

  /**
   * Start the render loop
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      // Auto-rotate if enabled
      if (this.config.enableAutoRotate && this.model && this.animationComplete) {
        this.model.rotation.y += this.config.autoRotateSpeed;
      }
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  /**
   * Setup window resize handler
   */
  private setupResizeHandler(): void {
    const handleResize = () => {
      if (!this.camera || !this.renderer) return;
      
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
  updateConfig(newConfig: Partial<DroneAnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Pause/Resume auto-rotation
   */
  setAutoRotate(enabled: boolean): void {
    this.config.enableAutoRotate = enabled;
  }

  /**
   * Set auto-rotation speed
   */
  setAutoRotateSpeed(speed: number): void {
    this.config.autoRotateSpeed = speed;
  }

  /**
   * Manually rotate the drone
   */
  rotateDrone(x: number, y: number, z: number): void {
    if (this.model) {
      this.model.rotation.set(x, y, z);
    }
  }

  /**
   * Scale the drone
   */
  scaleDrone(scale: number): void {
    if (this.model) {
      this.model.scale.setScalar(scale);
    }
  }

  /**
   * Position the drone
   */
  positionDrone(x: number, y: number, z: number): void {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  /**
   * Apply color to drone materials
   */
  private applyDroneColor(color: string): void {
    if (!this.model) return;
    
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => {
              if (material instanceof THREE.MeshStandardMaterial) {
                material.color.setHex(parseInt(color.replace('#', ''), 16));
              }
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.color.setHex(parseInt(color.replace('#', ''), 16));
          }
        }
      }
    });
  }

  /**
   * Get the current drone model
   */
  getModel(): THREE.Group | null {
    return this.model;
  }

  /**
   * Get the current scene
   */
  getScene(): THREE.Scene | null {
    return this.scene;
  }

  /**
   * Get the current camera
   */
  getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  /**
   * Get the current renderer
   */
  getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  /**
   * Check if animation is complete
   */
  isAnimationComplete(): boolean {
    return this.animationComplete;
  }

  /**
   * Check if currently animating
   */
  isCurrentlyAnimating(): boolean {
    return this.isAnimating;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
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
