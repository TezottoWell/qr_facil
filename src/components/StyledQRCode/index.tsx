import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import InstagramQRCode from './InstagramQRCode';

export type QRCodeStyle = 'traditional' | 'instagram' | 'dots' | 'rounded';

interface StyledQRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  logoEnabled?: boolean;
  logoSize?: number;
  logoIcon?: string;
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
  errorCorrectionLevel = 'M',
  style = 'traditional',
  gradientColors
}) => {
  // Para o estilo Instagram, usar o componente customizado
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: (size * logoSize) * 0.6, textAlign: 'center' }}>
              {logoIcon}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Para estilos tradicionais, usar o QRCode padrão com customizações
  const getQRCodeProps = () => {
    switch (style) {
      case 'dots':
        return {
          dotScale: 0.7,
          quietZone: 10,
        };
      case 'rounded':
        return {
          dotScale: 1,
          quietZone: 10,
          // Nota: react-native-qrcode-svg não suporta nativamente cantos arredondados
          // Você precisaria de uma biblioteca adicional ou implementação customizada
        };
      default:
        return {
          quietZone: 10,
        };
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <QRCode
        value={value || 'https://example.com'}
        size={size}
        backgroundColor={backgroundColor}
        color={foregroundColor}
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