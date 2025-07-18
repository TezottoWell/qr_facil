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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './styles';
import { insertQRCode, QRCodeData } from '../../services/database';
import StyledQRCode, { QRCodeStyle } from '../../components/StyledQRCode';

// Componente QRCode real com estilos
const QRCodeSVG = ({ value, size, backgroundColor, color, logoEnabled, logoSize, errorCorrectionLevel, selectedIcon, qrStyle, gradientColors, customLogoUri, logoType }: any) => (
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
    <StyledQRCode
      value={value || 'https://example.com'}
      size={size - 20}
      backgroundColor={backgroundColor || '#FFFFFF'}
      foregroundColor={'#000000'}
      logoEnabled={logoEnabled}
      logoSize={logoSize}
      logoIcon={selectedIcon}
      customLogoUri={customLogoUri}
      logoType={logoType}
      errorCorrectionLevel={errorCorrectionLevel || 'M'}
      style={qrStyle}
      gradientColors={gradientColors}
    />
  </View>
);

// Componente QRCode para captura (sem bordas/padding extras)
const QRCodeForCapture = ({ value, size, backgroundColor, color, logoEnabled, logoSize, errorCorrectionLevel, selectedIcon, qrStyle, gradientColors, customLogoUri, logoType }: any) => (
  <View style={{
    width: size,
    height: size,
    backgroundColor: backgroundColor || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  }}>
    <StyledQRCode
      value={value || 'https://example.com'}
      size={size - 20}
      backgroundColor={backgroundColor || '#FFFFFF'}
      foregroundColor={'#000000'}
      logoEnabled={logoEnabled}
      logoSize={logoSize}
      logoIcon={selectedIcon}
      customLogoUri={customLogoUri}
      logoType={logoType}
      errorCorrectionLevel={errorCorrectionLevel || 'M'}
      style={qrStyle}
      gradientColors={gradientColors}
    />
  </View>
);

interface NewQRCodeScreenProps {
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
];

const ERROR_CORRECTION_LEVELS = [
  { id: 'L', label: 'Baixo (7%)', description: 'Rápido, menos resistente' },
  { id: 'M', label: 'Médio (15%)', description: 'Equilibrado (Recomendado)' },
  { id: 'Q', label: 'Alto (25%)', description: 'Mais resistente' },
  { id: 'H', label: 'Máximo (30%)', description: 'Máxima resistência' },
];

export default function NewQRCodeScreen({ userEmail = 'test@example.com' }: NewQRCodeScreenProps) {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<QRCodeData['qr_type']>('text');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [logoSize, setLogoSize] = useState(0.2);
  const [selectedIcon, setSelectedIcon] = useState('❤️');
  const [customLogoUri, setCustomLogoUri] = useState<string | null>(null);
  const [logoType, setLogoType] = useState<'icon' | 'image'>('icon');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [showCustomization, setShowCustomization] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>('traditional');
  const [gradientColors, setGradientColors] = useState(['#000000']);
  const previewRef = useRef<ViewShot>(null);
  
  // Estados para manter dados do último QR Code gerado (para compartilhamento)
  const [lastGeneratedQR, setLastGeneratedQR] = useState<{
    content: string;
    title: string;
    type: string;
    style: QRCodeStyle;
    backgroundColor: string;
    logoEnabled: boolean;
    logoSize: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    selectedIcon: string;
    customLogoUri: string | null;
    logoType: 'icon' | 'image';
    gradientColors: string[];
  } | null>(null);

  // Função para selecionar imagem
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCustomLogoUri(result.assets[0].uri);
        setLogoType('image');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

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


    try {
      setIsGenerating(true);

      const qrData: QRCodeData = {
        title,
        content: formatContent(),
        qr_type: selectedType,
        qr_style: qrStyle,
        background_color: backgroundColor,
        foreground_color: '#000000', // Valor padrão, será sobrescrito pela paleta
        gradient_colors: gradientColors,
        logo_enabled: logoEnabled,
        logo_size: logoSize,
        logo_icon: selectedIcon,
        custom_logo_uri: customLogoUri,
        logo_type: logoType,
        error_correction_level: errorCorrectionLevel
      };

      await insertQRCode(userEmail, qrData);

      // Salvar dados do QR Code gerado para compartilhamento
      setLastGeneratedQR({
        content: formatContent(),
        title: title,
        type: selectedType,
        style: qrStyle,
        backgroundColor: backgroundColor,
        logoEnabled: logoEnabled,
        logoSize: logoSize,
        errorCorrectionLevel: errorCorrectionLevel,
        selectedIcon: selectedIcon,
        gradientColors: gradientColors,
        customLogoUri: customLogoUri,
        logoType: logoType
      });

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
                  // Aguardar um pouco para garantir renderização
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  console.log('Iniciando captura...');
                  
                  const imageUri = await previewRef.current.capture();
                  
                  console.log('Captura realizada:', imageUri);
                  
                  if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(imageUri, {
                      mimeType: 'image/png',
                      dialogTitle: `Compartilhar QR Code - ${lastGeneratedQR?.title || 'QR Code'}`,
                    });
                  } else {
                    Alert.alert('Erro', 'Compartilhamento não está disponível neste dispositivo.');
                  }
                }
              } catch (error) {
                console.error('Erro ao compartilhar:', error);
                Alert.alert('Erro', `Não foi possível compartilhar o QR Code: ${error.message}`);
              }
            }
          },
          { text: 'Voltar', onPress: () => navigation.navigate('Home' as never) }
        ]
      );

      // Limpar formulário
      setTitle('');
      setContent('');
      setSelectedType('text');
      setSelectedIcon('❤️');
      setLogoEnabled(false);
      setLogoSize(0.2);
      setQrStyle('traditional');
      setGradientColors(['#000000']);
      setWifiData({ ssid: '', password: '', security: 'WPA', hidden: false });
      setContactData({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });

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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home' as never)}>
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
            style={{ 
              position: 'absolute', 
              top: -10000, 
              left: -10000, 
              width: 400, 
              height: 400,
              backgroundColor: '#FFFFFF'
            }}
          >
            <QRCodeForCapture
              value={lastGeneratedQR?.content || formatContent() || 'Preview'}
              size={400}
              backgroundColor={lastGeneratedQR?.backgroundColor || backgroundColor}
              color={'#000000'}
              logoEnabled={lastGeneratedQR?.logoEnabled || logoEnabled}
              logoSize={lastGeneratedQR?.logoSize || logoSize}
              errorCorrectionLevel={lastGeneratedQR?.errorCorrectionLevel || errorCorrectionLevel}
              selectedIcon={lastGeneratedQR?.selectedIcon || selectedIcon}
              qrStyle={lastGeneratedQR?.style || qrStyle}
              gradientColors={lastGeneratedQR?.gradientColors || gradientColors}
              customLogoUri={lastGeneratedQR?.customLogoUri || customLogoUri}
              logoType={lastGeneratedQR?.logoType || logoType}
            />
          </ViewShot>
          <QRCodeSVG
            value={formatContent() || 'Preview'}
            size={150}
            backgroundColor={backgroundColor}
            color={'#000000'}
            logoEnabled={logoEnabled}
            logoSize={logoSize}
            errorCorrectionLevel={errorCorrectionLevel}
            selectedIcon={selectedIcon}
            qrStyle={qrStyle}
            gradientColors={gradientColors}
            customLogoUri={customLogoUri}
            logoType={logoType}
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
              {/* Estilo do QR Code */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>✨ Estilo do QR Code</Text>
                
                <View style={styles.styleGrid}>
                  <TouchableOpacity
                    style={[styles.styleOption, qrStyle === 'traditional' && styles.styleOptionActive]}
                    onPress={() => setQrStyle('traditional')}
                  >
                    <View style={styles.stylePreview}>
                      <View style={styles.traditionalPreview}>
                        <View style={styles.traditionalSquare} />
                      </View>
                    </View>
                    <Text style={[styles.styleLabel, qrStyle === 'traditional' && styles.styleLabelActive]}>
                      Tradicional
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.styleOption, qrStyle === 'instagram' && styles.styleOptionActive]}
                    onPress={() => setQrStyle('instagram')}
                  >
                    <View style={styles.stylePreview}>
                      <View style={styles.instagramPreview}>
                        <View style={styles.instagramDot} />
                        <View style={styles.instagramDot} />
                        <View style={styles.instagramDot} />
                        <View style={styles.instagramDot} />
                      </View>
                    </View>
                    <Text style={[styles.styleLabel, qrStyle === 'instagram' && styles.styleLabelActive]}>
                      Instagram
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.styleOption, qrStyle === 'dots' && styles.styleOptionActive]}
                    onPress={() => setQrStyle('dots')}
                  >
                    <View style={styles.stylePreview}>
                      <View style={styles.dotsPreview}>
                        <View style={styles.dotStyle} />
                        <View style={styles.dotStyle} />
                        <View style={styles.dotStyle} />
                        <View style={styles.dotStyle} />
                      </View>
                    </View>
                    <Text style={[styles.styleLabel, qrStyle === 'dots' && styles.styleLabelActive]}>
                      Pontos
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.styleOption, qrStyle === 'rounded' && styles.styleOptionActive]}
                    onPress={() => setQrStyle('rounded')}
                  >
                    <View style={styles.stylePreview}>
                      <View style={styles.roundedPreview}>
                        <View style={styles.roundedSquare} />
                      </View>
                    </View>
                    <Text style={[styles.styleLabel, qrStyle === 'rounded' && styles.styleLabelActive]}>
                      Arredondado
                    </Text>
                  </TouchableOpacity>
                </View>

                {(qrStyle === 'instagram' || qrStyle === 'rounded' || qrStyle === 'traditional' || qrStyle === 'dots') && (
                  <View style={styles.gradientSection}>
                    <Text style={styles.gradientLabel}>
                      Paleta de Cores
                    </Text>
                    <View style={styles.gradientPresets}>
                      {/* Cores Sólidas */}
                      <Text style={[styles.gradientLabel, { fontSize: 14, marginTop: 10, marginBottom: 5 }]}>Cores Sólidas</Text>
                      
                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#000000'])}
                      >
                        <View style={[styles.gradientPresetColor, { backgroundColor: '#000000' }]} />
                        <Text style={styles.gradientPresetLabel}>Preto</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#1E3A8A'])}
                      >
                        <View style={[styles.gradientPresetColor, { backgroundColor: '#1E3A8A' }]} />
                        <Text style={styles.gradientPresetLabel}>Azul</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#059669'])}
                      >
                        <View style={[styles.gradientPresetColor, { backgroundColor: '#059669' }]} />
                        <Text style={styles.gradientPresetLabel}>Verde</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#DC2626'])}
                      >
                        <View style={[styles.gradientPresetColor, { backgroundColor: '#DC2626' }]} />
                        <Text style={styles.gradientPresetLabel}>Vermelho</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#7C3AED'])}
                      >
                        <View style={[styles.gradientPresetColor, { backgroundColor: '#7C3AED' }]} />
                        <Text style={styles.gradientPresetLabel}>Roxo</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#EA580C'])}
                      >
                        <View style={[styles.gradientPresetColor, { backgroundColor: '#EA580C' }]} />
                        <Text style={styles.gradientPresetLabel}>Laranja</Text>
                      </TouchableOpacity>

                      {/* Gradientes */}
                      <Text style={[styles.gradientLabel, { fontSize: 14, marginTop: 15, marginBottom: 5 }]}>Gradientes</Text>
                      
                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#F58529', '#DD2A7B', '#8134AF', '#515BD4'])}
                      >
                        <LinearGradient
                          colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Instagram</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#667eea', '#764ba2'])}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Oceano</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#11998e', '#38ef7d'])}
                      >
                        <LinearGradient
                          colors={['#11998e', '#38ef7d']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Menta</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#fc466b', '#3f5efb'])}
                      >
                        <LinearGradient
                          colors={['#fc466b', '#3f5efb']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Vibrante</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#ff9a9e', '#fecfef'])}
                      >
                        <LinearGradient
                          colors={['#ff9a9e', '#fecfef']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Rosa</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#a8edea', '#fed6e3'])}
                      >
                        <LinearGradient
                          colors={['#a8edea', '#fed6e3']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Suave</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#ffecd2', '#fcb69f'])}
                      >
                        <LinearGradient
                          colors={['#ffecd2', '#fcb69f']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Pêssego</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#434343', '#000000'])}
                      >
                        <LinearGradient
                          colors={['#434343', '#000000']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Dark</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.gradientPreset}
                        onPress={() => setGradientColors(['#eecda3', '#ef629f'])}
                      >
                        <LinearGradient
                          colors={['#eecda3', '#ef629f']}
                          style={styles.gradientPresetColor}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.gradientPresetLabel}>Dourado</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Cores */}
              <View style={styles.customSection}>
                <View style={styles.colorRow}>
                  <Text style={styles.customSectionTitle}>🎨 Fundo:</Text>
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
                      <Text style={styles.logoOptionsTitle}>Escolha o tipo de logo:</Text>
                      
                      {/* Opções de tipo de logo */}
                      <View style={styles.logoTypeContainer}>
                        <TouchableOpacity
                          style={[
                            styles.logoTypeButton,
                            logoType === 'icon' && styles.logoTypeButtonActive
                          ]}
                          onPress={() => setLogoType('icon')}
                        >
                          <Text style={[
                            styles.logoTypeButtonText,
                            logoType === 'icon' && styles.logoTypeButtonTextActive
                          ]}>
                            🎨 Ícones
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.logoTypeButton,
                            logoType === 'image' && styles.logoTypeButtonActive
                          ]}
                          onPress={() => setLogoType('image')}
                        >
                          <Text style={[
                            styles.logoTypeButtonText,
                            logoType === 'image' && styles.logoTypeButtonTextActive
                          ]}>
                            📷 Imagem
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {logoType === 'icon' ? (
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
                      ) : (
                        <View style={styles.imageUploadContainer}>
                          <TouchableOpacity 
                            style={styles.imageUploadButton}
                            onPress={pickImage}
                          >
                            {customLogoUri ? (
                              <Image 
                                source={{ uri: customLogoUri }} 
                                style={styles.uploadedImagePreview}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.uploadPlaceholder}>
                                <Text style={styles.uploadPlaceholderText}>📷</Text>
                                <Text style={styles.uploadPlaceholderSubtext}>Tocar para selecionar</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                          
                          {customLogoUri && (
                            <TouchableOpacity 
                              style={styles.removeImageButton}
                              onPress={() => {
                                setCustomLogoUri(null);
                                setLogoType('icon');
                              }}
                            >
                              <Text style={styles.removeImageButtonText}>🗑️ Remover</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
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

