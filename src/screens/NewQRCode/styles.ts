import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
  },

  // KeyboardAvoidingView
  keyboardAvoidingView: {
    flex: 1,
  },

  // ScrollView content
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  
  // Header
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  headerTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  
  customizeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  customizeIcon: {
    fontSize: 20,
  },
  
  // Conteúdo
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Preview do QR Code
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  qrPreview: {
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  qrPreviewText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
  },
  
  qrLogo: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  qrLogoText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Formulário
  form: {
    gap: 10,
    paddingBottom: 10,
  },
  
  inputContainer: {
    gap: 10,
    marginBottom: 5,
  },
  
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 5,
  },
  
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 5,
  },
  
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Seletor de tipos
  typeSelector: {
    marginVertical: 15,
    paddingBottom: 10,
  },
  
  typeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  typeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  typeIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  
  typeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  typeLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  
  // Seções do formulário
  formSection: {
    gap: 15,
  },
  
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 10,
  },
  
  // Picker de opções
  pickerContainer: {
    gap: 10,
  },
  
  pickerLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  
  pickerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  
  pickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  pickerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  pickerButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  
  pickerButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  
  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  
  switchLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  
  // Botão de gerar
  generateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 18,
    marginVertical: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  generateButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },

  generateButtonDisabled: {
    opacity: 0.5,
  },

  // Botões de ação
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },

  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  // Seção de personalização
  customizationSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  customizationTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 15,
  },

  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },

  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  colorOptionSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
  },

  // Slider de tamanho
  sizeSliderContainer: {
    marginVertical: 15,
  },

  sliderLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 10,
  },

  sizeValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },

  // Estados de erro
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },

  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Modal de compartilhamento
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    height: '90%',
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },

  modalCloseButton: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
    padding: 8,
  },

  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Custom Section
  customSection: {
    marginBottom: 24,
  },

  customSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },

  // Color Section
  colorRow: {
    marginBottom: 16,
  },

  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  colorScrollView: {
    flexGrow: 0,
  },

  colorOptions: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },

  colorSelectedIcon: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Switch Section
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // Logo Options
  logoOptionsContainer: {
    marginBottom: 20,
  },

  logoOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  logoIconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },

  logoIconOption: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  logoIconOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#ede9fe',
  },

  logoIconText: {
    fontSize: 20,
  },

  // Slider Section
  sliderSection: {
    marginTop: 16,
  },

  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },

  sliderContainer: {
    gap: 8,
  },

  sliderTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    position: 'relative',
  },

  sliderFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },

  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: '#667eea',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  sliderDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 16,
  },

  sliderButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  sliderButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  sliderButtonActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#667eea',
  },

  sliderButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 2,
  },

  sliderButtonTextActive: {
    color: '#667eea',
  },

  sliderButtonValue: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },

  sliderButtonValueActive: {
    color: '#8b5cf6',
  },

  // QR Logo Overlay
  qrLogoOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Correction Grid
  correctionGrid: {
    gap: 8,
  },

  correctionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  correctionCardActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#667eea',
  },

  correctionCardContent: {
    flex: 1,
  },

  correctionCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },

  correctionCardLabelActive: {
    color: '#667eea',
  },

  correctionCardDescription: {
    fontSize: 12,
    color: '#6b7280',
  },

  correctionCardDescriptionActive: {
    color: '#8b5cf6',
  },

  correctionCardSelected: {
    width: 24,
    height: 24,
    backgroundColor: '#667eea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  correctionCardCheck: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },

  modalButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },

  modalButtonSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  modalButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  modalButtonTextSecondary: {
    color: '#1f2937',
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
  },

  // Responsividade
  tabletContainer: {
    maxWidth: 600,
    alignSelf: 'center',
  },

  wideScreenPadding: {
    paddingHorizontal: 40,
  },
});