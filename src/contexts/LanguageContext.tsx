import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traduções
const translations = {
  'pt-BR': {
    // Headers
    'account': 'Conta',
    'newQRCode': 'Novo QR Code',
    'createQRCode': 'Criar QR Code',
    'myQRCodes': 'Meus Códigos',
    'history': 'Histórico',
    'myHistory': 'Meu Histórico',
    'scanner': 'Scanner',
    'qrScanner': 'QR Scanner',
    
    // Account Screen
    'plan': 'Plano',
    'active': 'Ativo',
    'inactive': 'Inativo',
    'planActiveDescription': 'Seu plano premium está ativo e você tem acesso a todas as funcionalidades.',
    'planInactiveDescription': 'Adquira o plano premium para ter acesso a funcionalidades avançadas.',
    'language': 'Linguagem',
    'portuguese': 'Português',
    'english': 'English',
    'spanish': 'Español',
    
    // QR Types
    'text': 'Texto',
    'url': 'Link/URL',
    'email': 'Email',
    'phone': 'Telefone',
    'sms': 'SMS',
    'wifi': 'Wi-Fi',
    'contact': 'Contato',
    
    // NewQRCode Screen
    'qrType': 'Tipo de QR Code',
    'content': 'Conteúdo',
    'enterText': 'Digite o texto',
    'enterUrl': 'Digite a URL',
    'enterEmail': 'Digite o email',
    'enterPhone': 'Digite o telefone',
    'enterMessage': 'Digite a mensagem',
    'networkName': 'Nome da rede',
    'password': 'Senha',
    'security': 'Segurança',
    'contactName': 'Nome',
    'organization': 'Empresa',
    'generate': 'Gerar QR Code',
    'customize': 'Personalizar',
    'share': 'Compartilhar',
    'save': 'Salvar',
    'title': 'Título',
    'enterTitle': 'Digite um título',
    
    // MyQRCodes Screen
    'searchQRCodes': 'Buscar QR Codes',
    'noQRCodes': 'Nenhum QR Code encontrado',
    'createFirstQR': 'Crie seu primeiro QR Code!',
    'delete': 'Excluir',
    'confirmDelete': 'Confirmar exclusão',
    'deleteMessage': 'Tem certeza que deseja excluir este QR Code?',
    'deleteWarning': 'Esta ação não pode ser desfeita.',
    'cancel': 'Cancelar',
    'confirm': 'Confirmar',
    'qrCodeDetails': 'Detalhes do QR Code',
    'type': 'Tipo',
    'createdAt': 'Criado em',
    'close': 'Fechar',
    
    // History Screen
    'scanHistory': 'Histórico de Escaneamentos',
    'noHistory': 'Nenhum histórico encontrado',
    'startScanning': 'Comece a escanear QR Codes!',
    'clearHistory': 'Limpar Histórico',
    'confirmClearHistory': 'Confirmar limpeza',
    'clearHistoryMessage': 'Tem certeza que deseja limpar todo o histórico?',
    'clearHistoryWarning': 'Todos os registros serão removidos permanentemente.',
    'deleteItemMessage': 'Deseja realmente excluir este item do histórico?',
    'scannedAt': 'Escaneado em',
    'openLink': 'Abrir Link',
    'copyText': 'Copiar Texto',
    
    // Action Texts
    'saveContact': 'Salvar Contato',
    'connectWifi': 'Conectar WiFi',
    'sendSMS': 'Enviar SMS',
    'call': 'Ligar',
    'sendEmail': 'Enviar Email',
    'openMap': 'Abrir no Mapa',
    'copyText': 'Copiar Texto',
    'openLink': 'Abrir Link',
    
    // Modal Content
    'detected': 'detectado',
    'name': 'Nome',
    'phones': 'Telefones',
    'emails': 'Emails',
    'company': 'Empresa',
    'network': 'Rede',
    'securityType': 'Tipo',
    'noPassword': 'Sem senha',
    'number': 'Número',
    'message': 'Mensagem',
    'subject': 'Assunto',
    'latitude': 'Latitude',
    'longitude': 'Longitude',
    'notInformed': 'Não informado',
    'copyPassword': 'Copiar Senha',
    'openSettings': 'Abrir Configurações',
    'copyNumber': 'Copiar Número',
    'copyEmail': 'Copiar Email',
    'copyCoordinates': 'Copiar Coordenadas',
    'saveData': 'Salvar Dados',
    
    // NewQRCode Screen - Modal customization
    'styleQRCode': 'Estilo do QR Code',
    'colorPalette': 'Paleta de Cores',
    'solidColors': 'Cores Sólidas',
    'gradients': 'Gradientes',
    'black': 'Preto',
    'blue': 'Azul',
    'green': 'Verde',
    'red': 'Vermelho',
    'purple': 'Roxo',
    'orange': 'Laranja',
    'instagram': 'Instagram',
    'ocean': 'Oceano',
    'mint': 'Menta',
    'vibrant': 'Vibrante',
    'pink': 'Rosa',
    'smooth': 'Suave',
    'peach': 'Pêssego',
    'dark': 'Dark',
    'golden': 'Dourado',
    'background': 'Fundo',
    'centralLogo': 'Logo Central',
    'addLogo': 'Adicionar logo',
    'chooseLogoType': 'Escolha o tipo de logo:',
    'icons': 'Ícones',
    'image': 'Imagem',
    'tapToSelect': 'Tocar para selecionar',
    'remove': 'Remover',
    'iconSize': 'Tamanho do ícone',
    'iconSizeDescription': 'Controla o tamanho do ícone no centro do QR code',
    'small': 'Pequeno',
    'medium': 'Médio',
    'large': 'Grande',
    'quality': 'Qualidade',
    
    // NewQRCode Screen - WiFi form
    'wifiSettings': 'Configurações Wi-Fi',
    'networkSSID': 'Nome da rede (SSID)',
    'hiddenNetwork': 'Rede oculta',
    
    // NewQRCode Screen - Contact form
    'contactInfo': 'Informações do Contato',
    'firstName': 'Nome',
    'lastName': 'Sobrenome',
    'website': 'Website',
    'requiredField': ' *',
    
    // NewQRCode Screen - Error messages
    'enterTitle': 'Por favor, insira um título para o QR Code',
    'enterContent': 'Por favor, insira o conteúdo do QR Code',
    'fillWifiFields': 'Por favor, preencha o nome da rede e senha do Wi-Fi',
    'fillContactName': 'Por favor, preencha pelo menos o nome do contato',
    'imagePermissionTitle': 'Permissão necessária',
    'imagePermissionMessage': 'Precisamos de permissão para acessar suas fotos.',
    'imageSelectionError': 'Não foi possível selecionar a imagem.',
    'shareDialogTitle': 'Compartilhar QR Code',
    'shareError': 'Não foi possível compartilhar o QR Code',
    'shareNotAvailable': 'Compartilhamento não está disponível neste dispositivo.',
    'qrSaveError': 'Não foi possível salvar o QR Code. Tente novamente.',
    'back': 'Voltar',
    'translationDisclaimer': 'O app pode não estar 100% traduzido ainda',
    
    // Login Screen
    'loginToContinue': 'Faça login para continuar',
    'loggingIn': 'Entrando...',
    'continueWithGoogle': 'Continuar com Google',
    'or': 'ou',
    'termsDisclaimer': 'Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade',
    'newToApp': 'Novo no QR Fácil?',
    'learnMore': 'Saiba mais',
    'welcome': 'Bem-vindo',
    'loginCancelled': 'Login cancelado pelo usuário',
    'cancelled': 'Cancelado',
    'pleaseWait': 'Aguarde',
    'loginInProgress': 'Login em progresso...',
    'playServicesNotAvailable': 'Google Play Services não disponível',
    'loginError': 'Algo deu errado durante o login',
    'databaseNotReady': 'Banco de dados não está pronto. Tente novamente em alguns segundos.',
    'logoutSuccess': 'Logout realizado com sucesso!',
    'logoutError': 'Erro ao fazer logout',
    
    // Danger Zone
    'dangerZone': 'Zona Perigosa',
    'deleteAccount': 'Deletar Conta',
    'deleteAccountDescription': 'Excluir permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.',
    'confirmDeleteAccount': 'Confirmar Exclusão da Conta',
    'deleteAccountWarning': 'Esta ação irá permanentemente deletar sua conta e todos os dados associados, incluindo:',
    'deleteAccountItems': '• Todos os QR Codes salvos\n• Todo o histórico de escaneamentos\n• Todas as configurações personalizadas\n• Dados do perfil',
    'deleteAccountConfirmation': 'Para confirmar, digite "DELETAR" abaixo:',
    'typeDeleteToConfirm': 'Digite DELETAR para confirmar',
    'deleteAccountSuccess': 'Conta deletada com sucesso',
    'deleteAccountError': 'Erro ao deletar conta. Tente novamente.',
    'confirmationRequired': 'É necessário digitar "DELETAR" para confirmar',
    'accountDeletionInProgress': 'Deletando conta...',

    // Premium/Upgrade
    'upgradeToPro': 'Upgrade para PRO',
    'unlockFullAccess': 'Desbloqueie acesso completo ao app',
    'oneTimePayment': 'Pagamento único',
    'noSubscription': 'Sem mensalidades ou assinaturas',
    'whatYouGet': 'O que você ganha:',
    'upgradeNow': 'Fazer Upgrade Agora',
    'maybeLater': 'Talvez Depois',
    'unlimitedQRCodes': 'QR Codes Ilimitados',
    'unlimitedQRCodesDesc': 'Crie quantos QR Codes quiser',
    'allStyles': 'Todos os Estilos',
    'allStylesDesc': 'Instagram, Dots, Rounded e mais',
    'fullCustomization': 'Customização Completa',
    'fullCustomizationDesc': 'Cores, gradientes e logos personalizados',
    'accessMyQRCodes': 'Acesso aos Meus Códigos',
    'accessMyQRCodesDesc': 'Gerencie todos seus QR Codes salvos',
    'featureLocked': 'Recurso Bloqueado',
    'upgradeToUnlock': 'Faça upgrade para desbloquear',
    'freeQRUsed': 'QR Code gratuito já usado',
    'oneFreeQROnly': 'Você pode criar apenas 1 QR Code gratuito',
    
    // QRScanner Screen
    'scanQRCode': 'Escanear QR Code',
    'pointCamera': 'Aponte a câmera para o QR Code',
    'flashlight': 'Lanterna',
    'gallery': 'Galeria',
    'selectFromGallery': 'Selecionar da Galeria',
    'cameraPermission': 'Permissão da Câmera',
    'cameraPermissionMessage': 'Precisamos de acesso à câmera para escanear QR Codes.',
    'grantPermission': 'Conceder Permissão',
    'permissionDenied': 'Permissão Negada',
    'noQRCodeFound': 'Nenhum QR Code encontrado na imagem',
    'invalidQRCode': 'QR Code inválido',
    'scanResult': 'detectado',
    
    // Error Correction Levels
    'errorCorrectionLow': 'Baixo (7%)',
    'errorCorrectionMedium': 'Médio (15%)',
    'errorCorrectionQuartile': 'Alto (25%)',
    'errorCorrectionHigh': 'Muito Alto (30%)',
    'fastLessResistant': 'Rápido, menos resistente',
    'balanced': 'Equilibrado (Recomendado)',
    'goodForPrint': 'Bom para impressão',
    'maximumResistance': 'Máxima resistência',
    
    // QR Styles
    'traditional': 'Tradicional',
    'rounded': 'Arredondado',
    'dots': 'Pontos',
    'instagram': 'Instagram',
    
    // Common
    'user': 'Usuário',
    'loading': 'Carregando...',
    'error': 'Erro',
    'success': 'Sucesso',
    'ok': 'OK',
    'yes': 'Sim',
    'no': 'Não',
    'done': 'Concluído',
    'back': 'Voltar',
    'next': 'Próximo',
    'previous': 'Anterior',
    'retry': 'Tentar Novamente',
  },
  
  'en-US': {
    // Headers
    'account': 'Account',
    'newQRCode': 'New QR Code',
    'createQRCode': 'Create QR Code',
    'myQRCodes': 'My Codes',
    'history': 'History',
    'myHistory': 'My History',
    'scanner': 'Scanner',
    'qrScanner': 'QR Scanner',
    
    // Account Screen
    'plan': 'Plan',
    'active': 'Active',
    'inactive': 'Inactive',
    'planActiveDescription': 'Your premium plan is active and you have access to all features.',
    'planInactiveDescription': 'Get the premium plan to access advanced features.',
    'language': 'Language',
    'portuguese': 'Português',
    'english': 'English',
    'spanish': 'Español',
    
    // QR Types
    'text': 'Text',
    'url': 'Link/URL',
    'email': 'Email',
    'phone': 'Phone',
    'sms': 'SMS',
    'wifi': 'Wi-Fi',
    'contact': 'Contact',
    
    // NewQRCode Screen
    'qrType': 'QR Code Type',
    'content': 'Content',
    'enterText': 'Enter text',
    'enterUrl': 'Enter URL',
    'enterEmail': 'Enter email',
    'enterPhone': 'Enter phone',
    'enterMessage': 'Enter message',
    'networkName': 'Network name',
    'password': 'Password',
    'security': 'Security',
    'contactName': 'Name',
    'organization': 'Organization',
    'generate': 'Generate QR Code',
    'customize': 'Customize',
    'share': 'Share',
    'save': 'Save',
    'title': 'Title',
    'enterTitle': 'Enter a title',
    
    // MyQRCodes Screen
    'searchQRCodes': 'Search QR Codes',
    'noQRCodes': 'No QR Codes found',
    'createFirstQR': 'Create your first QR Code!',
    'delete': 'Delete',
    'confirmDelete': 'Confirm deletion',
    'deleteMessage': 'Are you sure you want to delete this QR Code?',
    'deleteWarning': 'This action cannot be undone.',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'qrCodeDetails': 'QR Code Details',
    'type': 'Type',
    'createdAt': 'Created at',
    'close': 'Close',
    
    // History Screen
    'scanHistory': 'Scan History',
    'noHistory': 'No history found',
    'startScanning': 'Start scanning QR Codes!',
    'clearHistory': 'Clear History',
    'confirmClearHistory': 'Confirm clear',
    'clearHistoryMessage': 'Are you sure you want to clear all history?',
    'clearHistoryWarning': 'All records will be permanently removed.',
    'deleteItemMessage': 'Do you really want to delete this item from history?',
    'scannedAt': 'Scanned at',
    'openLink': 'Open Link',
    'copyText': 'Copy Text',
    
    // Action Texts
    'saveContact': 'Save Contact',
    'connectWifi': 'Connect WiFi',
    'sendSMS': 'Send SMS',
    'call': 'Call',
    'sendEmail': 'Send Email',
    'openMap': 'Open in Map',
    
    // Modal Content
    'detected': 'detected',
    'name': 'Name',
    'phones': 'Phones',
    'emails': 'Emails',
    'company': 'Company',
    'network': 'Network',
    'securityType': 'Type',
    'noPassword': 'No password',
    'number': 'Number',
    'message': 'Message',
    'subject': 'Subject',
    'latitude': 'Latitude',
    'longitude': 'Longitude',
    'notInformed': 'Not informed',
    'copyPassword': 'Copy Password',
    'openSettings': 'Open Settings',
    'copyNumber': 'Copy Number',
    'copyEmail': 'Copy Email',
    'copyCoordinates': 'Copy Coordinates',
    'saveData': 'Save Data',
    
    // NewQRCode Screen - Modal customization
    'styleQRCode': 'QR Code Style',
    'colorPalette': 'Color Palette',
    'solidColors': 'Solid Colors',
    'gradients': 'Gradients',
    'black': 'Black',
    'blue': 'Blue',
    'green': 'Green',
    'red': 'Red',
    'purple': 'Purple',
    'orange': 'Orange',
    'instagram': 'Instagram',
    'ocean': 'Ocean',
    'mint': 'Mint',
    'vibrant': 'Vibrant',
    'pink': 'Pink',
    'smooth': 'Smooth',
    'peach': 'Peach',
    'dark': 'Dark',
    'golden': 'Golden',
    'background': 'Background',
    'centralLogo': 'Central Logo',
    'addLogo': 'Add logo',
    'chooseLogoType': 'Choose logo type:',
    'icons': 'Icons',
    'image': 'Image',
    'tapToSelect': 'Tap to select',
    'remove': 'Remove',
    'iconSize': 'Icon size',
    'iconSizeDescription': 'Controls the size of the icon in the center of the QR code',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'quality': 'Quality',
    
    // NewQRCode Screen - WiFi form
    'wifiSettings': 'Wi-Fi Settings',
    'networkSSID': 'Network name (SSID)',
    'hiddenNetwork': 'Hidden network',
    
    // NewQRCode Screen - Contact form
    'contactInfo': 'Contact Information',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'website': 'Website',
    'requiredField': ' *',
    
    // NewQRCode Screen - Error messages
    'enterTitle': 'Please enter a title for the QR Code',
    'enterContent': 'Please enter the QR Code content',
    'fillWifiFields': 'Please fill in the network name and Wi-Fi password',
    'fillContactName': 'Please fill in at least the contact name',
    'imagePermissionTitle': 'Permission required',
    'imagePermissionMessage': 'We need permission to access your photos.',
    'imageSelectionError': 'Could not select image.',
    'shareDialogTitle': 'Share QR Code',
    'shareError': 'Could not share QR Code',
    'shareNotAvailable': 'Sharing is not available on this device.',
    'qrSaveError': 'Could not save QR Code. Please try again.',
    'back': 'Back',
    'translationDisclaimer': 'The app may not be 100% translated yet',
    
    // Login Screen
    'loginToContinue': 'Sign in to continue',
    'loggingIn': 'Signing in...',
    'continueWithGoogle': 'Continue with Google',
    'or': 'or',
    'termsDisclaimer': 'By continuing, you agree to our Terms of Service and Privacy Policy',
    'newToApp': 'New to QR Easy?',
    'learnMore': 'Learn more',
    'welcome': 'Welcome',
    'loginCancelled': 'Sign in cancelled by user',
    'cancelled': 'Cancelled',
    'pleaseWait': 'Please wait',
    'loginInProgress': 'Sign in in progress...',
    'playServicesNotAvailable': 'Google Play Services not available',
    'loginError': 'Something went wrong during sign in',
    'databaseNotReady': 'Database is not ready. Please try again in a few seconds.',
    'logoutSuccess': 'Successfully signed out!',
    'logoutError': 'Error signing out',
    
    // Danger Zone
    'dangerZone': 'Danger Zone',
    'deleteAccount': 'Delete Account',
    'deleteAccountDescription': 'Permanently delete your account and all associated data. This action cannot be undone.',
    'confirmDeleteAccount': 'Confirm Account Deletion',
    'deleteAccountWarning': 'This action will permanently delete your account and all associated data, including:',
    'deleteAccountItems': '• All saved QR Codes\n• All scan history\n• All custom settings\n• Profile data',
    'deleteAccountConfirmation': 'To confirm, type "DELETE" below:',
    'typeDeleteToConfirm': 'Type DELETE to confirm',
    'deleteAccountSuccess': 'Account successfully deleted',
    'deleteAccountError': 'Error deleting account. Please try again.',
    'confirmationRequired': 'You must type "DELETE" to confirm',
    'accountDeletionInProgress': 'Deleting account...',

    // Premium/Upgrade
    'upgradeToPro': 'Upgrade to PRO',
    'unlockFullAccess': 'Unlock full access to the app',
    'oneTimePayment': 'One-time payment',
    'noSubscription': 'No monthly fees or subscriptions',
    'whatYouGet': 'What you get:',
    'upgradeNow': 'Upgrade Now',
    'maybeLater': 'Maybe Later',
    'unlimitedQRCodes': 'Unlimited QR Codes',
    'unlimitedQRCodesDesc': 'Create as many QR Codes as you want',
    'allStyles': 'All Styles',
    'allStylesDesc': 'Instagram, Dots, Rounded and more',
    'fullCustomization': 'Full Customization',
    'fullCustomizationDesc': 'Colors, gradients and custom logos',
    'accessMyQRCodes': 'Access My QR Codes',
    'accessMyQRCodesDesc': 'Manage all your saved QR Codes',
    'featureLocked': 'Feature Locked',
    'upgradeToUnlock': 'Upgrade to unlock',
    'freeQRUsed': 'Free QR Code already used',
    'oneFreeQROnly': 'You can create only 1 free QR Code',
    
    // QRScanner Screen
    'scanQRCode': 'Scan QR Code',
    'pointCamera': 'Point camera at QR Code',
    'flashlight': 'Flashlight',
    'gallery': 'Gallery',
    'selectFromGallery': 'Select from Gallery',
    'cameraPermission': 'Camera Permission',
    'cameraPermissionMessage': 'We need camera access to scan QR Codes.',
    'grantPermission': 'Grant Permission',
    'permissionDenied': 'Permission Denied',
    'noQRCodeFound': 'No QR Code found in image',
    'invalidQRCode': 'Invalid QR Code',
    'scanResult': 'detected',
    
    // Error Correction Levels
    'errorCorrectionLow': 'Low (7%)',
    'errorCorrectionMedium': 'Medium (15%)',
    'errorCorrectionQuartile': 'High (25%)',
    'errorCorrectionHigh': 'Very High (30%)',
    'fastLessResistant': 'Fast, less resistant',
    'balanced': 'Balanced (Recommended)',
    'goodForPrint': 'Good for printing',
    'maximumResistance': 'Maximum resistance',
    
    // QR Styles
    'traditional': 'Traditional',
    'rounded': 'Rounded',
    'dots': 'Dots',
    'instagram': 'Instagram',
    
    // Common
    'user': 'User',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'ok': 'OK',
    'yes': 'Yes',
    'no': 'No',
    'done': 'Done',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'retry': 'Retry',
  },
  
  'es-ES': {
    // Headers
    'account': 'Cuenta',
    'newQRCode': 'Nuevo Código QR',
    'createQRCode': 'Crear Código QR',
    'myQRCodes': 'Mis Códigos',
    'history': 'Historial',
    'myHistory': 'Mi Historial',
    'scanner': 'Escáner',
    'qrScanner': 'Escáner QR',
    
    // Account Screen
    'plan': 'Plan',
    'active': 'Activo',
    'inactive': 'Inactivo',
    'planActiveDescription': 'Tu plan premium está activo y tienes acceso a todas las funcionalidades.',
    'planInactiveDescription': 'Adquiere el plan premium para acceder a funcionalidades avanzadas.',
    'language': 'Idioma',
    'portuguese': 'Português',
    'english': 'English',
    'spanish': 'Español',
    
    // QR Types
    'text': 'Texto',
    'url': 'Enlace/URL',
    'email': 'Email',
    'phone': 'Teléfono',
    'sms': 'SMS',
    'wifi': 'Wi-Fi',
    'contact': 'Contacto',
    
    // NewQRCode Screen
    'qrType': 'Tipo de Código QR',
    'content': 'Contenido',
    'enterText': 'Ingresa texto',
    'enterUrl': 'Ingresa URL',
    'enterEmail': 'Ingresa email',
    'enterPhone': 'Ingresa teléfono',
    'enterMessage': 'Ingresa mensaje',
    'networkName': 'Nombre de red',
    'password': 'Contraseña',
    'security': 'Seguridad',
    'contactName': 'Nombre',
    'organization': 'Organización',
    'generate': 'Generar Código QR',
    'customize': 'Personalizar',
    'share': 'Compartir',
    'save': 'Guardar',
    'title': 'Título',
    'enterTitle': 'Ingresa un título',
    
    // MyQRCodes Screen
    'searchQRCodes': 'Buscar Códigos QR',
    'noQRCodes': 'No se encontraron Códigos QR',
    'createFirstQR': '¡Crea tu primer Código QR!',
    'delete': 'Eliminar',
    'confirmDelete': 'Confirmar eliminación',
    'deleteMessage': '¿Estás seguro de que quieres eliminar este Código QR?',
    'deleteWarning': 'Esta acción no se puede deshacer.',
    'cancel': 'Cancelar',
    'confirm': 'Confirmar',
    'qrCodeDetails': 'Detalles del Código QR',
    'type': 'Tipo',
    'createdAt': 'Creado en',
    'close': 'Cerrar',
    
    // History Screen
    'scanHistory': 'Historial de Escaneos',
    'noHistory': 'No se encontró historial',
    'startScanning': '¡Comienza a escanear Códigos QR!',
    'clearHistory': 'Limpiar Historial',
    'confirmClearHistory': 'Confirmar limpieza',
    'clearHistoryMessage': '¿Estás seguro de que quieres limpiar todo el historial?',
    'clearHistoryWarning': 'Todos los registros serán eliminados permanentemente.',
    'deleteItemMessage': '¿Realmente quieres eliminar este elemento del historial?',
    'scannedAt': 'Escaneado en',
    'openLink': 'Abrir Enlace',
    'copyText': 'Copiar Texto',
    
    // Action Texts
    'saveContact': 'Guardar Contacto',
    'connectWifi': 'Conectar WiFi',
    'sendSMS': 'Enviar SMS',
    'call': 'Llamar',
    'sendEmail': 'Enviar Email',
    'openMap': 'Abrir en Mapa',
    
    // Modal Content
    'detected': 'detectado',
    'name': 'Nombre',
    'phones': 'Teléfonos',
    'emails': 'Emails',
    'company': 'Empresa',
    'network': 'Red',
    'securityType': 'Tipo',
    'noPassword': 'Sin contraseña',
    'number': 'Número',
    'message': 'Mensaje',
    'subject': 'Asunto',
    'latitude': 'Latitud',
    'longitude': 'Longitud',
    'notInformed': 'No informado',
    'copyPassword': 'Copiar Contraseña',
    'openSettings': 'Abrir Configuración',
    'copyNumber': 'Copiar Número',
    'copyEmail': 'Copiar Email',
    'copyCoordinates': 'Copiar Coordenadas',
    'saveData': 'Guardar Datos',
    
    // NewQRCode Screen - Modal customization
    'styleQRCode': 'Estilo del Código QR',
    'colorPalette': 'Paleta de Colores',
    'solidColors': 'Colores Sólidos',
    'gradients': 'Gradientes',
    'black': 'Negro',
    'blue': 'Azul',
    'green': 'Verde',
    'red': 'Rojo',
    'purple': 'Morado',
    'orange': 'Naranja',
    'instagram': 'Instagram',
    'ocean': 'Océano',
    'mint': 'Menta',
    'vibrant': 'Vibrante',
    'pink': 'Rosa',
    'smooth': 'Suave',
    'peach': 'Durazno',
    'dark': 'Oscuro',
    'golden': 'Dorado',
    'background': 'Fondo',
    'centralLogo': 'Logo Central',
    'addLogo': 'Agregar logo',
    'chooseLogoType': 'Elige el tipo de logo:',
    'icons': 'Íconos',
    'image': 'Imagen',
    'tapToSelect': 'Toca para seleccionar',
    'remove': 'Remover',
    'iconSize': 'Tamaño del ícono',
    'iconSizeDescription': 'Controla el tamaño del ícono en el centro del código QR',
    'small': 'Pequeño',
    'medium': 'Mediano',
    'large': 'Grande',
    'quality': 'Calidad',
    
    // NewQRCode Screen - WiFi form
    'wifiSettings': 'Configuración Wi-Fi',
    'networkSSID': 'Nombre de red (SSID)',
    'hiddenNetwork': 'Red oculta',
    
    // NewQRCode Screen - Contact form
    'contactInfo': 'Información del Contacto',
    'firstName': 'Nombre',
    'lastName': 'Apellido',
    'website': 'Sitio web',
    'requiredField': ' *',
    
    // NewQRCode Screen - Error messages
    'enterTitle': 'Por favor, ingresa un título para el Código QR',
    'enterContent': 'Por favor, ingresa el contenido del Código QR',
    'fillWifiFields': 'Por favor, completa el nombre de red y contraseña Wi-Fi',
    'fillContactName': 'Por favor, completa al menos el nombre del contacto',
    'imagePermissionTitle': 'Permiso requerido',
    'imagePermissionMessage': 'Necesitamos permiso para acceder a tus fotos.',
    'imageSelectionError': 'No se pudo seleccionar la imagen.',
    'shareDialogTitle': 'Compartir Código QR',
    'shareError': 'No se pudo compartir el Código QR',
    'shareNotAvailable': 'Compartir no está disponible en este dispositivo.',
    'qrSaveError': 'No se pudo guardar el Código QR. Inténtalo de nuevo.',
    'back': 'Atrás',
    'translationDisclaimer': 'La aplicación puede no estar 100% traducida aún',
    
    // Login Screen
    'loginToContinue': 'Inicia sesión para continuar',
    'loggingIn': 'Iniciando sesión...',
    'continueWithGoogle': 'Continuar con Google',
    'or': 'o',
    'termsDisclaimer': 'Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad',
    'newToApp': '¿Nuevo en QR Fácil?',
    'learnMore': 'Aprende más',
    'welcome': 'Bienvenido',
    'loginCancelled': 'Inicio de sesión cancelado por el usuario',
    'cancelled': 'Cancelado',
    'pleaseWait': 'Por favor espera',
    'loginInProgress': 'Inicio de sesión en progreso...',
    'playServicesNotAvailable': 'Google Play Services no disponible',
    'loginError': 'Algo salió mal durante el inicio de sesión',
    'databaseNotReady': 'La base de datos no está lista. Inténtalo de nuevo en unos segundos.',
    'logoutSuccess': '¡Sesión cerrada exitosamente!',
    'logoutError': 'Error al cerrar sesión',
    
    // Danger Zone
    'dangerZone': 'Zona Peligrosa',
    'deleteAccount': 'Eliminar Cuenta',
    'deleteAccountDescription': 'Eliminar permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.',
    'confirmDeleteAccount': 'Confirmar Eliminación de Cuenta',
    'deleteAccountWarning': 'Esta acción eliminará permanentemente tu cuenta y todos los datos asociados, incluyendo:',
    'deleteAccountItems': '• Todos los códigos QR guardados\n• Todo el historial de escaneos\n• Todas las configuraciones personalizadas\n• Datos del perfil',
    'deleteAccountConfirmation': 'Para confirmar, escribe "ELIMINAR" a continuación:',
    'typeDeleteToConfirm': 'Escribe ELIMINAR para confirmar',
    'deleteAccountSuccess': 'Cuenta eliminada exitosamente',
    'deleteAccountError': 'Error al eliminar cuenta. Inténtalo de nuevo.',
    'confirmationRequired': 'Debes escribir "ELIMINAR" para confirmar',
    'accountDeletionInProgress': 'Eliminando cuenta...',

    // Premium/Upgrade
    'upgradeToPro': 'Actualizar a PRO',
    'unlockFullAccess': 'Desbloquea acceso completo a la app',
    'oneTimePayment': 'Pago único',
    'noSubscription': 'Sin tarifas mensuales o suscripciones',
    'whatYouGet': 'Lo que obtienes:',
    'upgradeNow': 'Actualizar Ahora',
    'maybeLater': 'Tal vez Después',
    'unlimitedQRCodes': 'Códigos QR Ilimitados',
    'unlimitedQRCodesDesc': 'Crea tantos códigos QR como quieras',
    'allStyles': 'Todos los Estilos',
    'allStylesDesc': 'Instagram, Dots, Rounded y más',
    'fullCustomization': 'Personalización Completa',
    'fullCustomizationDesc': 'Colores, gradientes y logos personalizados',
    'accessMyQRCodes': 'Acceso a Mis Códigos',
    'accessMyQRCodesDesc': 'Administra todos tus códigos QR guardados',
    'featureLocked': 'Función Bloqueada',
    'upgradeToUnlock': 'Actualiza para desbloquear',
    'freeQRUsed': 'Código QR gratuito ya usado',
    'oneFreeQROnly': 'Solo puedes crear 1 código QR gratuito',
    
    // QRScanner Screen
    'scanQRCode': 'Escanear Código QR',
    'pointCamera': 'Apunta la cámara al Código QR',
    'flashlight': 'Linterna',
    'gallery': 'Galería',
    'selectFromGallery': 'Seleccionar de Galería',
    'cameraPermission': 'Permiso de Cámara',
    'cameraPermissionMessage': 'Necesitamos acceso a la cámara para escanear Códigos QR.',
    'grantPermission': 'Conceder Permiso',
    'permissionDenied': 'Permiso Denegado',
    'noQRCodeFound': 'No se encontró Código QR en la imagen',
    'invalidQRCode': 'Código QR inválido',
    'scanResult': 'detectado',
    
    // Error Correction Levels
    'errorCorrectionLow': 'Bajo (7%)',
    'errorCorrectionMedium': 'Medio (15%)',
    'errorCorrectionQuartile': 'Alto (25%)',
    'errorCorrectionHigh': 'Muy Alto (30%)',
    'fastLessResistant': 'Rápido, menos resistente',
    'balanced': 'Equilibrado (Recomendado)',
    'goodForPrint': 'Bueno para impresión',
    'maximumResistance': 'Máxima resistencia',
    
    // QR Styles
    'traditional': 'Tradicional',
    'rounded': 'Redondeado',
    'dots': 'Puntos',
    'instagram': 'Instagram',
    
    // Common
    'user': 'Usuario',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'ok': 'OK',
    'yes': 'Sí',
    'no': 'No',
    'done': 'Hecho',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'retry': 'Reintentar',
  },
};

// Detectar idioma do dispositivo
const getDeviceLanguage = (): Language => {
  const deviceLocale = Localization.locale;
  
  // Verificar se deviceLocale existe antes de usar startsWith
  if (deviceLocale && typeof deviceLocale === 'string') {
    if (deviceLocale.startsWith('pt')) return 'pt-BR';
    if (deviceLocale.startsWith('es')) return 'es-ES';
  }
  
  return 'en-US'; // Default para inglês
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt-BR');

  // Carregar idioma salvo ou detectar do dispositivo
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage && ['pt-BR', 'en-US', 'es-ES'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        } else {
          // Se não tem idioma salvo, detecta do dispositivo
          const deviceLanguage = getDeviceLanguage();
          setLanguageState(deviceLanguage);
        }
      } catch (error) {
        console.error('Erro ao carregar idioma:', error);
        // Fallback para detectar do dispositivo
        const deviceLanguage = getDeviceLanguage();
        setLanguageState(deviceLanguage);
      }
    };

    loadLanguage();
  }, []);

  // Função para alterar idioma
  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('userLanguage', newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
      // Mesmo com erro, aplica a mudança
      setLanguageState(newLanguage);
    }
  };

  // Função de tradução
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};