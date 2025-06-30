import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface MomentumLogoProps {
  size?: number;
  color?: string;
}

export default function MomentumLogo({ size = 40, color = '#fff' }: MomentumLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF6B35" />
          <Stop offset="100%" stopColor="#F7931E" />
        </LinearGradient>
      </Defs>
      
      {/* Outer circle */}
      <Circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#logoGradient)"
        stroke={color}
        strokeWidth="2"
      />
      
      {/* Inner momentum arrow/wave */}
      <Path
        d="M25 35 Q40 25, 55 35 Q70 45, 75 60"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* AI dot */}
      <Circle
        cx="75"
        cy="60"
        r="4"
        fill={color}
      />
      
      {/* Secondary wave */}
      <Path
        d="M25 50 Q40 40, 55 50 Q70 60, 75 75"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </Svg>
  );
} 