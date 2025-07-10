import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
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
    gap: 20,
  },
  
  inputContainer: {
    gap: 10,
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
  },
  
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Seletor de tipos
  typeSelector: {
    marginVertical: 10,
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