import { Image } from 'react-native';

interface BrandLogoProps {
  size?: number;
}

/** The ASCENOVA mark — mirrors the web's BrandLogo (same resized PNG, rounded corners). */
export default function BrandLogo({ size = 32 }: BrandLogoProps) {
  return (
    <Image
      source={require('../../../assets/ascenova-logo.png')}
      accessible={false}
      style={{ width: size, height: size, borderRadius: Math.round(size / 4) }}
    />
  );
}
