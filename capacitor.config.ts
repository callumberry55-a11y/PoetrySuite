
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poetrysuite.twa.app',
  appName: 'Poetry Suite',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#1f2937',
      spinnerColor: '#fbbf24',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1f2937',
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    }
  }
};

export default config;
