import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles';
import { insertQRCode, QRCodeData } from '../../services/database';

// Simulação do QRCode (será substituído pela biblioteca real)
const QRCodeSVG = ({ value, size, backgroundColor, color, logo }: any) => (
  <View style={[
    styles.qrPreview,
    { 
      width: size, 
      height: size,
      backgroundColor: backgroundColor || '#FFFFFF',
      borderColor: color || '#000000'
    }
  ]}>
    <Text style={[styles.qrPreviewText, { color: color || '#000000' }]}>
      QR Preview{'\n'}{value?.substring(0, 20)}...
    </Text>
    {logo && (
      <View style={[styles.qrLogo, { backgroundColor: color || '#000000' }]}>
        <Text style={styles.qrLogoText}>LOGO</Text>
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
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [showCustomization, setShowCustomization] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
        error_correction_level: errorCorrectionLevel
      };

      await insertQRCode(userEmail, qrData);

      Alert.alert(
        'Sucesso!',
        'QR Code gerado e salvo com sucesso!',
        [
          { text: 'Criar Outro', style: 'default' },
          { text: 'Voltar', onPress: handleBack }
        ]
      );

      // Limpar formulário
      setTitle('');
      setContent('');
      setSelectedType('text');
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <QRCodeSVG
            value={formatContent() || 'Preview'}
            size={150}
            backgroundColor={backgroundColor}
            color={foregroundColor}
            logo={logoEnabled}
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

            <ScrollView style={styles.modalBody}>
              {/* Cores */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>Cores</Text>
                
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Fundo:</Text>
                  <View style={styles.colorOptions}>
                    {['#FFFFFF', '#F5F5F5', '#E3F2FD', '#E8F5E8', '#FFF3E0'].map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          backgroundColor === color && styles.colorOptionActive
                        ]}
                        onPress={() => setBackgroundColor(color)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>QR Code:</Text>
                  <View style={styles.colorOptions}>
                    {['#000000', '#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2'].map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          foregroundColor === color && styles.colorOptionActive
                        ]}
                        onPress={() => setForegroundColor(color)}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Logo */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>Logo Central</Text>
                
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Adicionar logo</Text>
                  <Switch
                    value={logoEnabled}
                    onValueChange={setLogoEnabled}
                    trackColor={{ false: 'rgba(0,0,0,0.3)', true: '#4CAF50' }}
                    thumbColor={logoEnabled ? '#fff' : '#fff'}
                  />
                </View>

                {logoEnabled && (
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Tamanho do logo: {Math.round(logoSize * 100)}%</Text>
                    <View style={styles.sliderTrack}>
                      <TouchableOpacity
                        style={[styles.sliderThumb, { left: `${logoSize * 100 - 5}%` }]}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Correção de erro */}
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>Correção de Erro</Text>
                
                {ERROR_CORRECTION_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.correctionOption,
                      errorCorrectionLevel === level.id && styles.correctionOptionActive
                    ]}
                    onPress={() => setErrorCorrectionLevel(level.id as 'L' | 'M' | 'Q' | 'H')}
                  >
                    <View style={styles.correctionContent}>
                      <Text style={[
                        styles.correctionLabel,
                        errorCorrectionLevel === level.id && styles.correctionLabelActive
                      ]}>
                        {level.label}
                      </Text>
                      <Text style={[
                        styles.correctionDescription,
                        errorCorrectionLevel === level.id && styles.correctionDescriptionActive
                      ]}>
                        {level.description}
                      </Text>
                    </View>
                    {errorCorrectionLevel === level.id && (
                      <Text style={styles.correctionCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}