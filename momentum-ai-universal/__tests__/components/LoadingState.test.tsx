import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingState } from '../../components/LoadingState';
import { ThemeProvider } from '../../components/ThemeProvider';

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Animated: {
    View: 'View',
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    timing: () => ({
      start: jest.fn(),
    }),
    loop: jest.fn((animation) => ({
      start: jest.fn(),
    })),
    sequence: jest.fn((animations) => ({
      start: jest.fn(),
    })),
  },
}));

// Mock the theme provider
jest.mock('../../components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#000000',
        background: '#FFFFFF',
        surface: '#F5F5F5',
      },
    },
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LoadingState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card skeleton by default', () => {
    const { getByTestId, getByText } = render(<LoadingState />);
    
    expect(getByTestId('loading-container')).toBeTruthy();
    expect(getByTestId('loading-card-0')).toBeTruthy();
    expect(getByTestId('loading-text')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders list skeleton when type is list', () => {
    const { getByTestId, queryByTestId } = render(<LoadingState type="list" />);

    expect(getByTestId('loading-container')).toBeTruthy();
    expect(getByTestId('loading-list-0')).toBeTruthy();
    expect(queryByTestId('loading-card-0')).toBeNull();
  });

  it('renders profile skeleton when type is profile', () => {
    const { getByTestId, queryByTestId } = render(<LoadingState type="profile" />);

    expect(getByTestId('loading-container')).toBeTruthy();
    expect(getByTestId('loading-profile-0')).toBeTruthy();
    expect(queryByTestId('loading-card-0')).toBeNull();
  });

  it('renders full screen skeleton when type is full', () => {
    const { getByTestId, queryByTestId } = render(<LoadingState type="full" />);

    expect(getByTestId('loading-container')).toBeTruthy();
    expect(getByTestId('loading-full-0')).toBeTruthy();
    expect(queryByTestId('loading-card-0')).toBeNull();
  });

  it('renders custom loading message', () => {
    const customMessage = 'Custom loading message';
    const { getByTestId, getByText } = render(<LoadingState message={customMessage} />);

    expect(getByTestId('loading-text')).toBeTruthy();
    expect(getByText(customMessage)).toBeTruthy();
  });

  it('renders multiple skeletons when count is greater than 1', () => {
    const count = 3;
    const { getAllByTestId } = render(<LoadingState count={count} />);

    const skeletons = getAllByTestId(/loading-card-[0-9]+/);
    expect(skeletons).toHaveLength(count);
  });

  it('renders single skeleton when count is 1', () => {
    const { getAllByTestId } = render(<LoadingState count={1} />);

    const skeletons = getAllByTestId(/loading-card-[0-9]+/);
    expect(skeletons).toHaveLength(1);
  });
}); 