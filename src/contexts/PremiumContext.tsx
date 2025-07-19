import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserPremiumInfo, updateUserPremiumStatus, markFreeQRUsed } from '../services/database';
import { neonService } from '../services/neonService';
import { paymentService, PurchaseResult } from '../services/paymentService';
import { syncService } from '../services/syncService';
import UpgradeModal from '../components/UpgradeModal';

interface PremiumContextType {
  isPremium: boolean;
  freeQRUsed: boolean;
  isLoading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  userEmail?: string;
  userId?: string | null;
  setPremiumStatus: (isPremium: boolean) => Promise<void>;
  markFreeQRAsUsed: () => Promise<void>;
  loadPremiumStatus: (userEmail: string, userId?: string) => Promise<void>;
  purchasePremium: (userId: string) => Promise<PurchaseResult>;
  restorePurchases: (userId: string) => Promise<boolean>;
  syncPremiumStatus: (userId: string) => Promise<void>;
  showUpgradeModal: () => void;
  hideUpgradeModal: () => void;
  upgradeModalVisible: boolean;
  lastSyncAt?: Date;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: ReactNode;
  userEmail?: string;
  userId?: string | null;
}

export const PremiumProvider: React.FC<PremiumProviderProps> = ({ children, userEmail, userId }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [freeQRUsed, setFreeQRUsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | undefined>();

  // Carregar status premium (NUVEM como fonte de verdade)
  const loadPremiumStatus = async (email: string, cloudUserId?: string) => {
    try {
      setIsLoading(true);
      
      // 1. Se online e temos userId, buscar da NUVEM primeiro (fonte de verdade)
      if (isOnline && cloudUserId) {
        try {
          console.log('Buscando status premium da nuvem (fonte de verdade)...');
          const user = await neonService.getUserByEmail(email);
          
          if (user) {
            const cloudPremiumStatus = user.premium_status;
            const cloudFreeQRUsed = user.free_qr_used;
            
            console.log('Status da nuvem:', { cloudPremiumStatus, cloudFreeQRUsed });
            
            // Atualizar estado com dados da nuvem
            setIsPremium(cloudPremiumStatus);
            setFreeQRUsed(cloudFreeQRUsed);
            
            // Sincronizar dados locais com a nuvem
            await updateUserPremiumStatus(email, cloudPremiumStatus);
            if (cloudFreeQRUsed) {
              await markFreeQRUsed(email);
            }
            
            // Atualizar cache
            const premiumInfo = { 
              isPremium: cloudPremiumStatus, 
              freeQRUsed: cloudFreeQRUsed 
            };
            await AsyncStorage.setItem('premiumStatus', JSON.stringify(premiumInfo));
            
            console.log('Status sincronizado da nuvem com sucesso');
            return;
          }
        } catch (cloudError) {
          console.log('Erro ao buscar da nuvem, usando dados locais:', cloudError);
        }
      }
      
      // 2. Fallback: Carregar do banco local se nuvem falhar
      console.log('Carregando status premium do banco local (fallback)...');
      const localPremiumInfo = await getUserPremiumInfo(email);
      setIsPremium(localPremiumInfo.isPremium);
      setFreeQRUsed(localPremiumInfo.freeQRUsed);

      // Salvar no AsyncStorage para cache
      const premiumInfo = { isPremium: localPremiumInfo.isPremium, freeQRUsed: localPremiumInfo.freeQRUsed };
      await AsyncStorage.setItem('premiumStatus', JSON.stringify(premiumInfo));
      
    } catch (error) {
      console.error('Error loading premium status:', error);
      
      // Tentar carregar do cache em caso de erro
      try {
        const cached = await AsyncStorage.getItem('premiumStatus');
        if (cached) {
          const premiumInfo = JSON.parse(cached);
          setIsPremium(premiumInfo.isPremium);
          setFreeQRUsed(premiumInfo.freeQRUsed);
        }
      } catch (cacheError) {
        console.error('Error loading cached premium status:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status premium
  const setPremiumStatus = async (newPremiumStatus: boolean) => {
    if (!userEmail) return;

    try {
      const success = await updateUserPremiumStatus(userEmail, newPremiumStatus);
      if (success) {
        setIsPremium(newPremiumStatus);
        
        // Atualizar cache
        const premiumInfo = { isPremium: newPremiumStatus, freeQRUsed };
        await AsyncStorage.setItem('premiumStatus', JSON.stringify(premiumInfo));
      }
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  // Marcar QR gratuito como usado
  const markFreeQRAsUsed = async () => {
    if (!userEmail) return;

    try {
      const success = await markFreeQRUsed(userEmail);
      if (success) {
        setFreeQRUsed(true);
        
        // Atualizar cache
        const premiumInfo = { isPremium, freeQRUsed: true };
        await AsyncStorage.setItem('premiumStatus', JSON.stringify(premiumInfo));

        // Sincronizar com nuvem se possível
        if (userId && isOnline) {
          try {
            // Aqui você pode adicionar lógica para sincronizar com Neon
            await neonService.updateUserSyncTime(userId);
          } catch (cloudError) {
            console.log('Erro ao sincronizar com nuvem:', cloudError);
          }
        }
      }
    } catch (error) {
      console.error('Error marking free QR as used:', error);
    }
  };

  // Comprar premium via Apple/Google
  const purchasePremium = async (cloudUserId: string): Promise<PurchaseResult> => {
    try {
      setIsLoading(true);
      
      // Inicializar serviço de pagamentos se necessário
      if (!paymentService.isAvailable()) {
        await paymentService.initialize();
      }

      // Realizar compra
      const result = await paymentService.purchasePremium(cloudUserId);
      
      if (result.success) {
        // Atualizar status local
        await setPremiumStatus(true);
        
        // Sincronizar com nuvem
        if (isOnline) {
          await syncPremiumStatus(cloudUserId);
        }
        
        // Fechar modal de upgrade
        hideUpgradeModal();
      }
      
      return result;
    } catch (error) {
      console.error('Error purchasing premium:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na compra'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Restaurar compras
  const restorePurchases = async (cloudUserId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Inicializar serviço de pagamentos se necessário
      if (!paymentService.isAvailable()) {
        await paymentService.initialize();
      }

      const restored = await paymentService.restorePurchases(cloudUserId);
      
      if (restored) {
        // Atualizar status local
        await setPremiumStatus(true);
        
        // Sincronizar com nuvem
        if (isOnline) {
          await syncPremiumStatus(cloudUserId);
        }
      }
      
      return restored;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar status premium com nuvem
  const syncPremiumStatus = async (cloudUserId: string) => {
    try {
      if (!isOnline) return;
      
      setIsSyncing(true);
      
      // Buscar status atual da nuvem
      const user = await neonService.getUserByEmail(userEmail || '');
      
      if (user) {
        const cloudPremiumStatus = user.premium_status;
        const cloudFreeQRUsed = user.free_qr_used;
        
        // Atualizar dados locais se houver diferença
        if (cloudPremiumStatus !== isPremium || cloudFreeQRUsed !== freeQRUsed) {
          // Atualizar banco local
          if (userEmail) {
            await updateUserPremiumStatus(userEmail, cloudPremiumStatus);
            if (cloudFreeQRUsed && !freeQRUsed) {
              await markFreeQRUsed(userEmail);
            }
          }
          
          // Atualizar estado
          setIsPremium(cloudPremiumStatus);
          setFreeQRUsed(cloudFreeQRUsed);
          
          // Atualizar cache
          const premiumInfo = { 
            isPremium: cloudPremiumStatus, 
            freeQRUsed: cloudFreeQRUsed 
          };
          await AsyncStorage.setItem('premiumStatus', JSON.stringify(premiumInfo));
        }
        
        // Atualizar timestamp de sincronização
        await neonService.updateUserSyncTime(cloudUserId);
        setLastSyncAt(new Date());
      }
    } catch (error) {
      console.error('Error syncing premium status:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  // Controlar modal de upgrade
  const showUpgradeModal = () => setUpgradeModalVisible(true);
  const hideUpgradeModal = () => setUpgradeModalVisible(false);


  // Configurar listeners de sincronização
  useEffect(() => {
    const removeSyncListener = syncService.addSyncListener((status) => {
      setIsOnline(status.isOnline);
      setIsSyncing(status.isSyncing);
      setLastSyncAt(status.lastSyncAt);
    });

    // Inicializar serviço de pagamentos
    paymentService.initialize().catch(console.error);

    return () => {
      removeSyncListener();
    };
  }, []);

  // Carregar status quando userEmail mudar
  useEffect(() => {
    if (userEmail) {
      loadPremiumStatus(userEmail, userId);
    }
  }, [userEmail, userId]);

  const value = {
    isPremium,
    freeQRUsed,
    isLoading,
    isOnline,
    isSyncing,
    userEmail,
    userId,
    setPremiumStatus,
    markFreeQRAsUsed,
    loadPremiumStatus,
    purchasePremium,
    restorePurchases,
    syncPremiumStatus,
    showUpgradeModal,
    hideUpgradeModal,
    upgradeModalVisible,
    lastSyncAt
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
      
      {/* Modal de Upgrade Global */}
      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={hideUpgradeModal}
        userId={userId || undefined}
      />
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

// Hook personalizado com lógicas de verificação
export const usePremiumFeatures = () => {
  const premium = usePremium();

  const canCreateQR = () => {
    return premium.isPremium || !premium.freeQRUsed;
  };

  const canCustomizeQR = () => {
    return premium.isPremium;
  };

  const canAccessMyQRs = () => {
    return true; // Sempre permitir acesso, apenas mostrar aviso
  };

  const getQRLimitMessage = () => {
    if (premium.isPremium) return null;
    if (premium.freeQRUsed) return 'Você já usou seu QR Code gratuito. Faça upgrade para criar mais!';
    return 'Você pode criar 1 QR Code gratuito. Faça upgrade para criar ilimitados!';
  };

  return {
    ...premium,
    canCreateQR,
    canCustomizeQR,
    canAccessMyQRs,
    getQRLimitMessage,
  };
};