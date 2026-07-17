import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astrolabio.app',
  appName: 'Astrolabio',
  webDir: 'out',
  server: {
    url: 'https://astrolabio-pwa.vercel.app', // Asumiendo tu URL de Vercel. Puedes cambiarla si es otra.
    cleartext: true
  }
};

export default config;
