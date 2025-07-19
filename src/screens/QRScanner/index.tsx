import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner, useCameraPermission } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { processQRCode, QRCodeData } from '../../utils/qrCodeProcessor';
import { executeQRCodeAction } from '../../utils/qrCodeActions';
import { useLanguage } from '../../contexts/LanguageContext';

interface QRScannerScreenProps {
  userEmail?: string;
}

export default function QRScannerScreen({ userEmail }: QRScannerScreenProps) {
  const { t } = useLanguage();
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
    executeQRCodeAction(processedData, userEmail, false, t);
  };

  // Verificar permissões e dispositivo
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            {t('cameraPermissionMessage')}
          </Text>
          <Text style={styles.permissionSubtext}>
            {t('grantPermission')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (device == null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('error')}</Text>
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
            <Text style={styles.title}>{t('scanQRCode')}</Text>
            <Text style={styles.subtitle}>
              {t('pointCamera')}
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
                  {getTypeDisplayName(qrCodeData.type, t)} {t('scanResult')}!
                </Text>
                <Text style={styles.resultData} numberOfLines={3}>
                  {qrCodeData.description}
                </Text>
                <Text style={styles.actionText}>
                  {getTranslatedActionText(qrCodeData.type, t)}
                </Text>
              </View>
            ) : (
              <Text style={styles.instructionText}>
                {t('pointCamera')}
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getTypeDisplayName(type: string, t: (key: string) => string): string {
  const typeNames: Record<string, string> = {
    'url': t('url'),
    'contact': t('contact'),
    'wifi': t('wifi'),
    'sms': t('sms'),
    'phone': t('phone'),
    'email': t('email'),
    'geo': 'Localização',
    'text': t('text')
  };
  
  return typeNames[type] || 'QR Code';
}

function getTranslatedActionText(type: string, t: (key: string) => string): string {
  const actionTexts: Record<string, string> = {
    'url': t('openLink'),
    'contact': t('saveContact'),
    'wifi': t('connectWifi'),
    'sms': t('sendSMS'),
    'phone': t('call'),
    'email': t('sendEmail'),
    'geo': t('openMap'),
    'text': t('copyText')
  };
  
  return actionTexts[type] || t('copyText');
}