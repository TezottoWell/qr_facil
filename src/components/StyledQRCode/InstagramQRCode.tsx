import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface InstagramQRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  gradientColors?: string[];
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  style?: ViewStyle;
}

// Função simplificada para gerar matriz QR (você precisará de uma biblioteca real)
const generateQRMatrix = (text: string, errorLevel: string): boolean[][] => {
  // Esta é uma implementação placeholder
  // Na prática, você precisaria usar uma biblioteca como qrcode-generator
  const size = 25;
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Padrões de canto (finder patterns)
  const patterns = [
    { x: 0, y: 0 },
    { x: size - 7, y: 0 },
    { x: 0, y: size - 7 }
  ];
  
  patterns.forEach(({ x, y }) => {
    // Quadrado externo
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6) {
          matrix[y + i][x + j] = true;
        }
      }
    }
    // Quadrado interno
    for (let i = 2; i < 5; i++) {
      for (let j = 2; j < 5; j++) {
        matrix[y + i][x + j] = true;
      }
    }
  });
  
  // Adicionar alguns dados aleatórios para simular (remover em produção)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (Math.random() > 0.7 && !isInFinderPattern(i, j, size)) {
        matrix[i][j] = true;
      }
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
  const cellSize = size / matrixSize;
  const dotSize = cellSize * 0.6;
  const cornerRadius = dotSize / 2;
  
  // Renderizar os pontos do QR Code
  const renderDots = () => {
    const dots: JSX.Element[] = [];
    
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (matrix[row][col]) {
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          
          // Verificar se está em um padrão de canto para usar quadrados arredondados
          if (isInFinderPattern(row, col, matrixSize)) {
            // Desenhar quadrados arredondados para os padrões de canto
            dots.push(
              <Rect
                key={`${row}-${col}`}
                x={x - dotSize / 2}
                y={y - dotSize / 2}
                width={dotSize}
                height={dotSize}
                rx={cornerRadius * 0.3}
                ry={cornerRadius * 0.3}
                fill={foregroundColor}
              />
            );
          } else {
            // Desenhar círculos para o resto
            dots.push(
              <Circle
                key={`${row}-${col}`}
                cx={x}
                cy={y}
                r={dotSize / 2}
                fill={foregroundColor}
              />
            );
          }
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
      const centerX = (pattern.x + 3.5) * cellSize;
      const centerY = (pattern.y + 3.5) * cellSize;
      const outerSize = 7 * cellSize;
      const middleSize = 5 * cellSize;
      const innerSize = 3 * cellSize;
      
      return (
        <G key={index}>
          {/* Anel externo */}
          <Rect
            x={centerX - outerSize / 2}
            y={centerY - outerSize / 2}
            width={outerSize}
            height={outerSize}
            rx={outerSize * 0.2}
            ry={outerSize * 0.2}
            fill={foregroundColor}
          />
          <Rect
            x={centerX - middleSize / 2}
            y={centerY - middleSize / 2}
            width={middleSize}
            height={middleSize}
            rx={middleSize * 0.2}
            ry={middleSize * 0.2}
            fill={backgroundColor}
          />
          {/* Centro */}
          <Rect
            x={centerX - innerSize / 2}
            y={centerY - innerSize / 2}
            width={innerSize}
            height={innerSize}
            rx={innerSize * 0.2}
            ry={innerSize * 0.2}
            fill={foregroundColor}
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