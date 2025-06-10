import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitly.app',
  appName: 'Habitly',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ec4899",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    SocialLogin: {
      google: {
        iOSClientId: process.env.GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: process.env.GOOGLE_CLIENT_ID,
        webClientId: process.env.GOOGLE_CLIENT_ID,
        androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID
      }
    }
  },
  ios: {
    loggingBehavior: 'debug',
  }
};

export default config;
