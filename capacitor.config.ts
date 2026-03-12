import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.90a1cb1f24a745c1a9907de51efe5cd7',
  appName: 'maintime-app',
  webDir: 'dist',
  server: {
    url: 'https://90a1cb1f-24a7-45c1-a990-7de51efe5cd7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: [
        'camera',
        'photos'
      ]
    }
  }
};

export default config;