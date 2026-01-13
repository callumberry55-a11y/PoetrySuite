/**
 * Native Features Module
 * 
 * This module provides access to native Android features through Capacitor.
 * Use these functions to access hardware and OS features from your React app.
 */

import { registerPlugin } from '@capacitor/core';

// Register plugins - these will be available on native platforms
const Camera = registerPlugin<any>('Camera');
const Geolocation = registerPlugin<any>('Geolocation');
const App = registerPlugin<any>('App');
const Share = registerPlugin<any>('Share');
const Haptics = registerPlugin<any>('Haptics');
const Storage = registerPlugin<any>('Storage');
const Keyboard = registerPlugin<any>('Keyboard');
const Clipboard = registerPlugin<any>('Clipboard');

/**
 * Camera Features
 */
export const cameraFeatures = {
  /**
   * Take a photo using device camera
   */
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: 'uri',
        source: 'camera',
      });
      return { success: true, image };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Pick photo from gallery
   */
  async pickPhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: 'uri',
        source: 'photos',
      });
      return { success: true, image };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * Location Features
 */
export const locationFeatures = {
  /**
   * Get current device location
   */
  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return { success: true, coordinates };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Watch device location (real-time tracking)
   */
  async watchLocation(callback: (coords: any) => void) {
    try {
      const watchId = await Geolocation.watchPosition({}, (position: any) => {
        callback(position);
      });
      return { success: true, watchId };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Clear location watch
   */
  async clearLocationWatch(watchId: string) {
    try {
      await Geolocation.clearWatch({ id: watchId });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * Share Features
 */
export const shareFeatures = {
  /**
   * Share poem or content with other apps
   */
  async shareContent(title: string, text: string, url?: string) {
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share Poem',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * Haptics Features (Vibration)
 */
export const hapticFeatures = {
  /**
   * Light vibration feedback
   */
  async lightVibrate() {
    try {
      await Haptics.vibrate({ duration: 50 });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Medium vibration feedback
   */
  async mediumVibrate() {
    try {
      await Haptics.vibrate({ duration: 100 });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Heavy vibration feedback
   */
  async heavyVibrate() {
    try {
      await Haptics.vibrate({ duration: 200 });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Pattern vibration
   */
  async patternVibrate(pattern: number[]) {
    try {
      for (const duration of pattern) {
        await Haptics.vibrate({ duration });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * Storage Features
 */
export const storageFeatures = {
  /**
   * Save data persistently
   */
  async saveData(key: string, value: any) {
    try {
      await Storage.set({
        key,
        value: JSON.stringify(value),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Retrieve persistent data
   */
  async getData(key: string) {
    try {
      const result = await Storage.get({ key });
      return { success: true, value: result.value ? JSON.parse(result.value) : null };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Remove persistent data
   */
  async removeData(key: string) {
    try {
      await Storage.remove({ key });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Clear all persistent data
   */
  async clearAll() {
    try {
      await Storage.clear();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * Keyboard Features
 */
export const keyboardFeatures = {
  /**
   * Show keyboard
   */
  async show() {
    try {
      await Keyboard.show();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Hide keyboard
   */
  async hide() {
    try {
      await Keyboard.hide();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * Clipboard Features
 */
export const clipboardFeatures = {
  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string) {
    try {
      await Clipboard.write({
        string: text,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Read text from clipboard
   */
  async readFromClipboard() {
    try {
      const result = await Clipboard.read();
      return { success: true, text: result.value };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};

/**
 * App Features
 */
export const appFeatures = {
  /**
   * Exit app
   */
  async exitApp() {
    try {
      await App.exitApp();
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Get app state (foreground/background)
   */
  async getAppState() {
    try {
      App.addListener('appStateChange', (state: any) => {
        console.log('App state changed:', state);
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  /**
   * Handle app back button
   */
  setupBackButton(callback: () => void) {
    App.addListener('backButton', ({ canGoBack }: any) => {
      if (!canGoBack) {
        callback();
      }
    });
  },
};

export default {
  camera: cameraFeatures,
  location: locationFeatures,
  share: shareFeatures,
  haptics: hapticFeatures,
  storage: storageFeatures,
  keyboard: keyboardFeatures,
  clipboard: clipboardFeatures,
  app: appFeatures,
};
