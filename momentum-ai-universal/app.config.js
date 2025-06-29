export default {
  expo: {
    name: "Momentum AI",
    slug: "momentum-ai-mobile",
    version: "1.0.0",
    description: "AI-powered accountability agent that helps you achieve your goals",
    platforms: ["ios", "android"],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.momentumai.app",
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
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
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
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.API_URL || "https://api.momentum-ai.app",
      eas: {
        projectId: "bd8a230e-9f23-4195-a659-412866a70b26"
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nsgqhhbqpyvonirlfluv.supabase.co",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZ3FoaGJxcHl2b25pcmxmbHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1NTgsImV4cCI6MjA2NTMzMjU1OH0.twGF9Y6clrRtJg_4S1OWHA1vhhYpKzn3ZpFJPGJbmEo"
    }
  }
}; 