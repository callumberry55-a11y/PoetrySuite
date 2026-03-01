/**
 * Eye Tracking for Accessibility
 *
 * WARNING: This is an EXPERIMENTAL feature that uses your device's camera
 * to track eye movement for navigation. This feature:
 *
 * - May not work accurately on all devices or for all users
 * - Can be significantly affected by lighting, glasses, and eye conditions
 * - Requires camera permissions and continuous camera access
 * - Uses significant processing power and battery
 * - May cause eye strain with prolonged use
 * - Is NOT suitable for critical or time-sensitive tasks
 * - Accuracy varies greatly between individuals
 *
 * USE AT YOUR OWN RISK. This is a beta accessibility feature.
 */

export interface EyePosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface GazePoint {
  x: number;
  y: number;
  confidence: number;
  timestamp: number;
}

export interface CalibrationPoint {
  x: number;
  y: number;
  samples: EyePosition[];
}

export type GazeAction =
  | 'dwell_click'      // Look at element for duration
  | 'smooth_scroll'    // Follow gaze for scrolling
  | 'cursor_follow';   // Move cursor to gaze

export interface EyeTrackingConfig {
  enabled: boolean;
  sensitivity: number;
  dwellTime: number;
  smoothingFactor: number;
  showGazeIndicator: boolean;
  enableDwellClick: boolean;
  enableSmoothScroll: boolean;
  requireCalibration: boolean;
  calibrated: boolean;
}

class EyeTrackingManager {
  private videoElement: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private config: EyeTrackingConfig = {
    enabled: false,
    sensitivity: 1.0,
    dwellTime: 1500,
    smoothingFactor: 0.3,
    showGazeIndicator: true,
    enableDwellClick: true,
    enableSmoothScroll: true,
    requireCalibration: false,
    calibrated: false
  };

  private gazeListeners: ((point: GazePoint) => void)[] = [];
  private dwellListeners: ((element: HTMLElement) => void)[] = [];
  private currentGaze: GazePoint | null = null;
  private gazeHistory: GazePoint[] = [];
  private readonly historySize = 10;

  private dwellStartTime = 0;
  private currentDwellElement: HTMLElement | null = null;

  private calibrationPoints: CalibrationPoint[] = [];
  private calibrationOffsetX = 0;
  private calibrationOffsetY = 0;

  async initialize(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported');
        return false;
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
      this.videoElement.muted = true;

      this.videoElement.addEventListener('error', (e) => {
        console.error('Video element error:', e);
        this.stop();
      });

      document.body.appendChild(this.videoElement);

      this.canvas = document.createElement('canvas');
      this.canvas.width = 640;
      this.canvas.height = 480;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

      if (!this.ctx) {
        console.error('Failed to get canvas context');
        this.stop();
        return false;
      }

      await this.videoElement.play();

      console.log('Eye tracking initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize eye tracking:', error);
      this.stop();
      return false;
    }
  }

  async start(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    if (!this.stream) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize eye tracking');
      }
    }

    this.startTracking();
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
      if (document.body.contains(this.videoElement)) {
        document.body.removeChild(this.videoElement);
      }
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    if (this.canvas) {
      this.canvas = null;
    }

    this.ctx = null;
    this.gazeHistory = [];
    this.currentGaze = null;
    this.gazeListeners = [];
    this.dwellListeners = [];
    this.currentDwellElement = null;
    this.dwellStartTime = 0;
  }

  private startTracking(): void {
    const processFrame = () => {
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

      const gaze = this.detectGaze();

      if (gaze) {
        const smoothedGaze = this.smoothGaze(gaze);
        this.currentGaze = smoothedGaze;

        this.gazeHistory.push(smoothedGaze);
        if (this.gazeHistory.length > this.historySize) {
          this.gazeHistory.shift();
        }

        this.gazeListeners.forEach(listener => listener(smoothedGaze));

        if (this.config.enableDwellClick) {
          this.handleDwellClick(smoothedGaze);
        }

        if (this.config.enableSmoothScroll) {
          this.handleSmoothScroll(smoothedGaze);
        }
      }

      this.animationFrameId = requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  private detectGaze(): GazePoint | null {
    if (!this.ctx || !this.canvas) return null;

    try {
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;

      let faceDetected = false;
      let eyeRegionX = 0;
      let eyeRegionY = 0;
      let eyePixelCount = 0;

      for (let y = 100; y < 300; y += 4) {
        for (let x = 150; x < 490; x += 4) {
          const i = (y * this.canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (this.isSkinTone(r, g, b)) {
            faceDetected = true;
          }

          if (this.isDarkPixel(r, g, b) && faceDetected) {
            eyeRegionX += x;
            eyeRegionY += y;
            eyePixelCount++;
          }
        }
      }

      if (eyePixelCount < 10) return null;

      const avgX = eyeRegionX / eyePixelCount;
      const avgY = eyeRegionY / eyePixelCount;

      const screenX = ((avgX / this.canvas.width) * window.innerWidth) + this.calibrationOffsetX;
      const screenY = ((avgY / this.canvas.height) * window.innerHeight) + this.calibrationOffsetY;

      const confidence = Math.min(eyePixelCount / 100, 1.0);

      return {
        x: Math.max(0, Math.min(window.innerWidth, screenX)) * this.config.sensitivity,
        y: Math.max(0, Math.min(window.innerHeight, screenY)) * this.config.sensitivity,
        confidence,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error detecting gaze:', error);
      return null;
    }
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    return r > 95 && g > 40 && b > 20 &&
           r > g && r > b &&
           Math.abs(r - g) > 15 &&
           r - Math.min(g, b) > 15;
  }

  private isDarkPixel(r: number, g: number, b: number): boolean {
    return r < 70 && g < 70 && b < 70;
  }

  private smoothGaze(newGaze: GazePoint): GazePoint {
    if (this.gazeHistory.length === 0) {
      return newGaze;
    }

    const factor = this.config.smoothingFactor;
    const lastGaze = this.gazeHistory[this.gazeHistory.length - 1];

    return {
      x: lastGaze.x * (1 - factor) + newGaze.x * factor,
      y: lastGaze.y * (1 - factor) + newGaze.y * factor,
      confidence: newGaze.confidence,
      timestamp: newGaze.timestamp
    };
  }

  private handleDwellClick(gaze: GazePoint): void {
    const element = document.elementFromPoint(gaze.x, gaze.y) as HTMLElement;

    if (!element || !this.isClickableElement(element)) {
      this.dwellStartTime = 0;
      this.currentDwellElement = null;
      return;
    }

    if (element !== this.currentDwellElement) {
      this.dwellStartTime = Date.now();
      this.currentDwellElement = element;
    } else {
      const dwellDuration = Date.now() - this.dwellStartTime;
      if (dwellDuration >= this.config.dwellTime) {
        this.performDwellClick(element);
        this.dwellStartTime = Date.now() + 1000;
      }
    }
  }

  private isClickableElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return (
      tagName === 'button' ||
      tagName === 'a' ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      element.onclick !== null ||
      element.getAttribute('role') === 'button' ||
      element.classList.contains('clickable')
    );
  }

  private performDwellClick(element: HTMLElement): void {
    element.click();
    this.dwellListeners.forEach(listener => listener(element));

    element.style.outline = '2px solid #8b5cf6';
    setTimeout(() => {
      element.style.outline = '';
    }, 300);
  }

  private handleSmoothScroll(gaze: GazePoint): void {
    const viewportHeight = window.innerHeight;
    const scrollThreshold = 100;

    if (gaze.y < scrollThreshold) {
      const intensity = (scrollThreshold - gaze.y) / scrollThreshold;
      window.scrollBy(0, -3 * intensity);
    } else if (gaze.y > viewportHeight - scrollThreshold) {
      const intensity = (gaze.y - (viewportHeight - scrollThreshold)) / scrollThreshold;
      window.scrollBy(0, 3 * intensity);
    }
  }

  async startCalibration(): Promise<void> {
    this.calibrationPoints = [];
    this.config.calibrated = false;
  }

  async addCalibrationPoint(screenX: number, screenY: number): Promise<void> {
    const samples: EyePosition[] = [];
    const sampleCount = 30;
    const sampleDelay = 50;

    for (let i = 0; i < sampleCount; i++) {
      const gaze = this.detectGaze();
      if (gaze) {
        samples.push({
          x: gaze.x,
          y: gaze.y,
          timestamp: Date.now()
        });
      }

      if (i < sampleCount - 1) {
        await new Promise(resolve => setTimeout(resolve, sampleDelay));
      }
    }

    this.calibrationPoints.push({
      x: screenX,
      y: screenY,
      samples
    });
  }

  finishCalibration(): void {
    if (this.calibrationPoints.length === 0) {
      console.warn('No calibration points to process');
      return;
    }

    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let validPoints = 0;

    this.calibrationPoints.forEach(point => {
      if (point.samples.length === 0) {
        console.warn('Calibration point has no samples');
        return;
      }

      const avgX = point.samples.reduce((sum, s) => sum + s.x, 0) / point.samples.length;
      const avgY = point.samples.reduce((sum, s) => sum + s.y, 0) / point.samples.length;

      totalOffsetX += point.x - avgX;
      totalOffsetY += point.y - avgY;
      validPoints++;
    });

    if (validPoints === 0) {
      console.warn('No valid calibration points');
      return;
    }

    this.calibrationOffsetX = totalOffsetX / validPoints;
    this.calibrationOffsetY = totalOffsetY / validPoints;

    this.config.calibrated = true;
    console.log('Calibration completed with offsets:', this.calibrationOffsetX, this.calibrationOffsetY);
  }

  onGaze(callback: (point: GazePoint) => void): () => void {
    this.gazeListeners.push(callback);
    return () => {
      this.gazeListeners = this.gazeListeners.filter(l => l !== callback);
    };
  }

  onDwell(callback: (element: HTMLElement) => void): () => void {
    this.dwellListeners.push(callback);
    return () => {
      this.dwellListeners = this.dwellListeners.filter(l => l !== callback);
    };
  }

  updateConfig(config: Partial<EyeTrackingConfig>): void {
    this.config = { ...this.config, ...config };

    if (!config.enabled && this.stream) {
      this.stop();
    } else if (config.enabled && !this.stream) {
      this.start();
    }
  }

  getConfig(): EyeTrackingConfig {
    return { ...this.config };
  }

  getCurrentGaze(): GazePoint | null {
    return this.currentGaze;
  }

  isCalibrated(): boolean {
    return this.config.calibrated;
  }
}

export const eyeTrackingManager = new EyeTrackingManager();
