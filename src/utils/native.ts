import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

export const statusBar = {
  async setDark() {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  async setLight() {
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  async setBackground(color: string) {
    if (!isNative) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  async hide() {
    if (!isNative) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Status bar error:', error);
    }
  },

  async show() {
    if (!isNative) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Status bar error:', error);
    }
  }
};

export const splashScreen = {
  async hide() {
    if (!isNative) return;
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Splash screen error:', error);
    }
  },

  async show() {
    if (!isNative) return;
    try {
      await SplashScreen.show();
    } catch (error) {
      console.error('Splash screen error:', error);
    }
  }
};

export const keyboard = {
  async hide() {
    if (!isNative) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  },

  async show() {
    if (!isNative) return;
    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Keyboard error:', error);
    }
  }
};

export const haptics = {
  async light() {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  async medium() {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  async heavy() {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  async success() {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  async warning() {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  },

  async error() {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('Haptics error:', error);
    }
  }
};

export const toast = {
  async show(text: string, duration: 'short' | 'long' = 'short') {
    if (!isNative) {
      console.log('Toast:', text);
      return;
    }
    try {
      await Toast.show({
        text,
        duration: duration === 'short' ? 'short' : 'long',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Toast error:', error);
    }
  }
};

export const share = {
  async content(options: { title?: string; text?: string; url?: string; dialogTitle?: string }) {
    if (!isNative) {
      if (navigator.share) {
        try {
          await navigator.share(options);
        } catch (error) {
          console.error('Share error:', error);
        }
      } else {
        console.log('Share not available');
      }
      return;
    }
    try {
      await Share.share(options);
    } catch (error) {
      console.error('Share error:', error);
    }
  }
};

export const app = {
  async getInfo() {
    if (!isNative) return null;
    try {
      return await App.getInfo();
    } catch (error) {
      console.error('App info error:', error);
      return null;
    }
  },

  onBackButton(callback: () => void) {
    if (!isNative) return Promise.resolve({ remove: () => {} });
    return App.addListener('backButton', callback);
  },

  onPause(callback: () => void) {
    if (!isNative) return Promise.resolve({ remove: () => {} });
    return App.addListener('pause', callback);
  },

  onResume(callback: () => void) {
    if (!isNative) return Promise.resolve({ remove: () => {} });
    return App.addListener('resume', callback);
  },

  async exitApp() {
    if (!isNative) return;
    try {
      await App.exitApp();
    } catch (error) {
      console.error('Exit app error:', error);
    }
  }
};
