import { getUser, getUserQRCodes, getUserPremiumInfo } from './database';
import { historyDB } from './historyDatabase';
import { neonService } from './neonService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MigrationProgress {
  step: string;
  progress: number; // 0-100
  totalSteps: number;
  currentStep: number;
  isComplete: boolean;
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  migratedUsers: number;
  migratedQRCodes: number;
  migratedHistory: number;
  error?: string;
  timeTaken: number;
}

export interface MigrationOptions {
  userEmail: string;
  userId?: string;
  preserveLocalData: boolean;
  onProgress?: (progress: MigrationProgress) => void;
}

class MigrationService {
  private readonly MIGRATION_KEY = '@qr_facil_migration_status';
  
  // Verificar se migração já foi executada
  async hasMigrated(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(this.MIGRATION_KEY);
      return status === 'completed';
    } catch {
      return false;
    }
  }

  // Marcar migração como concluída
  private async markMigrationComplete(): Promise<void> {
    await AsyncStorage.setItem(this.MIGRATION_KEY, 'completed');
    await AsyncStorage.setItem(`${this.MIGRATION_KEY}_timestamp`, new Date().toISOString());
  }

  // Migração completa
  async migrateToCloud(options: MigrationOptions): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      success: false,
      migratedUsers: 0,
      migratedQRCodes: 0,
      migratedHistory: 0,
      timeTaken: 0
    };

    try {
      // Verificar se migração já foi executada
      if (await this.hasMigrated()) {
        throw new Error('Migração já foi executada anteriormente');
      }

      const totalSteps = 5;
      let currentStep = 0;

      const updateProgress = (step: string, progress: number) => {
        currentStep++;
        options.onProgress?.({
          step,
          progress,
          totalSteps,
          currentStep,
          isComplete: false
        });
      };

      // Passo 1: Verificar conectividade
      updateProgress('Verificando conectividade com servidor...', 20);
      const isConnected = await neonService.testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao servidor Neon');
      }

      // Passo 2: Migrar usuário
      updateProgress('Migrando dados do usuário...', 40);
      const userMigrated = await this.migrateUser(options.userEmail, options.userId);
      if (userMigrated) {
        result.migratedUsers = 1;
      }

      // Passo 3: Migrar QR codes
      updateProgress('Migrando QR codes salvos...', 60);
      result.migratedQRCodes = await this.migrateQRCodes(options.userEmail, options.userId);

      // Passo 4: Migrar histórico
      updateProgress('Migrando histórico de escaneamentos...', 80);
      result.migratedHistory = await this.migrateHistory(options.userEmail, options.userId);

      // Passo 5: Finalizar
      updateProgress('Finalizando migração...', 100);
      
      // Marcar migração como concluída
      await this.markMigrationComplete();

      // Limpar dados locais se solicitado
      if (!options.preserveLocalData) {
        await this.cleanupLocalData();
      }

      result.success = true;
      result.timeTaken = Date.now() - startTime;

      // Notificar conclusão
      options.onProgress?.({
        step: 'Migração concluída com sucesso!',
        progress: 100,
        totalSteps,
        currentStep: totalSteps,
        isComplete: true
      });

      return result;

    } catch (error) {
      console.error('Erro na migração:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      result.error = errorMessage;
      result.timeTaken = Date.now() - startTime;

      // Notificar erro
      options.onProgress?.({
        step: `Erro na migração: ${errorMessage}`,
        progress: 0,
        totalSteps: 5,
        currentStep: 0,
        isComplete: false,
        error: errorMessage
      });

      return result;
    }
  }

  // Migrar dados do usuário
  private async migrateUser(userEmail: string, userId?: string): Promise<boolean> {
    try {
      // Verificar se usuário já existe na nuvem
      const existingUser = await neonService.getUserByEmail(userEmail);
      
      if (!existingUser) {
        // Buscar dados locais do usuário
        const localUserInfo = await getUser(userEmail);
        
        if (localUserInfo) {
          // Criar usuário na nuvem
          await neonService.createUser({
            email: userEmail,
            name: localUserInfo.name || 'Usuário',
            photo_url: localUserInfo.photo || undefined,
            premium_status: localUserInfo.isPremium || false,
            free_qr_used: localUserInfo.freeQRUsed || false,
            google_id: userId || `migrated_${Date.now()}`
          });

          console.log('Usuário migrado para a nuvem');
          return true;
        }
      } else {
        console.log('Usuário já existe na nuvem');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao migrar usuário:', error);
      throw error;
    }
  }

  // Migrar QR codes
  private async migrateQRCodes(userEmail: string, userId?: string): Promise<number> {
    try {
      // Obter usuário da nuvem para ter o ID
      const cloudUser = await neonService.getUserByEmail(userEmail);
      if (!cloudUser) {
        throw new Error('Usuário não encontrado na nuvem');
      }

      // Buscar QR codes locais
      const localQRCodes = await getUserQRCodes(userEmail);
      const cloudQRCodes = await neonService.getQRCodesByUser(cloudUser.id);
      
      let migratedCount = 0;

      for (const localQR of localQRCodes) {
        try {
          // Verificar se QR já existe na nuvem (por título e conteúdo)
          const existsInCloud = cloudQRCodes.some(cloudQR => 
            cloudQR.title === localQR.title && 
            cloudQR.content === localQR.content
          );

          if (!existsInCloud) {
            // Converter dados locais para formato da nuvem
            const cloudQRData = {
              user_id: cloudUser.id,
              title: localQR.title || 'QR Code Migrado',
              content: localQR.content || '',
              qr_type: localQR.qr_type || 'text',
              qr_style: localQR.qr_style || 'traditional',
              background_color: localQR.background_color || '#FFFFFF',
              foreground_color: localQR.foreground_color || '#000000',
              gradient_colors: Array.isArray(localQR.gradient_colors) ? localQR.gradient_colors : [],
              logo_enabled: localQR.logo_enabled || false,
              logo_size: localQR.logo_size < 1 ? Math.round(localQR.logo_size * 100) : (localQR.logo_size || 50),
              logo_icon: localQR.logo_icon || '',
              custom_logo_uri: localQR.custom_logo_uri || null,
              logo_type: localQR.logo_type || 'icon',
              error_correction_level: localQR.error_correction_level || 'M',
              settings: localQR.settings || {},
              synced: true
            };

            await neonService.createQRCode(cloudQRData);
            migratedCount++;
            
            console.log(`QR code "${localQR.title}" migrado`);
          }
        } catch (qrError) {
          console.error(`Erro ao migrar QR code "${localQR.title}":`, qrError);
        }
      }

      console.log(`Total de QR codes migrados: ${migratedCount}`);
      return migratedCount;

    } catch (error) {
      console.error('Erro ao migrar QR codes:', error);
      throw error;
    }
  }

  // Migrar histórico
  private async migrateHistory(userEmail: string, userId?: string): Promise<number> {
    try {
      // Obter usuário da nuvem para ter o ID
      const cloudUser = await neonService.getUserByEmail(userEmail);
      if (!cloudUser) {
        throw new Error('Usuário não encontrado na nuvem');
      }

      // Buscar histórico local
      const localHistory = await historyDB.getHistory();
      let migratedCount = 0;

      for (const localItem of localHistory) {
        try {
          // Converter dados locais para formato da nuvem
          const cloudHistoryData = {
            user_id: cloudUser.id,
            type: localItem.type || 'unknown',
            raw_data: localItem.rawData || '',
            parsed_data: typeof localItem.parsedData === 'string' 
              ? JSON.parse(localItem.parsedData) 
              : localItem.parsedData || {},
            description: localItem.description || '',
            action_text: localItem.actionText || '',
            synced: true
          };

          await neonService.createQRHistory(cloudHistoryData);
          migratedCount++;
          
          console.log('Item de histórico migrado');
        } catch (historyError) {
          console.error('Erro ao migrar item de histórico:', historyError);
        }
      }

      console.log(`Total de itens de histórico migrados: ${migratedCount}`);
      return migratedCount;

    } catch (error) {
      console.error('Erro ao migrar histórico:', error);
      throw error;
    }
  }

  // Limpeza de dados locais (opcional)
  private async cleanupLocalData(): Promise<void> {
    try {
      console.log('Iniciando limpeza de dados locais...');
      
      // Não remover o banco inteiro, apenas marcar como sincronizado
      // para manter funcionalidade offline
      
      // Você pode implementar uma limpeza mais agressiva se desejar
      // await DatabaseService.clearAllData();
      // await HistoryDatabaseService.clearAllHistory();
      
      console.log('Limpeza concluída');
    } catch (error) {
      console.error('Erro na limpeza:', error);
      // Não falhar a migração por causa da limpeza
    }
  }

  // Validar dados antes da migração
  async validateDataIntegrity(userEmail: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Verificar dados do usuário
      const userInfo = await getUser(userEmail);
      if (!userInfo) {
        issues.push('Dados do usuário não encontrados');
      }

      // Verificar QR codes
      const qrCodes = await getUserQRCodes(userEmail);
      const invalidQRs = qrCodes.filter(qr => !qr.content || !qr.title);
      if (invalidQRs.length > 0) {
        issues.push(`${invalidQRs.length} QR codes com dados incompletos`);
      }

      // Verificar histórico
      const history = await historyDB.getHistory();
      const invalidHistory = history.filter(item => !item.rawData);
      if (invalidHistory.length > 0) {
        issues.push(`${invalidHistory.length} itens de histórico com dados incompletos`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Erro ao validar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return {
        isValid: false,
        issues
      };
    }
  }

  // Backup dos dados locais antes da migração
  async createBackup(userEmail: string): Promise<{
    success: boolean;
    backupData?: any;
    error?: string;
  }> {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        userEmail,
        user: await getUser(userEmail),
        qrCodes: await getUserQRCodes(userEmail),
        history: await historyDB.getHistory()
      };

      // Salvar backup no AsyncStorage
      const backupKey = `@qr_facil_backup_${Date.now()}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));

      console.log('Backup criado com sucesso:', backupKey);

      return {
        success: true,
        backupData
      };

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Obter status da migração
  async getMigrationStatus(): Promise<{
    hasCompletedMigration: boolean;
    migrationDate?: string;
  }> {
    try {
      const hasCompleted = await this.hasMigrated();
      let migrationDate: string | undefined;

      if (hasCompleted) {
        migrationDate = await AsyncStorage.getItem(`${this.MIGRATION_KEY}_timestamp`) || undefined;
      }

      return {
        hasCompletedMigration: hasCompleted,
        migrationDate
      };
    } catch {
      return {
        hasCompletedMigration: false
      };
    }
  }

  // Reset da migração (para testes)
  async resetMigration(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.MIGRATION_KEY,
      `${this.MIGRATION_KEY}_timestamp`
    ]);
  }
}

export const migrationService = new MigrationService();