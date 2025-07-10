import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { styles } from './styles';
import { insertQRCode, QRCodeData } from '../../services/database';

// Componente QRCode real
const QRCodeSVG = ({ value, size, backgroundColor, color, logoEnabled, logoSize, errorCorrectionLevel, selectedIcon }: any) => (
  <View style={[
    styles.qrPreview,
    { 
      width: size, 
      height: size,
      backgroundColor: backgroundColor || '#FFFFFF',
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }
  ]}>
    <QRCode
      value={value || 'https://example.com'}
      size={size - 20}
      backgroundColor={backgroundColor || '#FFFFFF'}
      color={color || '#000000'}
      ecl={errorCorrectionLevel || 'M'}
    />
    {logoEnabled && (
      <View style={[
        styles.qrLogoOverlay,
        {
          position: 'absolute',
          width: (size - 20) * logoSize,
          height: (size - 20) * logoSize,
          backgroundColor: backgroundColor || '#FFFFFF',
          borderRadius: ((size - 20) * logoSize) / 2,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: backgroundColor || '#FFFFFF'
        }
      ]}>
        <Text style={{
          fontSize: ((size - 20) * logoSize) * 0.6,
          textAlign: 'center'
        }}>
          {selectedIcon}
        </Text>
      </View>
    )}
  </View>
);

// Componente QRCode para captura (sem bordas/padding extras)
const QRCodeForCapture = ({ value, size, backgroundColor, color, logoEnabled, logoSize, errorCorrectionLevel, selectedIcon }: any) => (
  <View style={{
    width: size,
    height: size,
    backgroundColor: backgroundColor || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  }}>
    <QRCode
      value={value || 'https://example.com'}
      size={size - 20}
      backgroundColor={backgroundColor || '#FFFFFF'}
      color={color || '#000000'}
      ecl={errorCorrectionLevel || 'M'}
    />
    {logoEnabled && (
      <View style={{
        position: 'absolute',
        width: (size - 20) * logoSize,
        height: (size - 20) * logoSize,
        backgroundColor: backgroundColor || '#FFFFFF',
        borderRadius: ((size - 20) * logoSize) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: backgroundColor || '#FFFFFF'
      }}>
        <Text style={{
          fontSize: ((size - 20) * logoSize) * 0.6,
          textAlign: 'center'
        }}>
          {selectedIcon}
        </Text>
      </View>
    )}
  </View>
);

interface NewQRCodeScreenProps {
  handleBack: () => void;
  userEmail?: string;
}

const QR_TYPES = [
  { id: 'text', label: 'Texto', icon: '📝' },
  { id: 'url', label: 'Link/URL', icon: '🔗' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'phone', label: 'Telefone', icon: '📞' },
  { id: 'sms', label: 'SMS', icon: '💬' },
  { id: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { id: 'contact', label: 'Contato', icon: '👤' },
  { id: 'payment', label: 'Pagamento', icon: '💳' },
];

const ERROR_CORRECTION_LEVELS = [
  { id: 'L', label: 'Baixo (7%)', description: 'Rápido, menos resistente' },
  { id: 'M', label: 'Médio (15%)', description: 'Equilibrado (Recomendado)' },
  { id: 'Q', label: 'Alto (25%)', description: 'Mais resistente' },
  { id: 'H', label: 'Máximo (30%)', description: 'Máxima resistência' },
];

export default function NewQRCodeScreen({ handleBack, userEmail = 'test@example.com' }: NewQRCodeScreenProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<QRCodeData['qr_type']>('text');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [logoSize, setLogoSize] = useState(0.2);
  const [selectedIcon, setSelectedIcon] = useState('❤️');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [showCustomization, setShowCustomization] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<ViewShot>(null);

  // Estados para formulários específicos
  const [wifiData, setWifiData] = useState({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  });

  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  const [paymentData, setPaymentData] = useState({
    type: 'PIX',
    key: '',
    amount: '',
    description: ''
  });

  const formatContent = () => {
    switch (selectedType) {
      case 'text':
        return content;
      case 'url':
        return content.startsWith('http') ? content : `https://${content}`;
      case 'email':
        return `mailto:${content}`;
      case 'phone':
        return `tel:${content}`;
      case 'sms':
        return `sms:${content}`;
      case 'wifi':
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`;
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.firstName} ${contactData.lastName}\nTEL:${contactData.phone}\nEMAIL:${contactData.email}\nORG:${contactData.organization}\nURL:${contactData.url}\nEND:VCARD`;
      case 'payment':
        if (paymentData.type === 'PIX') {
          return `${paymentData.key}${paymentData.amount ? `|${paymentData.amount}` : ''}${paymentData.description ? `|${paymentData.description}` : ''}`;
        }
        return content;
      default:
        return content;
    }
  };

  const handleGenerateQRCode = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o QR Code');
      return;
    }

    if (!content.trim() && selectedType !== 'wifi' && selectedType !== 'contact' && selectedType !== 'payment') {
      Alert.alert('Erro', 'Por favor, insira o conteúdo do QR Code');
      return;
    }

    // Validações específicas por tipo
    if (selectedType === 'wifi' && (!wifiData.ssid || !wifiData.password)) {
      Alert.alert('Erro', 'Por favor, preencha o nome da rede e senha do Wi-Fi');
      return;
    }

    if (selectedType === 'contact' && !contactData.firstName) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos o nome do contato');
      return;
    }

    if (selectedType === 'payment' && !paymentData.key) {
      Alert.alert('Erro', 'Por favor, preencha a chave de pagamento');
      return;
    }

    try {
      setIsGenerating(true);

      const qrData: QRCodeData = {
        title,
        content: formatContent(),
        qr_type: selectedType,
        background_color: backgroundColor,
        foreground_color: foregroundColor,
        logo_enabled: logoEnabled,
        logo_size: logoSize,
        logo_icon: selectedIcon,
        error_correction_level: errorCorrectionLevel
      };

      await insertQRCode(userEmail, qrData);

      Alert.alert(
        'Sucesso!',
        'QR Code gerado e salvo com sucesso!',
        [
          { text: 'Criar Outro', style: 'default' },
          { 
            text: 'Compartilhar', 
            onPress: async () => {
              try {
                if (previewRef.current) {
                  const imageUri = await previewRef.current.capture();
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(imageUri, {
                      mimeType: 'image/png',
                      dialogTitle: `Compartilhar QR Code - ${title}`,
                    });
                  }
                }
              } catch (error) {
                console.error('Erro ao compartilhar:', error);
              }
            }
          },
          { text: 'Voltar', onPress: handleBack }
        ]
      );

      // Limpar formulário
      setTitle('');
      setContent('');
      setSelectedType('text');
      setSelectedIcon('❤️');
      setLogoEnabled(false);
      setLogoSize(0.2);
      setWifiData({ ssid: '', password: '', security: 'WPA', hidden: false });
      setContactData({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
      setPaymentData({ type: 'PIX', key: '', amount: '', description: '' });

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o QR Code. Tente novamente.');
      console.error('Erro ao gerar QR Code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case 'wifi':
        return (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Configurações Wi-Fi</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da rede (SSID)"
              value={wifiData.ssid}
              onChangeText={(text) => setWifiData({ ...wifiData, ssid: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={wifiData.password}
              onChangeText={(text) => setWifiData({ ...wifiData, password: text })}
              secureTextEntry
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Segurança:</Text>
              <View style={styles.pickerButtons}>
                {['WPA', 'WEP', 'None'].map((security) => (
                  <TouchableOpacity
                    key={security}
                    style={[
                      styles.pickerButton,
                      wifiData.security === security && styles.pickerButtonActive
                    ]}
                    onPress={() => setWifiData({ ...wifiData, security })}
                  >
                    <Text style={[
                      styles.pickerButtonText,
                      wifiData.security === security && styles.pickerButtonTextActive
                    ]}>
                      {security}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Rede oculta</Text>
              <Switch
                value={wifiData.hidden}
                onValueChange={(value) => setWifiData({ ...wifiData, hidden: value })}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#4CAF50' }}
                thumbColor={wifiData.hidden ? '#fff' : '#fff'}
              />
            </View>
          </View>
        );

      case 'contact':
        return (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informações do Contato</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome *"
              value={contactData.firstName}
              onChangeText={(text) => setContactData({ ...contactData, firstName: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Sobrenome"
              value={contactData.lastName}
              onChangeText={(text) => setContactData({ ...contactData, lastName: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              value={contactData.phone}
              onChangeText={(text) => setContactData({ ...contactData, phone: text })}
              keyboardType="phone-pad"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={contactData.email}
              onChangeText={(text) => setContactData({ ...contactData, email: text })}
              keyboardType="email-address"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Empresa/Organização"
              value={contactData.organization}
              onChangeText={(text) => setContactData({ ...contactData, organization: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Website"
              value={contactData.url}
              onChangeText={(text) => setContactData({ ...contactData, url: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>
        );

      case 'payment':
        return (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Dados de Pagamento</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo:</Text>
              <View style={styles.pickerButtons}>
                {['PIX', 'Bitcoin', 'Outro'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerButton,
                      paymentData.type === type && styles.pickerButtonActive
                    ]}
                    onPress={() => setPaymentData({ ...paymentData, type })}
                  >
                    <Text style={[
                      styles.pickerButtonText,
                      paymentData.type === type && styles.pickerButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder={paymentData.type === 'PIX' ? 'Chave PIX' : 'Endereço/Chave *'}
              value={paymentData.key}
              onChangeText={(text) => setPaymentData({ ...paymentData, key: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Valor (opcional)"
              value={paymentData.amount}
              onChangeText={(text) => setPaymentData({ ...paymentData, amount: text })}
              keyboardType="numeric"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TextInput
              style={styles.input}
              placeholder="Descrição (opcional)"
              value={paymentData.description}
              onChangeText={(text) => setPaymentData({ ...paymentData, description: text })}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>
        );

      default:
        return (
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder={`Digite o ${QR_TYPES.find(t => t.id === selectedType)?.label.toLowerCase() || 'conteúdo'}...`}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
            placeholderTextColor="rgba(255,255,255,0.7)"
          />
        );
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo QR Code</Text>
        <TouchableOpacity 
          style={styles.customizeButton} 
          onPress={() => setShowCustomization(true)}
        >
          <Text style={styles.customizeIcon}>🎨</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
        {/* Preview */}
        <View style={styles.previewContainer}>
          <ViewShot
            ref={previewRef}
            options={{
              format: 'png',
              quality: 1.0,
              result: 'tmpfile',
            }}
            style={{ opacity: 0, position: 'absolute', top: -1000 }}
          >
            <QRCodeForCapture
              value={formatContent() || 'Preview'}
              size={200}
              backgroundColor={backgroundColor}
              color={foregroundColor}
              logoEnabled={logoEnabled}
              logoSize={logoSize}
              errorCorrectionLevel={errorCorrectionLevel}
              selectedIcon={selectedIcon}
            />
          </ViewShot>
          <QRCodeSVG
            value={formatContent() || 'Preview'}
            size={150}
            backgroundColor={backgroundColor}
            color={foregroundColor}
            logoEnabled={logoEnabled}
            logoSize={logoSize}
            errorCorrectionLevel={errorCorrectionLevel}
            selectedIcon={selectedIcon}
          />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Título do QR Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Cartão de visita, Wi-Fi casa..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>

          {/* Tipo de QR Code */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tipo de QR Code</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {QR_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonActive
                  ]}
                  onPress={() => setSelectedType(type.id as QRCodeData['qr_type'])}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    selectedType === type.id && styles.typeLabelActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Campos do formulário */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Conteúdo</Text>
            {renderFormFields()}
          </View>
        </View>

        {/* Botão de gerar */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={handleGenerateQRCode}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Gerando...' : 'Gerar QR Code'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de customização */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCustomization}
        onRequestClose={() => setShowCustomization(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personalizar QR Code</Text>
              <TouchableOpacity onPress={() => setShowCustomization(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Cores */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>🎨 Cores</Text>
                
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Fundo:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScrollView}>
                    <View style={styles.colorOptions}>
                      {['#FFFFFF', '#F5F5F5', '#E3F2FD', '#E8F5E8', '#FFF3E0', '#FFEBEE', '#F3E5F5', '#E8EAF6'].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            backgroundColor === color && styles.colorOptionSelected
                          ]}
                          onPress={() => setBackgroundColor(color)}
                        >
                          {backgroundColor === color && (
                            <Text style={styles.colorSelectedIcon}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>QR Code:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScrollView}>
                    <View style={styles.colorOptions}>
                      {['#000000', '#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#795548', '#607D8B'].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            foregroundColor === color && styles.colorOptionSelected
                          ]}
                          onPress={() => setForegroundColor(color)}
                        >
                          {foregroundColor === color && (
                            <Text style={styles.colorSelectedIcon}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Logo */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>🖼️ Logo Central</Text>
                
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Adicionar logo</Text>
                  <Switch
                    value={logoEnabled}
                    onValueChange={setLogoEnabled}
                    trackColor={{ false: 'rgba(0,0,0,0.2)', true: '#667eea' }}
                    thumbColor='#ffffff'
                  />
                </View>

                {logoEnabled && (
                  <>
                    <View style={styles.logoOptionsContainer}>
                      <Text style={styles.logoOptionsTitle}>Escolha um ícone:</Text>
                      <View style={styles.logoIconsGrid}>
                        {['❤️', '⭐', '🔥', '💎', '🎯', '🚀', '💡', '🎨', '🎵', '📱', '🌟', '⚡'].map((icon) => (
                          <TouchableOpacity
                            key={icon}
                            style={[
                              styles.logoIconOption,
                              selectedIcon === icon && styles.logoIconOptionSelected
                            ]}
                            onPress={() => setSelectedIcon(icon)}
                          >
                            <Text style={styles.logoIconText}>{icon}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.sliderSection}>
                      <View style={styles.sliderLabelRow}>
                        <Text style={styles.sliderLabel}>Tamanho do ícone</Text>
                        <Text style={styles.sliderValue}>{Math.round(logoSize * 100)}%</Text>
                      </View>
                      
                      <Text style={styles.sliderDescription}>
                        Controla o tamanho do ícone no centro do QR code
                      </Text>
                      
                      <View style={styles.sliderContainer}>
                        <View style={styles.sliderTrack}>
                          <View style={[styles.sliderFill, { width: `${logoSize * 100}%` }]} />
                          <View style={[styles.sliderThumb, { left: `${logoSize * 100 - 2}%` }]} />
                        </View>
                        
                        <View style={styles.sliderButtons}>
                          <TouchableOpacity 
                            style={[styles.sliderButton, logoSize === 0.1 && styles.sliderButtonActive]}
                            onPress={() => setLogoSize(0.1)}
                          >
                            <Text style={[styles.sliderButtonText, logoSize === 0.1 && styles.sliderButtonTextActive]}>Pequeno</Text>
                            <Text style={[styles.sliderButtonValue, logoSize === 0.1 && styles.sliderButtonValueActive]}>10%</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.sliderButton, logoSize === 0.2 && styles.sliderButtonActive]}
                            onPress={() => setLogoSize(0.2)}
                          >
                            <Text style={[styles.sliderButtonText, logoSize === 0.2 && styles.sliderButtonTextActive]}>Médio</Text>
                            <Text style={[styles.sliderButtonValue, logoSize === 0.2 && styles.sliderButtonValueActive]}>20%</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[styles.sliderButton, logoSize === 0.3 && styles.sliderButtonActive]}
                            onPress={() => setLogoSize(0.3)}
                          >
                            <Text style={[styles.sliderButtonText, logoSize === 0.3 && styles.sliderButtonTextActive]}>Grande</Text>
                            <Text style={[styles.sliderButtonValue, logoSize === 0.3 && styles.sliderButtonValueActive]}>30%</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Correção de erro */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>⚙️ Qualidade</Text>
                
                <View style={styles.correctionGrid}>
                  {ERROR_CORRECTION_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      style={[
                        styles.correctionCard,
                        errorCorrectionLevel === level.id && styles.correctionCardActive
                      ]}
                      onPress={() => setErrorCorrectionLevel(level.id as 'L' | 'M' | 'Q' | 'H')}
                    >
                      <View style={styles.correctionCardContent}>
                        <Text style={[
                          styles.correctionCardLabel,
                          errorCorrectionLevel === level.id && styles.correctionCardLabelActive
                        ]}>
                          {level.label}
                        </Text>
                        <Text style={[
                          styles.correctionCardDescription,
                          errorCorrectionLevel === level.id && styles.correctionCardDescriptionActive
                        ]}>
                          {level.description}
                        </Text>
                      </View>
                      {errorCorrectionLevel === level.id && (
                        <View style={styles.correctionCardSelected}>
                          <Text style={styles.correctionCardCheck}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}