import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
const qrcode = require('qrcode-generator');

interface TraditionalQRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  gradientColors?: string[];
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  style?: ViewStyle;
  logoEnabled?: boolean;
  logoSize?: number;
  logoIcon?: string;
  customLogoUri?: string | null;
  logoType?: 'icon' | 'image';
}

// Função para gerar matriz QR real usando qrcode-generator
const generateQRMatrix = (text: string, errorLevel: string): boolean[][] => {
  const errorLevelMap: Record<string, string> = {
    'L': 'L',
    'M': 'M',
    'Q': 'Q',
    'H': 'H'
  };

  const qr = qrcode(0, errorLevelMap[errorLevel] || 'M');
  qr.addData(text);
  qr.make();
  
  const moduleCount = qr.getModuleCount();
  const matrix: boolean[][] = Array(moduleCount).fill(null).map(() => Array(moduleCount).fill(false));
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      matrix[row][col] = qr.isDark(row, col);
    }
  }
  
  return matrix;
};

const TraditionalQRCode: React.FC<TraditionalQRCodeProps> = ({
  value,
  size = 200,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000',
  gradientColors,
  errorCorrectionLevel = 'M',
  style
}) => {
  const matrix = generateQRMatrix(value, errorCorrectionLevel);
  const matrixSize = matrix.length;
  const quietZone = 4;
  const availableSize = size - (2 * quietZone);
  const cellSize = availableSize / matrixSize;
  const offset = quietZone;

  // Renderizar os módulos do QR Code como quadrados tradicionais
  const renderModules = () => {
    const modules: JSX.Element[] = [];
    
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col]) {
          const x = col * cellSize + offset;
          const y = row * cellSize + offset;
          
          const fillColor = gradientColors && gradientColors.length > 1 
            ? "url(#traditionalGradient)" 
            : gradientColors && gradientColors.length === 1 
              ? gradientColors[0] 
              : foregroundColor;
          
          // Desenhar quadrados tradicionais
          modules.push(
            <Rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width={cellSize}
              height={cellSize}
              fill={fillColor}
            />
          );
        }
      }
    }
    
    return modules;
  };
  
  return (
    <View style={[{ width: size, height: size, backgroundColor }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="traditionalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors ? gradientColors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            )) : (
              <Stop offset="0%" stopColor={foregroundColor} />
            )}
          </LinearGradient>
        </Defs>
        
        {/* Fundo */}
        <Rect x="0" y="0" width={size} height={size} fill={backgroundColor} />
        
        {/* Renderizar módulos tradicionais */}
        {renderModules()}
      </Svg>
    </View>
  );
};

export default TraditionalQRCode;