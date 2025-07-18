import React from 'react';
import { View, Text, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import InstagramQRCode from './InstagramQRCode';
import RoundedQRCode from './RoundedQRCode';
import TraditionalQRCode from './TraditionalQRCode';
import DotsQRCode from './DotsQRCode';

export type QRCodeStyle = 'traditional' | 'instagram' | 'dots' | 'rounded';

interface StyledQRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  logoEnabled?: boolean;
  logoSize?: number;
  logoIcon?: string;
  customLogoUri?: string | null;
  logoType?: 'icon' | 'image';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  style?: QRCodeStyle;
  gradientColors?: string[];
}

const StyledQRCode: React.FC<StyledQRCodeProps> = ({
  value,
  size = 200,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000',
  logoEnabled = false,
  logoSize = 0.2,
  logoIcon = '❤️',
  customLogoUri = null,
  logoType = 'icon',
  errorCorrectionLevel = 'M',
  style = 'traditional',
  gradientColors
}) => {
  // Função para renderizar o logo
  const renderLogo = () => {
    if (!logoEnabled) return null;

    const logoSizePixels = size * logoSize;
    
    return (
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [
            { translateX: -logoSizePixels / 2 },
            { translateY: -logoSizePixels / 2 }
          ],
          width: logoSizePixels,
          height: logoSizePixels,
          backgroundColor: backgroundColor,
          borderRadius: logoSizePixels / 2,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {logoType === 'image' && customLogoUri ? (
          <Image 
            source={{ uri: customLogoUri }}
            style={{
              width: logoSizePixels * 0.8,
              height: logoSizePixels * 0.8,
              borderRadius: (logoSizePixels * 0.8) / 2,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: logoSizePixels * 0.6, textAlign: 'center' }}>
            {logoIcon}
          </Text>
        )}
      </View>
    );
  };

  // Para estilos customizados, usar componentes específicos
  if (style === 'instagram') {
    return (
      <View style={{ position: 'relative' }}>
        <InstagramQRCode
          value={value}
          size={size}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          gradientColors={gradientColors}
          errorCorrectionLevel={errorCorrectionLevel}
        />
        {renderLogo()}
      </View>
    );
  }

  if (style === 'rounded') {
    return (
      <View style={{ position: 'relative' }}>
        <RoundedQRCode
          value={value}
          size={size}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          gradientColors={gradientColors}
          errorCorrectionLevel={errorCorrectionLevel}
        />
        {renderLogo()}
      </View>
    );
  }

  if (style === 'traditional') {
    return (
      <View style={{ position: 'relative' }}>
        <TraditionalQRCode
          value={value}
          size={size}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          gradientColors={gradientColors}
          errorCorrectionLevel={errorCorrectionLevel}
        />
        {renderLogo()}
      </View>
    );
  }

  if (style === 'dots') {
    return (
      <View style={{ position: 'relative' }}>
        <DotsQRCode
          value={value}
          size={size}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          gradientColors={gradientColors}
          errorCorrectionLevel={errorCorrectionLevel}
        />
        {renderLogo()}
      </View>
    );
  }

  // Para estilos tradicionais, usar o QRCode padrão com customizações (fallback)
  const getQRCodeProps = () => {
    switch (style) {
      case 'dots':
        return {
          dotScale: 0.7,
          quietZone: 10,
        };
      default:
        return {
          quietZone: 10,
        };
    }
  };

  // Determinar cor para estilos tradicionais
  const getQRColor = () => {
    if (gradientColors && gradientColors.length === 1) {
      return gradientColors[0];
    }
    if (gradientColors && gradientColors.length > 1) {
      // Para gradientes em QRCode tradicional, usar a primeira cor
      return gradientColors[0];
    }
    return foregroundColor;
  };

  return (
    <View style={{ position: 'relative' }}>
      <QRCode
        value={value || 'https://example.com'}
        size={size}
        backgroundColor={backgroundColor}
        color={getQRColor()}
        ecl={errorCorrectionLevel}
        {...getQRCodeProps()}
      />
      {logoEnabled && (
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [
              { translateX: -(size * logoSize) / 2 },
              { translateY: -(size * logoSize) / 2 }
            ],
            width: size * logoSize,
            height: size * logoSize,
            backgroundColor: backgroundColor,
            borderRadius: (size * logoSize) / 2,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: backgroundColor,
          }}
        >
          <Text style={{ fontSize: (size * logoSize) * 0.6, textAlign: 'center' }}>
            {logoIcon}
          </Text>
        </View>
      )}
    </View>
  );
};

export default StyledQRCode;