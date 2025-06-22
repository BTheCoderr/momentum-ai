export default {
  expo: {
    name: "Momentum AI",
    slug: "momentum-ai",
    version: "1.0.0",
    description: "AI-powered accountability agent that helps you achieve your goals",
    platforms: ["ios", "android", "web"],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.momentumai.app",
      buildNumber: "3",
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "This app uses camera to capture progress photos for your goals",
        NSPhotoLibraryUsageDescription: "This app accesses photo library to share your achievements and progress",
        NSUserNotificationsUsageDescription: "This app sends notifications to remind you about daily check-ins and goal progress",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.momentumai.app",
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ],
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png",
      name: "Momentum AI",
      shortName: "Momentum AI",
      lang: "en",
      scope: "/",
      themeColor: "#2563EB",
      backgroundColor: "#ffffff",
      bundler: "metro"
    },
    notification: {
      icon: "./assets/icon.png",
      color: "#2563EB"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],

    extra: {
      eas: {
        projectId: "fb972645-26d4-4385-8898-7382359a1e05"
      },
      // Dynamic API URL - switches between local development and production
      apiUrl: process.env.NODE_ENV === 'production' 
        ? "https://momentum-ai.vercel.app/api"
        : "http://10.225.6.23:3000/api",
      supabaseUrl: "https://nsgqhhbqpyvonirlfluv.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo"
    }
  }
}; 