import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omegaseiki.telematics',
  appName: 'OSM Telematics Dashboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
