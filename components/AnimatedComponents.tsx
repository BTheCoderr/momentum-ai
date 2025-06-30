import React, { useRef, useEffect } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Easing,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Animated Button with scale and glow effects
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    const baseStyle = styles.animatedButton;
    switch (variant) {
      case 'secondary':
        return [baseStyle, styles.secondaryButton];
      case 'success':
        return [baseStyle, styles.successButton];
      case 'warning':
        return [baseStyle, styles.warningButton];
      default:
        return [baseStyle, styles.primaryButton];
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          ...getButtonStyle(),
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          disabled && styles.disabledButton,
        ]}
      >
        {loading ? (
          <Animated.Text
            style={[
              styles.buttonText,
              textStyle,
              { transform: [{ rotate: spin }] },
            ]}
          >
            ⚡
          </Animated.Text>
        ) : (
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Card with entrance animation
interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  animationType?: 'slideUp' | 'slideDown' | 'fadeIn' | 'scaleIn';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  animationType = 'slideUp',
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, []);

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'slideDown':
        return {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'fadeIn':
        return {
          opacity: animValue,
        };
      case 'scaleIn':
        return {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      default: // slideUp
        return {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
    }
  };

  return (
    <Animated.View style={[styles.animatedCard, style, getAnimationStyle()]}>
      {children}
    </Animated.View>
  );
};

// Animated Progress Bar
interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  duration?: number;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#E5E7EB',
  progressColor = '#10B981',
  style,
  animated = true,
  duration = 1000,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated, duration]);

  return (
    <View
      style={[
        styles.progressBarContainer,
        { height, backgroundColor: '#FF6B35' },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            height,
            backgroundColor: '#FF6B35',
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

// Bounce Animation for XP gains, achievements, etc.
interface BounceAnimationProps {
  children: React.ReactNode;
  trigger: boolean;
  style?: ViewStyle;
}

export const BounceAnimation: React.FC<BounceAnimationProps> = ({
  children,
  trigger,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: bounceAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Pulse Animation for notifications, streaks, etc.
interface PulseAnimationProps {
  children: React.ReactNode;
  isActive: boolean;
  style?: ViewStyle;
  duration?: number;
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  isActive,
  style,
  duration = 1000,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Slide-in notification
interface SlideNotificationProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onHide?: () => void;
  duration?: number;
}

export const SlideNotification: React.FC<SlideNotificationProps> = ({
  visible,
  message,
  type = 'info',
  onHide,
  duration = 3000,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideNotification();
      return () => {}; // Return empty cleanup function for else branch
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return styles.successNotification;
      case 'error':
        return styles.errorNotification;
      case 'warning':
        return styles.warningNotification;
      default:
        return styles.infoNotification;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.slideNotification,
        getNotificationStyle(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.notificationIcon}>{getIcon()}</Text>
      <Text style={styles.notificationText}>{message}</Text>
      <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#64748B',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  animatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressBarContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
  },
  slideNotification: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1000,
  },
  successNotification: {
    backgroundColor: '#10B981',
  },
  errorNotification: {
    backgroundColor: '#EF4444',
  },
  warningNotification: {
    backgroundColor: '#F59E0B',
  },
  infoNotification: {
    backgroundColor: '#FF6B35',
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 