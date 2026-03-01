declare module '@capacitor/core' {
  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }

  export interface CapacitorInstance {
    getPlatform(): string;
    isNativePlatform(): boolean;
    isPluginAvailable(name: string): boolean;
    Plugins: any;
  }

  export const Capacitor: CapacitorInstance;
}
