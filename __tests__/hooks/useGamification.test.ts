import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGamification, XP_REWARDS } from '../../hooks/useGamification';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('useGamification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => Promise.resolve(null));
  });

  it('initializes with default values', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGamification());
    await waitForNextUpdate();

    expect(result.current.userXP).toEqual({
      totalXP: 0,
      level: 1,
      xpForCurrentLevel: 0,
      xpForNextLevel: 100,
      progress: 0,
      achievements: expect.any(Array),
    });
  });

  it('adds XP correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGamification());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.addXP(XP_REWARDS.DAILY_CHECKIN, 'Daily Check-in');
    });

    expect(result.current.userXP.totalXP).toBe(XP_REWARDS.DAILY_CHECKIN);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('userXP', XP_REWARDS.DAILY_CHECKIN.toString());
  });

  it('levels up correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useGamification());
    await waitForNextUpdate();

    await act(async () => {
      await result.current.addXP(150, 'Large XP gain');
    });

    expect(result.current.userXP.level).toBe(2);
  });

  it('loads stored XP from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve('150'))
      .mockImplementationOnce(() => Promise.resolve('[]'));

    const { result, waitForNextUpdate } = renderHook(() => useGamification());
    await waitForNextUpdate();

    expect(result.current.userXP.totalXP).toBe(150);
    expect(result.current.userXP.level).toBe(2);
  });
}); 