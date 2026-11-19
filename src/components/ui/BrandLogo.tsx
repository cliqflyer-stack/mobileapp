import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';

const LOGO_ASPECT_RATIO = 118 / 39; // ~3.025 from Figma vector viewBox

interface BrandLogoProps {
  height?: number;
  width?: number;
  variant?: 'default' | 'white';
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  height = 28,
  width,
  variant = 'default',
  style,
  accessibilityLabel = 'Snatch up',
}) => {
  const calculatedWidth = width ?? Math.round(height * LOGO_ASPECT_RATIO);
  const source =
    variant === 'white'
      ? require('../../../assets/images/logo-white.png')
      : require('../../../assets/images/logo.png');

  return (
    <Image
      source={source}
      style={[
        styles.logo,
        {
          width: calculatedWidth,
          height,
        },
        style,
      ]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    backgroundColor: 'transparent',
  },
});
