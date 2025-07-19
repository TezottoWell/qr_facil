import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { usePremium } from '../contexts/PremiumContext';
import { paymentService } from '../services/paymentService';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void; // Opcional agora, pois vamos usar o sistema de pagamentos
  userId?: string; // ID do usuário para pagamentos
}

const { width } = Dimensions.get('window');

export default function UpgradeModal({ visible, onClose, onUpgrade, userId }: UpgradeModalProps) {
  const { t } = useLanguage();
  const premium = usePremium();
  const [isLoading, setIsLoading] = useState(false);
  const [productPrice, setProductPrice] = useState<string>('$3.99');
  const [isPaymentAvailable, setIsPaymentAvailable] = useState(false);

  // Debug log quando modal abre
  useEffect(() => {
    if (visible) {
      console.log('=== DEBUG UPGRADE MODAL ===');
      console.log('Modal aberto com:', { 
        userId: userId || 'não definido',
        userEmail: premium.userEmail || 'não definido',
        isPremium: premium.isPremium,
        isPaymentAvailable,
        isLoading: premium.isLoading,
        paymentServiceAvailable: paymentService.isAvailable()
      });
      console.log('============================');
    }
  }, [visible, userId, premium.userEmail, premium.isPremium, isPaymentAvailable]);

  // Carregar preço do produto quando modal abrir
  useEffect(() => {
    if (visible) {
      loadProductInfo();
    }
  }, [visible]);

  const loadProductInfo = async () => {
    try {
      console.log('Carregando informações do produto...');
      
      // Verificar se já está inicializado antes de tentar inicializar
      let isInitialized = paymentService.isAvailable();
      console.log('Serviço já inicializado?', isInitialized);
      
      if (!isInitialized) {
        console.log('Inicializando serviço de pagamentos...');
        isInitialized = await paymentService.initialize();
        console.log('Serviço de pagamentos inicializado:', isInitialized);
      }

      if (isInitialized) {
        // Obter produto premium
        const product = paymentService.getPremiumProduct();
        console.log('Produto encontrado:', product);
        
        if (product) {
          setProductPrice(product.price);
          setIsPaymentAvailable(true);
          console.log('Pagamentos disponíveis! Preço:', product.price);
        } else {
          console.log('Produto não encontrado, usando preço padrão');
          setIsPaymentAvailable(false);
          setProductPrice('$3.99'); // Preço padrão como fallback
        }
      } else {
        console.log('Falha na inicialização do serviço de pagamentos');
        setIsPaymentAvailable(false);
        setProductPrice('$3.99'); // Preço padrão como fallback
      }
    } catch (error) {
      console.error('Erro ao carregar info do produto:', error);
      setIsPaymentAvailable(false);
      setProductPrice('$3.99'); // Preço padrão como fallback
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando processo de upgrade...', { isPaymentAvailable, userId });

      if (isPaymentAvailable && userId) {
        // Usar sistema de pagamentos real (Apple/Google Pay)
        console.log('Executando compra via Apple/Google Pay...');
        const result = await premium.purchasePremium(userId);
        
        if (result.success) {
          console.log('Compra realizada com sucesso!');
          onClose();
          // Premium será ativado automaticamente pelo contexto
        } else {
          console.error('Erro na compra:', result.error);
          // Mostrar alert de erro para o usuário
          alert(`Erro na compra: ${result.error || 'Erro desconhecido'}`);
        }
      } else if (userId) {
        // Se pagamentos não estão disponíveis mas temos userId, tentar mesmo assim
        console.log('Pagamentos não disponíveis, tentando compra mesmo assim...');
        
        // Tentar compra diretamente (o serviço já está conectado)
        const result = await premium.purchasePremium(userId);
        if (result.success) {
          console.log('Compra realizada com sucesso!');
          onClose();
        } else {
          console.error('Erro na compra:', result.error);
          alert(`Erro na compra: ${result.error || 'Erro desconhecido'}`);
        }
      } else {
        // Fallback para upgrade manual (desenvolvimento)
        console.log('Modo desenvolvimento - upgrade manual');
        if (onUpgrade) {
          onUpgrade();
        }
        onClose();
      }
    } catch (error) {
      console.error('Erro ao processar upgrade:', error);
      alert(`Erro ao processar upgrade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const premiumFeatures = [
    {
      icon: 'qr-code-outline',
      title: t('unlimitedQRCodes'),
      description: t('unlimitedQRCodesDesc'),
    },
    {
      icon: 'color-palette-outline',
      title: t('allStyles'),
      description: t('allStylesDesc'),
    },
    {
      icon: 'brush-outline',
      title: t('fullCustomization'),
      description: t('fullCustomizationDesc'),
    },
    {
      icon: 'folder-outline',
      title: t('accessMyQRCodes'),
      description: t('accessMyQRCodesDesc'),
    },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.cardContainer}>
          {/* Header com Close */}
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <LinearGradient 
            colors={['#FF6B6B', '#FF8E53', '#FFD93D']} 
            style={styles.heroSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.diamondContainer}>
              <Ionicons name="diamond" size={36} color="#ffffff" />
            </View>
            <Text style={styles.heroTitle}>QR Fácil PRO</Text>
            <Text style={styles.heroSubtitle}>Desbloqueie todo o potencial</Text>
            
            {/* Price Badge */}
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{productPrice}</Text>
              <Text style={styles.priceLabel}>pagamento único</Text>
            </View>
          </LinearGradient>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>O que você ganha:</Text>
            
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={22} color="#FF6B6B" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
              </View>
            ))}
            
            {/* Extra Benefits */}
            <View style={styles.extraBenefits}>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={18} color="#4ade80" />
                <Text style={styles.benefitText}>Sem assinatura mensal</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="cloud-upload" size={18} color="#4ade80" />
                <Text style={styles.benefitText}>Backup na nuvem</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="refresh" size={18} color="#4ade80" />
                <Text style={styles.benefitText}>Atualizações gratuitas</Text>
              </View>
            </View>

            {!isPaymentAvailable && (
              <View style={styles.demoNotice}>
                <Ionicons name="information-circle" size={16} color="#FFB800" />
                <Text style={styles.demoText}>
                  {userId ? 'Configurando pagamentos...' : 'Modo demonstração - pagamentos em configuração'}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.upgradeButton, isLoading && styles.upgradeButtonDisabled]} 
              onPress={() => {
                console.log('🛒 BOTÃO CLICADO! Executando compra...');
                handleUpgrade();
              }}
              disabled={isLoading}
              activeOpacity={isLoading ? 1 : 0.8}
            >
              <LinearGradient
                colors={isLoading ? ['#cccccc', '#999999'] : ['#FF6B6B', '#FF8E53']}
                style={styles.upgradeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.upgradeButtonText}>
                      Processando...
                    </Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="diamond" size={20} color="#ffffff" />
                    <Text style={styles.upgradeButtonText}>
                      {isPaymentAvailable ? `Comprar - ${productPrice}` : `Upgrade - ${productPrice}`}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterButtonText}>Talvez Depois</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    width: width * 0.92,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  cardHeader: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  diamondContainer: {
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  featuresSection: {
    padding: 16,
    paddingTop: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 2,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  extraBenefits: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    fontWeight: '500',
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  actionSection: {
    padding: 16,
    paddingTop: 8,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  upgradeButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  laterButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});