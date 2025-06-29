// Global type declarations for React Native and Expo

declare global {
  const __DEV__: boolean;
  
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      DATABASE_URL?: string;
      DIRECT_URL?: string;
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      GROQ_API_KEY?: string;
      SUPABASE_KEY?: string;
    }
  }
}

export {}; 