import { neonService, QRCode, QRHistory } from './neonService';
import { DatabaseService } from './database';
import { HistoryDatabaseService } from './historyDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: Date;
  pendingUploads: number;
  pendingDownloads: number;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  uploadedQRCodes: number;
  downloadedQRCodes: number;
  uploadedHistory: number;
  downloadedHistory: number;
  error?: string;
}

class SyncService {
  private isSyncing = false;
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private networkListener: any;
  private isOnline = true;
  
  private readonly SYNC_KEYS = {
    LAST_SYNC: '@qr_facil_last_sync',
    PENDING_UPLOADS: '@qr_facil_pending_uploads',
    SYNC_SETTINGS: '@qr_facil_sync_settings'
  };

  constructor() {
    this.initializeNetworkListener();
  }

  // Inicializar listener de conectividade
  private initializeNetworkListener(): void {
    this.networkListener = NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;
      
      // Se voltou online, tentar sincronizar automaticamente
      if (wasOffline && this.isOnline) {
        this.notifyListeners();
        this.autoSync();
      } else {
        this.notifyListeners();
      }
    });
  }

  // Adicionar listener de status
  addSyncListener(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    
    // Retornar função para remover o listener
    return () => {
      const index = this.syncListeners.indexOf(callback);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  // Notificar listeners sobre mudanças de status
  private notifyListeners(): void {
    const status = this.getCurrentStatus();
    this.syncListeners.forEach(callback => callback(status));
  }

  // Obter status atual
  getCurrentStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncAt: this.getLastSyncDate(),
      pendingUploads: 0, // Será calculado dinamicamente
      pendingDownloads: 0,
      error: undefined
    };
  }

  // Sincronização automática quando volta online
  private async autoSync(): Promise<void> {
    if (this.isOnline && !this.isSyncing) {
      console.log('Iniciando sincronização automática...');
      await this.syncAll();
    }
  }

  // Sincronização completa
  async syncAll(userId?: string): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sincronização já em andamento');
    }

    if (!this.isOnline) {
      throw new Error('Sem conexão com a internet');
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const result: SyncResult = {
        success: false,
        uploadedQRCodes: 0,
        downloadedQRCodes: 0,
        uploadedHistory: 0,
        downloadedHistory: 0
      };

      // Verificar conectividade com o Neon
      const isConnected = await neonService.testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao servidor');
      }

      // 1. Upload de QR codes locais não sincronizados
      const uploadQRResult = await this.uploadLocalQRCodes(userId);
      result.uploadedQRCodes = uploadQRResult;

      // 2. Upload de histórico local não sincronizado
      const uploadHistoryResult = await this.uploadLocalHistory(userId);
      result.uploadedHistory = uploadHistoryResult;

      // 3. Download de QR codes da nuvem
      const downloadQRResult = await this.downloadCloudQRCodes(userId);
      result.downloadedQRCodes = downloadQRResult;

      // 4. Download de histórico da nuvem
      const downloadHistoryResult = await this.downloadCloudHistory(userId);
      result.downloadedHistory = downloadHistoryResult;

      // Salvar timestamp da sincronização
      await this.setLastSyncDate(new Date());

      result.success = true;
      console.log('Sincronização completa:', result);

      return result;

    } catch (error) {
      console.error('Erro na sincronização:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      return {
        success: false,
        uploadedQRCodes: 0,
        downloadedQRCodes: 0,
        uploadedHistory: 0,
        downloadedHistory: 0,
        error: errorMessage
      };
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Upload de QR codes locais para a nuvem
  private async uploadLocalQRCodes(userId?: string): Promise<number> {
    try {
      const localQRCodes = await DatabaseService.getAllQRCodes();
      let uploadedCount = 0;

      for (const localQR of localQRCodes) {
        try {
          // Verificar se já existe na nuvem
          const cloudQRCodes = await neonService.getQRCodesByUser(userId || '');
          const existsInCloud = cloudQRCodes.some(cloudQR => 
            cloudQR.title === localQR.title && 
            cloudQR.content === localQR.content
          );

          if (!existsInCloud) {
            // Converter dados locais para formato da nuvem
            const cloudQRData = this.convertLocalToCloudQR(localQR, userId || '');
            
            await neonService.createQRCode(cloudQRData);
            uploadedCount++;
            
            console.log(`QR code "${localQR.title}" enviado para a nuvem`);
          }
        } catch (error) {
          console.error(`Erro ao enviar QR code "${localQR.title}":`, error);
        }
      }

      return uploadedCount;
    } catch (error) {
      console.error('Erro no upload de QR codes:', error);
      return 0;
    }
  }

  // Upload de histórico local para a nuvem
  private async uploadLocalHistory(userId?: string): Promise<number> {
    try {
      const localHistory = await HistoryDatabaseService.getQRCodeHistory();
      let uploadedCount = 0;

      for (const localItem of localHistory) {
        try {
          // Converter dados locais para formato da nuvem
          const cloudHistoryData = this.convertLocalToCloudHistory(localItem, userId || '');
          
          await neonService.createQRHistory(cloudHistoryData);
          uploadedCount++;
          
          console.log(`Item de histórico enviado para a nuvem`);
        } catch (error) {
          console.error('Erro ao enviar item de histórico:', error);
        }
      }

      return uploadedCount;
    } catch (error) {
      console.error('Erro no upload de histórico:', error);
      return 0;
    }
  }

  // Download de QR codes da nuvem
  private async downloadCloudQRCodes(userId?: string): Promise<number> {
    try {
      const cloudQRCodes = await neonService.getQRCodesByUser(userId || '');
      const localQRCodes = await DatabaseService.getAllQRCodes();
      let downloadedCount = 0;

      for (const cloudQR of cloudQRCodes) {
        try {
          // Verificar se já existe localmente
          const existsLocally = localQRCodes.some(localQR => 
            localQR.title === cloudQR.title && 
            localQR.content === cloudQR.content
          );

          if (!existsLocally) {
            // Converter dados da nuvem para formato local
            const localQRData = this.convertCloudToLocalQR(cloudQR);
            
            await DatabaseService.saveQRCode(localQRData);
            downloadedCount++;
            
            console.log(`QR code "${cloudQR.title}" baixado da nuvem`);
          }
        } catch (error) {
          console.error(`Erro ao baixar QR code "${cloudQR.title}":`, error);
        }
      }

      return downloadedCount;
    } catch (error) {
      console.error('Erro no download de QR codes:', error);
      return 0;
    }
  }

  // Download de histórico da nuvem
  private async downloadCloudHistory(userId?: string): Promise<number> {
    try {
      const cloudHistory = await neonService.getQRHistoryByUser(userId || '');
      let downloadedCount = 0;

      for (const cloudItem of cloudHistory) {
        try {
          // Converter dados da nuvem para formato local
          const localHistoryData = this.convertCloudToLocalHistory(cloudItem);
          
          await HistoryDatabaseService.addToHistory(localHistoryData);
          downloadedCount++;
          
          console.log('Item de histórico baixado da nuvem');
        } catch (error) {
          console.error('Erro ao baixar item de histórico:', error);
        }
      }

      return downloadedCount;
    } catch (error) {
      console.error('Erro no download de histórico:', error);
      return 0;
    }
  }

  // Converter QR code local para formato da nuvem
  private convertLocalToCloudQR(localQR: any, userId: string): Omit<QRCode, 'id' | 'created_at' | 'updated_at'> {
    return {
      user_id: userId,
      title: localQR.title || 'QR Code',
      content: localQR.content || '',
      qr_type: localQR.qr_type || 'text',
      qr_style: localQR.qr_style || 'traditional',
      background_color: localQR.background_color || '#FFFFFF',
      foreground_color: localQR.foreground_color || '#000000',
      gradient_colors: Array.isArray(localQR.gradient_colors) ? localQR.gradient_colors : [],
      logo_enabled: localQR.logo_enabled || false,
      logo_size: localQR.logo_size || 50,
      logo_icon: localQR.logo_icon || '',
      custom_logo_uri: localQR.custom_logo_uri || null,
      logo_type: localQR.logo_type || 'icon',
      error_correction_level: localQR.error_correction_level || 'M',
      settings: localQR.settings || {},
      synced: true
    };
  }

  // Converter QR code da nuvem para formato local
  private convertCloudToLocalQR(cloudQR: QRCode): any {
    return {
      title: cloudQR.title,
      content: cloudQR.content,
      qr_type: cloudQR.qr_type,
      qr_style: cloudQR.qr_style,
      background_color: cloudQR.background_color,
      foreground_color: cloudQR.foreground_color,
      gradient_colors: cloudQR.gradient_colors,
      logo_enabled: cloudQR.logo_enabled,
      logo_size: cloudQR.logo_size,
      logo_icon: cloudQR.logo_icon,
      custom_logo_uri: cloudQR.custom_logo_uri,
      logo_type: cloudQR.logo_type,
      error_correction_level: cloudQR.error_correction_level,
      settings: cloudQR.settings
    };
  }

  // Converter histórico local para formato da nuvem
  private convertLocalToCloudHistory(localItem: any, userId: string): Omit<QRHistory, 'id' | 'scanned_at'> {
    return {
      user_id: userId,
      type: localItem.type || 'unknown',
      raw_data: localItem.rawData || '',
      parsed_data: typeof localItem.parsedData === 'string' 
        ? JSON.parse(localItem.parsedData) 
        : localItem.parsedData || {},
      description: localItem.description || '',
      action_text: localItem.actionText || '',
      synced: true
    };
  }

  // Converter histórico da nuvem para formato local
  private convertCloudToLocalHistory(cloudItem: QRHistory): any {
    return {
      type: cloudItem.type,
      rawData: cloudItem.raw_data,
      parsedData: JSON.stringify(cloudItem.parsed_data),
      description: cloudItem.description,
      actionText: cloudItem.action_text,
      timestamp: cloudItem.scanned_at.getTime()
    };
  }

  // Gerenciar timestamps de sincronização
  private async setLastSyncDate(date: Date): Promise<void> {
    await AsyncStorage.setItem(this.SYNC_KEYS.LAST_SYNC, date.toISOString());
  }

  private getLastSyncDate(): Date | undefined {
    try {
      const stored = AsyncStorage.getItem(this.SYNC_KEYS.LAST_SYNC);
      return stored ? new Date(stored) : undefined;
    } catch {
      return undefined;
    }
  }

  // Verificar se precisa sincronizar
  async shouldSync(): Promise<boolean> {
    if (!this.isOnline) return false;
    
    const lastSync = this.getLastSyncDate();
    if (!lastSync) return true;
    
    // Sincronizar a cada 30 minutos
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return lastSync < thirtyMinutesAgo;
  }

  // Limpar dados de sincronização
  async clearSyncData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.SYNC_KEYS.LAST_SYNC,
      this.SYNC_KEYS.PENDING_UPLOADS,
      this.SYNC_KEYS.SYNC_SETTINGS
    ]);
  }

  // Destruir listeners
  destroy(): void {
    if (this.networkListener) {
      this.networkListener();
    }
    this.syncListeners = [];
  }
}

export const syncService = new SyncService();