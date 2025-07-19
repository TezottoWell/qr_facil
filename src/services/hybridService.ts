// Serviço híbrido que gerencia dados locais + nuvem
import { insertUser, insertQRCode, getUserQRCodes, getUserPremiumInfo } from './database';
import { historyDB } from './historyDatabase';
import { neonService } from './neonService';
import { syncService } from './syncService';
import { migrationService } from './migrationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HybridQRCodeData {
  title: string;
  content: string;
  qr_type: string;
  qr_style: string;
  background_color: string;
  foreground_color: string;
  gradient_colors: string[];
  logo_enabled: boolean;
  logo_size: number;
  logo_icon: string;
  custom_logo_uri?: string;
  logo_type: string;
  error_correction_level: string;
  settings?: any;
}

export interface HybridHistoryData {
  type: string;
  rawData: string;
  parsedData: string | object;
  description: string;
  actionText: string;
  timestamp?: number;
}

class HybridService {
  private isOnline = true;
  private currentUserId: string | null = null;
  private currentUserEmail: string | null = null;

  // Configurar usuário atual
  setCurrentUser(userId: string, userEmail: string) {
    this.currentUserId = userId;
    this.currentUserEmail = userEmail;
  }

  // Verificar se está online
  async checkOnlineStatus(): Promise<boolean> {
    try {
      this.isOnline = await neonService.testConnection();
    } catch {
      this.isOnline = false;
    }
    return this.isOnline;
  }

  // Criar usuário (local + nuvem)
  async createUser(userData: {
    email: string;
    name: string;
    photo?: string;
    googleId?: string;
  }): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // 1. Salvar localmente primeiro (resposta rápida)
      await insertUser({
        email: userData.email,
        name: userData.name,
        photo: userData.photo || ''
      });

      // 2. Tentar salvar na nuvem
      if (await this.checkOnlineStatus()) {
        try {
          // Verificar se usuário já existe na nuvem
          let cloudUser = await neonService.getUserByEmail(userData.email);
          
          if (!cloudUser) {
            // Criar novo usuário na nuvem
            cloudUser = await neonService.createUser({
              email: userData.email,
              name: userData.name,
              photo_url: userData.photo,
              premium_status: false,
              free_qr_used: false,
              google_id: userData.googleId || `local_${Date.now()}`
            });
          }

          this.setCurrentUser(cloudUser.id, userData.email);

          // Verificar se precisa migrar dados
          const hasMigrated = await migrationService.hasMigrated();
          if (!hasMigrated) {
            console.log('Usuário existente - iniciando migração em background');
            // Migração em background sem bloquear o usuário
            migrationService.migrateToCloud({
              userEmail: userData.email,
              userId: cloudUser.id,
              preserveLocalData: true,
              onProgress: (progress) => {
                console.log('Progresso da migração:', progress.step);
              }
            }).catch(error => {
              console.log('Erro na migração em background:', error);
            });
          }

          return { success: true, userId: cloudUser.id };
        } catch (cloudError) {
          console.log('Erro ao criar usuário na nuvem:', cloudError);
          return { success: true, error: 'Usuário criado localmente, sincronização pendente' };
        }
      }

      return { success: true, error: 'Usuário criado offline' };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Salvar QR code (local + nuvem)
  async saveQRCode(
    userEmail: string,
    qrData: HybridQRCodeData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Salvar localmente primeiro (resposta rápida)
      await insertQRCode(userEmail, {
        title: qrData.title,
        content: qrData.content,
        qr_type: qrData.qr_type,
        qr_style: qrData.qr_style,
        background_color: qrData.background_color,
        foreground_color: qrData.foreground_color,
        gradient_colors: qrData.gradient_colors,
        logo_enabled: qrData.logo_enabled,
        logo_size: qrData.logo_size,
        logo_icon: qrData.logo_icon,
        custom_logo_uri: qrData.custom_logo_uri,
        logo_type: qrData.logo_type,
        error_correction_level: qrData.error_correction_level,
        settings: qrData.settings
      });

      // 2. Tentar salvar na nuvem
      if (await this.checkOnlineStatus() && this.currentUserId) {
        try {
          await neonService.createQRCode({
            user_id: this.currentUserId,
            title: qrData.title,
            content: qrData.content,
            qr_type: qrData.qr_type,
            qr_style: qrData.qr_style,
            background_color: qrData.background_color,
            foreground_color: qrData.foreground_color,
            gradient_colors: qrData.gradient_colors,
            logo_enabled: qrData.logo_enabled,
            logo_size: qrData.logo_size < 1 ? Math.round(qrData.logo_size * 100) : qrData.logo_size, // 0.2 -> 20, 50 -> 50
            logo_icon: qrData.logo_icon,
            custom_logo_uri: qrData.custom_logo_uri || null,
            logo_type: qrData.logo_type,
            error_correction_level: qrData.error_correction_level,
            settings: qrData.settings || {},
            synced: true
          });

          console.log('QR code salvo na nuvem com sucesso');
        } catch (cloudError) {
          console.log('Erro ao salvar QR na nuvem:', cloudError);
          // Marcar para sincronização posterior
          await this.markForSync('qr_code', { userEmail, qrData });
        }
      } else {
        // Offline - marcar para sincronização posterior
        await this.markForSync('qr_code', { userEmail, qrData });
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar QR code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Adicionar ao histórico (local + nuvem)
  async addToHistory(
    userEmail: string,
    historyData: HybridHistoryData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Salvar localmente primeiro
      await historyDB.saveQRCode({
        type: historyData.type,
        rawData: historyData.rawData,
        parsedData: typeof historyData.parsedData === 'string' 
          ? JSON.parse(historyData.parsedData)
          : historyData.parsedData,
        description: historyData.description,
        actionText: historyData.actionText
      }, userEmail);

      // 2. Tentar salvar na nuvem
      if (await this.checkOnlineStatus() && this.currentUserId) {
        try {
          await neonService.createQRHistory({
            user_id: this.currentUserId,
            type: historyData.type,
            raw_data: historyData.rawData,
            parsed_data: typeof historyData.parsedData === 'string' 
              ? JSON.parse(historyData.parsedData) 
              : historyData.parsedData,
            description: historyData.description,
            action_text: historyData.actionText,
            synced: true
          });

          console.log('Histórico salvo na nuvem com sucesso');
        } catch (cloudError) {
          console.log('Erro ao salvar histórico na nuvem:', cloudError);
          await this.markForSync('history', { userEmail, historyData });
        }
      } else {
        await this.markForSync('history', { userEmail, historyData });
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Buscar QR codes (local first, depois nuvem)
  async getQRCodes(userEmail: string): Promise<any[]> {
    try {
      // 1. Buscar dados locais primeiro (resposta rápida)
      const localQRCodes = await getUserQRCodes(userEmail);

      // 2. Se online, tentar sincronizar com nuvem
      if (await this.checkOnlineStatus() && this.currentUserId) {
        try {
          const cloudQRCodes = await neonService.getQRCodesByUser(this.currentUserId);
          
          // Aqui você pode implementar lógica de merge se necessário
          // Por agora, retornamos os dados locais
          console.log(`Encontrados ${cloudQRCodes.length} QR codes na nuvem`);
        } catch (cloudError) {
          console.log('Erro ao buscar QR codes da nuvem:', cloudError);
        }
      }

      return localQRCodes;
    } catch (error) {
      console.error('Erro ao buscar QR codes:', error);
      return [];
    }
  }

  // Buscar histórico (local first, depois nuvem)
  async getHistory(userEmail: string): Promise<any[]> {
    try {
      // 1. Buscar dados locais primeiro
      const localHistory = await historyDB.getHistory();

      // 2. Se online, tentar sincronizar com nuvem
      if (await this.checkOnlineStatus() && this.currentUserId) {
        try {
          const cloudHistory = await neonService.getQRHistoryByUser(this.currentUserId);
          console.log(`Encontrados ${cloudHistory.length} itens de histórico na nuvem`);
        } catch (cloudError) {
          console.log('Erro ao buscar histórico da nuvem:', cloudError);
        }
      }

      return localHistory;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  // Marcar item para sincronização posterior
  private async markForSync(type: string, data: any): Promise<void> {
    try {
      const pendingSync = await AsyncStorage.getItem('@qr_facil_pending_sync');
      const pending = pendingSync ? JSON.parse(pendingSync) : [];
      
      pending.push({
        type,
        data,
        timestamp: Date.now()
      });

      await AsyncStorage.setItem('@qr_facil_pending_sync', JSON.stringify(pending));
      console.log(`Item marcado para sincronização: ${type}`);
    } catch (error) {
      console.error('Erro ao marcar para sync:', error);
    }
  }

  // Sincronizar itens pendentes
  async syncPendingItems(): Promise<{ success: boolean; syncedCount: number }> {
    try {
      if (!await this.checkOnlineStatus()) {
        return { success: false, syncedCount: 0 };
      }

      const pendingSync = await AsyncStorage.getItem('@qr_facil_pending_sync');
      if (!pendingSync) {
        return { success: true, syncedCount: 0 };
      }

      const pending = JSON.parse(pendingSync);
      let syncedCount = 0;

      for (const item of pending) {
        try {
          if (item.type === 'qr_code') {
            await this.saveQRCode(item.data.userEmail, item.data.qrData);
          } else if (item.type === 'history') {
            await this.addToHistory(item.data.userEmail, item.data.historyData);
          }
          syncedCount++;
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.type}:`, error);
        }
      }

      // Limpar itens sincronizados
      await AsyncStorage.removeItem('@qr_facil_pending_sync');

      return { success: true, syncedCount };
    } catch (error) {
      console.error('Erro ao sincronizar itens pendentes:', error);
      return { success: false, syncedCount: 0 };
    }
  }

  // Obter estatísticas do usuário
  async getUserStats(userEmail: string): Promise<{
    totalQRCodes: number;
    totalScans: number;
    premiumStatus: boolean;
  }> {
    try {
      // Dados locais
      const localQRCodes = await getUserQRCodes(userEmail);
      const localHistory = await historyDB.getHistory();
      const premiumInfo = await getUserPremiumInfo(userEmail);

      const stats = {
        totalQRCodes: localQRCodes.length,
        totalScans: localHistory.length,
        premiumStatus: premiumInfo.isPremium
      };

      // Se online, comparar com dados da nuvem
      if (await this.checkOnlineStatus() && this.currentUserId) {
        try {
          const cloudStats = await neonService.getUserStats(this.currentUserId);
          console.log('Stats da nuvem:', cloudStats);
        } catch (cloudError) {
          console.log('Erro ao buscar stats da nuvem:', cloudError);
        }
      }

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalQRCodes: 0,
        totalScans: 0,
        premiumStatus: false
      };
    }
  }
}

export const hybridService = new HybridService();