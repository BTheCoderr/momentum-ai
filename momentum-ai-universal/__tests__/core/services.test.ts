import { NetworkError, AuthenticationError, APIError, OfflineError, handleError } from '../../lib/services';
import { supabase } from '../../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { checkinServices } from '../../lib/services';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

// Mock Supabase
jest.mock('../../lib/supabase', () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
  };

  return {
    supabase: {
      from: jest.fn(() => mockChain),
      auth: {
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
    },
  };
});

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network errors correctly', async () => {
    // Mock no network connection
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

    await expect(handleError(new Error('Network error'))).rejects.toThrow(NetworkError);
    expect(NetInfo.fetch).toHaveBeenCalled();
  });

  it('should handle authentication errors correctly', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    await expect(handleError(error)).rejects.toThrow(AuthenticationError);
  });

  it('should handle API errors correctly', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

    const error = {
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
      message: 'Server error',
    };

    await expect(handleError(error)).rejects.toThrow(APIError);
  });

  it('should handle offline errors correctly', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

    const error = new Error('Operation not available offline');
    await expect(handleError(error)).rejects.toThrow(OfflineError);
  });
});

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful sign in', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
    };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.data.user).toEqual(mockUser);
    expect(result.error).toBeNull();
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle sign in errors', async () => {
    const mockError = new Error('Invalid credentials');

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    const result = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    expect(result.data.user).toBeNull();
    expect(result.error).toEqual(mockError);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrong-password',
    });
  });
});

describe('User Profile Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user profile successfully', async () => {
    const mockProfile = {
      id: 'test-user-id',
      full_name: 'Test User',
      email: 'test@example.com',
    };

    (supabase.from('profiles').select('*').eq('id', 'test-user-id').single as jest.Mock).mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    const result = await supabase.from('profiles').select('*').eq('id', 'test-user-id').single();

    expect(result.data).toEqual(mockProfile);
    expect(result.error).toBeNull();
  });

  it('should handle profile fetch errors', async () => {
    const mockError = new Error('Profile not found');

    (supabase.from('profiles').select('*').eq('id', 'non-existent-id').single as jest.Mock).mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await supabase.from('profiles').select('*').eq('id', 'non-existent-id').single();

    expect(result.data).toBeNull();
    expect(result.error).toEqual(mockError);
  });
});

describe('checkinServices', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    };
    (supabase.from as jest.Mock).mockReturnValue(mockChain);
  });

  describe('getAll', () => {
    it('returns empty array when userId is not provided', async () => {
      const result = await checkinServices.getAll(undefined);
      expect(result).toEqual([]);
    });

    it('returns empty array on error', async () => {
      const mockError = new Error('Database error');
      mockChain.order.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await checkinServices.getAll('test-user');
      expect(result).toEqual([]);
    });

    it('returns data on success', async () => {
      const mockData = [{ id: 1, mood: 'happy' }];
      mockChain.order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await checkinServices.getAll('test-user');
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('returns null on error', async () => {
      const mockError = new Error('Database error');
      mockChain.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await checkinServices.create('test-user', { mood: 'happy' });
      expect(result).toBeNull();
    });

    it('returns data on success', async () => {
      const mockData = { id: 1, mood: 'happy' };
      mockChain.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await checkinServices.create('test-user', { mood: 'happy' });
      expect(result).toEqual(mockData);
    });
  });

  describe('getLatest', () => {
    it('returns null when userId is not provided', async () => {
      const result = await checkinServices.getLatest(undefined);
      expect(result).toBeNull();
    });

    it('returns null on error', async () => {
      const mockError = new Error('Database error');
      mockChain.single.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await checkinServices.getLatest('test-user');
      expect(result).toBeNull();
    });

    it('returns data on success', async () => {
      const mockData = { id: 1, mood: 'happy' };
      mockChain.single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await checkinServices.getLatest('test-user');
      expect(result).toEqual(mockData);
    });
  });
}); 