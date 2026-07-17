import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astrolabiobooks.app.twa',
  appName: 'Astrolabio',
  webDir: 'out',
  server: {
    url: 'https://app.astrolabiobooks.com', // Enlace real de producción
    cleartext: true
  }
};

export default config;
