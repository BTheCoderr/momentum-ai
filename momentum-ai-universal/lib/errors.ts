export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export class OfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineError';
  }
}

export function handleError(error: any, context?: string): void {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // You can add more sophisticated error handling here
  // like sending to analytics, showing user-friendly messages, etc.
  
  if (error instanceof AuthenticationError) {
    console.error('Authentication error:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof APIError) {
    console.error('API error:', error.message);
  } else if (error instanceof OfflineError) {
    console.error('Offline error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
} 