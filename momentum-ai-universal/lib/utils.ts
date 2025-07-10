import { Alert } from 'react-native';

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  // For React Native, we'll use Alert as a simple toast replacement
  // In a real app, you might want to use a proper toast library like react-native-toast-message
  Alert.alert(
    type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
    message,
    [{ text: 'OK' }]
  );
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 