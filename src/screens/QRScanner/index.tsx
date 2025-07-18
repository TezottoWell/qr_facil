import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner, useCameraPermission } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { processQRCode, QRCodeData } from '../../utils/qrCodeProcessor';
import { executeQRCodeAction } from '../../utils/qrCodeActions';

interface QRScannerScreenProps {
  userEmail?: string;
}

export default function QRScannerScreen({ userEmail }: QRScannerScreenProps) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isActive) {
        const rawData = codes[0].value;
        setIsActive(false);
        
        // Processar o QR code escaneado
        handleQRCodeScanned(rawData);
        
        // Reativar o scanner após 4 segundos
        setTimeout(() => {
          setIsActive(true);
          setQrCodeData(null);
        }, 4000);
      }
    },
  });

  const handleQRCodeScanned = (rawData: string) => {
    console.log('QR Code escaneado:', rawData);
    
    // Processar e identificar o tipo de QR code
    const processedData = processQRCode(rawData);
    setQrCodeData(processedData);
    
    // Executar ação baseada no tipo detectado
    executeQRCodeAction(processedData, userEmail);
  };

  // Verificar permissões e dispositivo
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Permissão de câmera necessária para escanear QR codes
          </Text>
          <Text style={styles.permissionSubtext}>
            Por favor, conceda acesso à câmera nas configurações do app
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Câmera não disponível</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />
        
        {/* Overlay com instruções */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.title}>Leitor de QR Code</Text>
            <Text style={styles.subtitle}>
              Posicione o QR code dentro do quadrado para escanear
            </Text>
          </View>
          
          {/* Quadrado de escaneamento */}
          <View style={styles.scanArea}>
            <View style={styles.scanSquare}>
              <View style={styles.corner} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
          
          <View style={styles.bottomOverlay}>
            {qrCodeData ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>
                  {getTypeDisplayName(qrCodeData.type)} detectado!
                </Text>
                <Text style={styles.resultData} numberOfLines={3}>
                  {qrCodeData.description}
                </Text>
                <Text style={styles.actionText}>
                  {qrCodeData.actionText}
                </Text>
              </View>
            ) : (
              <Text style={styles.instructionText}>
                Mantenha o QR code bem posicionado e aguarde o escaneamento
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getTypeDisplayName(type: string): string {
  const typeNames: Record<string, string> = {
    'url': 'Link',
    'contact': 'Contato',
    'wifi': 'WiFi',
    'sms': 'SMS',
    'phone': 'Telefone',
    'email': 'Email',
    'geo': 'Localização',
    'text': 'Texto'
  };
  
  return typeNames[type] || 'QR Code';
}