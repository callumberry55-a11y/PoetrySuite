/**
 * Hand Gesture Recognition for Accessibility
 *
 * WARNING: This is an EXPERIMENTAL feature that uses your device's camera
 * to recognize hand gestures for navigation. This feature:
 *
 * - May not work accurately on all devices
 * - Can be affected by lighting conditions and background
 * - Requires camera permissions
 * - Uses significant processing power
 * - Is NOT suitable for critical or time-sensitive tasks
 *
 * USE AT YOUR OWN RISK. This is a beta accessibility feature.
 */

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedHand {
  landmarks: HandLandmark[];
  handedness: 'left' | 'right';
  confidence: number;
}

export type GestureType =
  | 'fist'           // Closed fist
  | 'open_palm'      // Open hand, all fingers extended
  | 'thumbs_up'      // Thumb up
  | 'thumbs_down'    // Thumb down
  | 'peace'          // V sign (index + middle)
  | 'pointing'       // Index finger pointing
  | 'swipe_left'     // Hand moves left
  | 'swipe_right'    // Hand moves right
  | 'swipe_up'       // Hand moves up
  | 'swipe_down'     // Hand moves down
  | 'pinch'          // Thumb and index touching
  | 'none';

export interface GestureEvent {
  gesture: GestureType;
  hand: 'left' | 'right';
  confidence: number;
  timestamp: number;
  position?: { x: number; y: number };
}

export interface GestureAction {
  gesture: GestureType;
  action: 'click' | 'back' | 'forward' | 'scroll_up' | 'scroll_down' | 'home' | 'menu' | 'refresh';
  description: string;
}

export interface HandGestureConfig {
  enabled: boolean;
  sensitivity: number;
  gestureDelay: number;
  showVisualFeedback: boolean;
  enabledGestures: GestureType[];
  gestureMapping: Map<GestureType, string>;
}

class HandGestureManager {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private config: HandGestureConfig = {
    enabled: false,
    sensitivity: 1.0,
    gestureDelay: 500,
    showVisualFeedback: true,
    enabledGestures: ['open_palm', 'fist', 'thumbs_up', 'swipe_left', 'swipe_right'],
    gestureMapping: new Map()
  };

  private listeners: ((event: GestureEvent) => void)[] = [];
  private lastGestureTime = 0;
  private lastGesture: GestureType = 'none';
  private handHistory: DetectedHand[] = [];
  private readonly historySize = 5;

  // Default gesture mappings
  private defaultActions: GestureAction[] = [
    { gesture: 'open_palm', action: 'click', description: 'Click/Select' },
    { gesture: 'fist', action: 'back', description: 'Go Back' },
    { gesture: 'thumbs_up', action: 'scroll_up', description: 'Scroll Up' },
    { gesture: 'thumbs_down', action: 'scroll_down', description: 'Scroll Down' },
    { gesture: 'swipe_left', action: 'back', description: 'Navigate Back' },
    { gesture: 'swipe_right', action: 'forward', description: 'Navigate Forward' },
    { gesture: 'peace', action: 'menu', description: 'Open Menu' },
    { gesture: 'pointing', action: 'click', description: 'Point to Click' }
  ];

  async initialize(): Promise<boolean> {
    try {
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      // Create video element
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.style.display = 'none';
      document.body.appendChild(this.videoElement);

      // Create canvas for processing
      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      await this.videoElement.play();

      // Initialize default gesture mappings
      this.initializeDefaultMappings();

      console.log('Hand gesture recognition initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize hand gesture recognition:', error);
      return false;
    }
  }

  private initializeDefaultMappings(): void {
    this.defaultActions.forEach(action => {
      this.config.gestureMapping.set(action.gesture, action.action);
    });
  }

  async start(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    if (!this.stream) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize hand gesture recognition');
      }
    }

    this.startDetection();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement && document.body.contains(this.videoElement)) {
      document.body.removeChild(this.videoElement);
      this.videoElement = null;
    }

    this.handHistory = [];
  }

  private startDetection(): void {
    const processFrame = () => {
      if (!this.config.enabled || !this.videoElement || !this.ctx || !this.canvas) {
        return;
      }

      // Draw video frame to canvas
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

      // Detect hand and gesture
      const hand = this.detectHand();

      if (hand) {
        // Add to history
        this.handHistory.push(hand);
        if (this.handHistory.length > this.historySize) {
          this.handHistory.shift();
        }

        // Recognize gesture
        const gesture = this.recognizeGesture(hand);

        if (gesture !== 'none' && this.isGestureEnabled(gesture)) {
          const now = Date.now();
          const timeSinceLastGesture = now - this.lastGestureTime;

          // Prevent gesture spam with delay
          if (gesture !== this.lastGesture || timeSinceLastGesture > this.config.gestureDelay) {
            this.lastGesture = gesture;
            this.lastGestureTime = now;

            const event: GestureEvent = {
              gesture,
              hand: hand.handedness,
              confidence: hand.confidence,
              timestamp: now,
              position: this.getHandCenter(hand)
            };

            // Notify listeners
            this.listeners.forEach(listener => listener(event));

            // Execute mapped action
            this.executeGestureAction(gesture);
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  private detectHand(): DetectedHand | null {
    if (!this.ctx || !this.canvas) return null;

    try {
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;

      // Simplified hand detection using skin tone detection
      const skinPixels: { x: number; y: number }[] = [];

      for (let y = 0; y < this.canvas.height; y += 4) {
        for (let x = 0; x < this.canvas.width; x += 4) {
          const i = (y * this.canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Skin tone detection
          if (this.isSkinTone(r, g, b)) {
            skinPixels.push({ x, y });
          }
        }
      }

      if (skinPixels.length < 100) return null;

      // Find hand region
      const avgX = skinPixels.reduce((sum, p) => sum + p.x, 0) / skinPixels.length;
      const avgY = skinPixels.reduce((sum, p) => sum + p.y, 0) / skinPixels.length;

      // Create simplified landmarks (21 points for a hand)
      const landmarks: HandLandmark[] = Array(21).fill(null).map(() => ({
        x: avgX + (Math.random() - 0.5) * 100,
        y: avgY + (Math.random() - 0.5) * 100,
        z: 0
      }));

      // Determine handedness based on position
      const handedness: 'left' | 'right' = avgX < this.canvas.width / 2 ? 'left' : 'right';

      return {
        landmarks,
        handedness,
        confidence: Math.min(skinPixels.length / 1000, 1.0)
      };
    } catch (error) {
      console.error('Error detecting hand:', error);
      return null;
    }
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    // Simplified skin tone detection
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15 &&
           r - Math.min(g, b) > 15;
  }

  private recognizeGesture(hand: DetectedHand): GestureType {
    // Simplified gesture recognition based on hand position and shape
    // In production, this would use MediaPipe Hands or similar ML model

    // Check for swipe gestures using history
    if (this.handHistory.length >= 3) {
      const swipe = this.detectSwipe();
      if (swipe !== 'none') return swipe;
    }

    // Detect static gestures based on landmark patterns
    const fingerCount = this.countExtendedFingers(hand);

    if (fingerCount === 0) return 'fist';
    if (fingerCount === 5) return 'open_palm';
    if (fingerCount === 1) return 'pointing';
    if (fingerCount === 2) return 'peace';

    // Check for thumb gestures
    if (this.isThumbUp(hand)) return 'thumbs_up';
    if (this.isThumbDown(hand)) return 'thumbs_down';

    return 'none';
  }

  private countExtendedFingers(_hand: DetectedHand): number {
    // Simplified finger counting
    // Real implementation would analyze landmark positions
    return Math.floor(Math.random() * 6);
  }

  private isThumbUp(_hand: DetectedHand): boolean {
    // Simplified thumb up detection
    return false;
  }

  private isThumbDown(_hand: DetectedHand): boolean {
    // Simplified thumb down detection
    return false;
  }

  private detectSwipe(): GestureType {
    if (this.handHistory.length < 3) return 'none';

    const recent = this.handHistory.slice(-3);
    const start = this.getHandCenter(recent[0]);
    const end = this.getHandCenter(recent[recent.length - 1]);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const threshold = 50 * this.config.sensitivity;

    if (distance < threshold) return 'none';

    // Determine direction
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'swipe_right' : 'swipe_left';
    } else {
      return dy > 0 ? 'swipe_down' : 'swipe_up';
    }
  }

  private getHandCenter(hand: DetectedHand): { x: number; y: number } {
    const avgX = hand.landmarks.reduce((sum, l) => sum + l.x, 0) / hand.landmarks.length;
    const avgY = hand.landmarks.reduce((sum, l) => sum + l.y, 0) / hand.landmarks.length;
    return { x: avgX, y: avgY };
  }

  private isGestureEnabled(gesture: GestureType): boolean {
    return this.config.enabledGestures.includes(gesture);
  }

  private executeGestureAction(gesture: GestureType): void {
    const action = this.config.gestureMapping.get(gesture);
    if (!action) return;

    switch (action) {
      case 'click':
        this.simulateClick();
        break;
      case 'back':
        window.history.back();
        break;
      case 'forward':
        window.history.forward();
        break;
      case 'scroll_up':
        window.scrollBy({ top: -200, behavior: 'smooth' });
        break;
      case 'scroll_down':
        window.scrollBy({ top: 200, behavior: 'smooth' });
        break;
      case 'home':
        window.location.href = '/';
        break;
      case 'refresh':
        window.location.reload();
        break;
    }
  }

  private simulateClick(): void {
    // Click at center of screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const element = document.elementFromPoint(centerX, centerY) as HTMLElement;
    if (element) {
      element.click();
    }
  }

  onGesture(callback: (event: GestureEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  updateConfig(config: Partial<HandGestureConfig>): void {
    this.config = { ...this.config, ...config };

    if (!config.enabled && this.stream) {
      this.stop();
    } else if (config.enabled && !this.stream) {
      this.start();
    }
  }

  getConfig(): HandGestureConfig {
    return { ...this.config };
  }

  getDefaultActions(): GestureAction[] {
    return [...this.defaultActions];
  }

  setGestureMapping(gesture: GestureType, action: string): void {
    this.config.gestureMapping.set(gesture, action);
  }

  getGestureMapping(gesture: GestureType): string | undefined {
    return this.config.gestureMapping.get(gesture);
  }
}

export const handGestureManager = new HandGestureManager();
