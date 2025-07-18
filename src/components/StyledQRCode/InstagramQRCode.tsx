import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
const qrcode = require('qrcode-generator');

interface InstagramQRCodeProps {
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
  // Mapear níveis de correção de erro
  const errorLevelMap: Record<string, string> = {
    'L': 'L',
    'M': 'M',
    'Q': 'Q',
    'H': 'H'
  };

  // Criar QR Code
  const qr = qrcode(0, errorLevelMap[errorLevel] || 'M');
  qr.addData(text);
  qr.make();
  
  // Converter para matriz de boolean
  const moduleCount = qr.getModuleCount();
  const matrix: boolean[][] = Array(moduleCount).fill(null).map(() => Array(moduleCount).fill(false));
  
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      matrix[row][col] = qr.isDark(row, col);
    }
  }
  
  return matrix;
};

const isInFinderPattern = (row: number, col: number, size: number): boolean => {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  );
};

const InstagramQRCode: React.FC<InstagramQRCodeProps> = ({
  value,
  size = 200,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#000000',
  gradientColors = ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
  errorCorrectionLevel = 'M',
  style
}) => {
  const matrix = generateQRMatrix(value, errorCorrectionLevel);
  const matrixSize = matrix.length;
  const quietZone = 4; // Margem padrão para QR Codes (4 módulos)
  const availableSize = size - (2 * quietZone);
  const cellSize = availableSize / matrixSize;
  const dotSize = cellSize * 0.8; // Aumentar o tamanho dos pontos para melhor legibilidade
  const cornerRadius = dotSize / 2;
  const offset = quietZone; // Deslocamento para centralizar o QR Code
  
  // Renderizar os pontos do QR Code (exceto padrões de canto)
  const renderDots = () => {
    const dots: JSX.Element[] = [];
    
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col] && !isInFinderPattern(row, col, matrixSize)) {
          const x = col * cellSize + cellSize / 2 + offset;
          const y = row * cellSize + cellSize / 2 + offset;
          
          // Desenhar círculos para pontos normais
          const fillColor = gradientColors && gradientColors.length > 1 
            ? "url(#instagramGradient)" 
            : gradientColors && gradientColors.length === 1 
              ? gradientColors[0] 
              : foregroundColor;
          dots.push(
            <Circle
              key={`${row}-${col}`}
              cx={x}
              cy={y}
              r={dotSize / 2}
              fill={fillColor}
            />
          );
        }
      }
    }
    
    return dots;
  };
  
  // Renderizar os padrões de canto customizados (estilo Instagram)
  const renderFinderPatterns = () => {
    const patterns = [
      { x: 0, y: 0 },
      { x: matrixSize - 7, y: 0 },
      { x: 0, y: matrixSize - 7 }
    ];
    
    return patterns.map((pattern, index) => {
      const startX = pattern.x * cellSize + offset;
      const startY = pattern.y * cellSize + offset;
      const patternSize = 7 * cellSize;
      const fillColor = gradientColors && gradientColors.length > 1 
        ? "url(#instagramGradient)" 
        : gradientColors && gradientColors.length === 1 
          ? gradientColors[0] 
          : foregroundColor;
      
      return (
        <G key={index}>
          {/* Anel externo (7x7) */}
          <Rect
            x={startX}
            y={startY}
            width={patternSize}
            height={patternSize}
            rx={patternSize * 0.15}
            ry={patternSize * 0.15}
            fill={fillColor}
          />
          {/* Anel interno vazio (5x5) */}
          <Rect
            x={startX + cellSize}
            y={startY + cellSize}
            width={5 * cellSize}
            height={5 * cellSize}
            rx={3 * cellSize * 0.15}
            ry={3 * cellSize * 0.15}
            fill={backgroundColor}
          />
          {/* Centro sólido (3x3) */}
          <Rect
            x={startX + 2 * cellSize}
            y={startY + 2 * cellSize}
            width={3 * cellSize}
            height={3 * cellSize}
            rx={1.5 * cellSize * 0.15}
            ry={1.5 * cellSize * 0.15}
            fill={fillColor}
          />
        </G>
      );
    });
  };
  
  return (
    <View style={[{ width: size, height: size, backgroundColor }, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        
        {/* Fundo */}
        <Rect x="0" y="0" width={size} height={size} fill={backgroundColor} />
        
        {/* Renderizar pontos */}
        {renderDots()}
        
        {/* Sobrescrever com padrões de canto customizados */}
        {renderFinderPatterns()}
      </Svg>
    </View>
  );
};

export default InstagramQRCode;