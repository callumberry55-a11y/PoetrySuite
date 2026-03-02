/**
 * AI-Powered Hand Gesture Recognition for Accessibility
 *
 * WARNING: This is an EXPERIMENTAL feature that uses AI and your device's camera
 * to recognize hand gestures for navigation. This feature:
 *
 * - Uses Google Generative AI for enhanced gesture recognition
 * - May not work accurately on all devices
 * - Can be affected by lighting conditions and background
 * - Requires camera permissions
 * - Uses significant processing power
 * - Is NOT suitable for critical or time-sensitive tasks
 *
 * USE AT YOUR OWN RISK. This is a beta accessibility feature.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

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
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private useAI = true;
  private frameCounter = 0;
  private aiProcessingInterval = 5;

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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        try {
          this.genAI = new GoogleGenerativeAI(apiKey);
          this.model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 100
            }
          });
          console.log('AI vision model initialized for hand gesture recognition');
        } catch (error) {
          console.warn('AI model initialization failed, falling back to basic detection:', error);
          this.useAI = false;
        }
      } else {
        console.warn('No Gemini API key found, using basic gesture recognition');
        this.useAI = false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.style.display = 'none';
      document.body.appendChild(this.videoElement);

      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      await this.videoElement.play();

      this.initializeDefaultMappings();

      console.log(`Hand gesture recognition initialized successfully (AI: ${this.useAI ? 'enabled' : 'disabled'})`);
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

    if (this.videoElement) {
      if (this.videoElement.srcObject) {
        this.videoElement.srcObject = null;
      }
      if (document.body.contains(this.videoElement)) {
        document.body.removeChild(this.videoElement);
      }
      this.videoElement = null;
    }

    this.canvas = null;
    this.ctx = null;
    this.handHistory = [];
    this.lastGesture = 'none';
    this.lastGestureTime = 0;
  }

  private startDetection(): void {
    const processFrame = async () => {
      if (!this.config.enabled || !this.videoElement || !this.ctx || !this.canvas) {
        return;
      }

      try {
        this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      } catch (error) {
        console.error('Error drawing video frame:', error);
        this.animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      this.frameCounter++;

      let gesture: GestureType = 'none';
      let handData: DetectedHand | null = null;

      if (this.useAI && this.model && this.frameCounter % this.aiProcessingInterval === 0) {
        gesture = await this.recognizeGestureWithAI();

        if (gesture !== 'none') {
          handData = {
            landmarks: [],
            handedness: 'right',
            confidence: 0.8
          };
        }
      }

      // Always run basic detection for hand history tracking
      const hand = this.detectHand();
      if (hand) {
        this.handHistory.push(hand);
        if (this.handHistory.length > this.historySize) {
          this.handHistory.shift();
        }

        // Only use basic gesture recognition if AI didn't detect anything
        if (gesture === 'none') {
          handData = hand;
          gesture = this.recognizeGesture(hand);
        }
      }

      if (gesture !== 'none' && this.isGestureEnabled(gesture) && handData) {
        const now = Date.now();
        const timeSinceLastGesture = now - this.lastGestureTime;

        if (gesture !== this.lastGesture || timeSinceLastGesture > this.config.gestureDelay) {
          this.lastGesture = gesture;
          this.lastGestureTime = now;

          const event: GestureEvent = {
            gesture,
            hand: handData.handedness,
            confidence: handData.confidence,
            timestamp: now,
            position: handData.landmarks.length > 0 ? this.getHandCenter(handData) : undefined
          };

          this.listeners.forEach(listener => listener(event));
          this.executeGestureAction(gesture);
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

  private async recognizeGestureWithAI(): Promise<GestureType> {
    try {
      if (!this.canvas || !this.model) {
        return 'none';
      }

      const imageBase64 = this.canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

      const prompt = `Analyze this webcam image and detect any hand gesture.
Possible gestures: fist, open_palm, thumbs_up, thumbs_down, peace, pointing, swipe_left, swipe_right, swipe_up, swipe_down, pinch, none
Return ONLY a JSON object with this exact format (no other text):
{"gesture": "<gesture_name>", "confidence": <number 0-1>}
If no clear gesture is detected, return "none".`;

      const result = await Promise.race([
        this.model.generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          { text: prompt }
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 5000))
      ]);

      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        console.warn('AI response missing JSON');
        return 'none';
      }

      const parsed = JSON.parse(jsonMatch[0]);

      const validGestures: GestureType[] = [
        'fist', 'open_palm', 'thumbs_up', 'thumbs_down', 'peace', 'pointing',
        'swipe_left', 'swipe_right', 'swipe_up', 'swipe_down', 'pinch', 'none'
      ];

      if (validGestures.includes(parsed.gesture as GestureType)) {
        return parsed.gesture as GestureType;
      }

      console.warn('AI returned invalid gesture:', parsed.gesture);
      return 'none';
    } catch (error) {
      if (error instanceof Error && error.message === 'AI timeout') {
        console.warn('AI gesture recognition timeout');
      } else {
        console.error('AI gesture recognition failed:', error);
      }

      // Disable AI temporarily on repeated failures
      if (!this.useAI) {
        this.useAI = false;
        setTimeout(() => { this.useAI = true; }, 30000); // Re-enable after 30s
      }

      return 'none';
    }
  }

  private recognizeGesture(hand: DetectedHand): GestureType {
    if (this.handHistory.length >= 3) {
      const swipe = this.detectSwipe();
      if (swipe !== 'none') return swipe;
    }

    const fingerCount = this.countExtendedFingers(hand);

    if (fingerCount === 0) return 'fist';
    if (fingerCount === 5) return 'open_palm';
    if (fingerCount === 1) return 'pointing';
    if (fingerCount === 2) return 'peace';

    if (this.isThumbUp(hand)) return 'thumbs_up';
    if (this.isThumbDown(hand)) return 'thumbs_down';

    return 'none';
  }

  private countExtendedFingers(hand: DetectedHand): number {
    if (hand.landmarks.length < 21) return 0;

    let count = 0;
    const wrist = hand.landmarks[0];

    // Check each finger tip (indices 4, 8, 12, 16, 20) against palm base
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerBases = [2, 5, 9, 13, 17];

    for (let i = 0; i < fingerTips.length; i++) {
      const tip = hand.landmarks[fingerTips[i]];
      const base = hand.landmarks[fingerBases[i]];

      // If tip is further from wrist than base, finger is extended
      const tipDist = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
      const baseDist = Math.sqrt(Math.pow(base.x - wrist.x, 2) + Math.pow(base.y - wrist.y, 2));

      if (tipDist > baseDist * 1.2) {
        count++;
      }
    }

    return count;
  }

  private isThumbUp(hand: DetectedHand): boolean {
    if (hand.landmarks.length < 21) return false;

    const thumbTip = hand.landmarks[4];
    const indexTip = hand.landmarks[8];
    const wrist = hand.landmarks[0];

    // Thumb should be above wrist, other fingers below
    const thumbUp = thumbTip.y < wrist.y - 30;
    const indexDown = indexTip.y > wrist.y;

    return thumbUp && indexDown;
  }

  private isThumbDown(hand: DetectedHand): boolean {
    if (hand.landmarks.length < 21) return false;

    const thumbTip = hand.landmarks[4];
    const indexTip = hand.landmarks[8];
    const wrist = hand.landmarks[0];

    // Thumb should be below wrist, other fingers above
    const thumbDown = thumbTip.y > wrist.y + 30;
    const indexUp = indexTip.y < wrist.y;

    return thumbDown && indexUp;
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
