import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppFallback from '../../components/AppFallback';

describe('AppFallback', () => {
  it('renders loading screen by default', () => {
    const { getByText } = render(
      <AppFallback>
        <div>Test Content</div>
      </AppFallback>
    );

    expect(getByText('Loading Momentum AI...')).toBeTruthy();
    expect(getByText('Getting your goals ready')).toBeTruthy();
  });

  it('renders error screen when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <AppFallback>
        <ThrowError />
      </AppFallback>
    );

    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText("We're having trouble loading Momentum AI")).toBeTruthy();
  });

  it('allows retry after error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <AppFallback>
        <ThrowError />
      </AppFallback>
    );

    const retryButton = getByText('Try Again');
    fireEvent.press(retryButton);

    // After retry, we should see the loading screen again
    expect(getByText('Loading Momentum AI...')).toBeTruthy();
  });
}); 