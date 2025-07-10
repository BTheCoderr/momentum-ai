import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface MomentumLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  color?: string;
}

export const MomentumLogo: React.FC<MomentumLogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  color = '#FF6B35' 
}) => {
  const sizeConfig = {
    small: { logoSize: 32, textSize: 16 },
    medium: { logoSize: 48, textSize: 20 },
    large: { logoSize: 64, textSize: 24 },
  }[size];

  return (
    <View style={styles.container}>
      {/* Logo Icon */}
      <View style={[
        styles.logoIcon, 
        { 
          width: sizeConfig.logoSize, 
          height: sizeConfig.logoSize,
          backgroundColor: '#FF6B35',
        }
      ]}>
        <View style={styles.logoContent}>
          <Text style={[
            styles.logoText,
            { fontSize: sizeConfig.logoSize * 0.3 }
          ]}>
            M
          </Text>
          <Text style={[
            styles.logoSubText,
            { fontSize: sizeConfig.logoSize * 0.15 }
          ]}>
            AI
          </Text>
        </View>
      </View>
      
      {/* App Name */}
      {showText && (
        <Text style={[
          styles.appName, 
          { 
            fontSize: sizeConfig.textSize,
            color: color,
          }
        ]}>
          Momentum AI
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  logoSubText: {
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginTop: -2,
  },
  appName: {
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MomentumLogo; 