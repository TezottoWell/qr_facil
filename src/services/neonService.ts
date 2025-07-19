import { neon } from '@neondatabase/serverless';
import { NEON_DATABASE_URL } from '@env';

// Configuração da conexão com Neon Database
if (!NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL não está configurada no arquivo .env');
}

const sql = neon(NEON_DATABASE_URL);

export interface User {
  id: string;
  email: string;
  name: string;
  photo_url?: string;
  premium_status: boolean;
  premium_purchased_at?: Date;
  free_qr_used: boolean;
  google_id: string;
  created_at: Date;
  updated_at: Date;
  last_sync_at?: Date;
}

export interface QRCode {
  id: string;
  user_id: string;
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
  settings: any;
  created_at: Date;
  updated_at: Date;
  synced: boolean;
  deleted_at?: Date;
}

export interface QRHistory {
  id: string;
  user_id: string;
  type: string;
  raw_data: string;
  parsed_data: any;
  description: string;
  action_text: string;
  scanned_at: Date;
  synced: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_provider: 'apple' | 'google';
  transaction_id: string;
  product_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
  processed_at?: Date;
}

class NeonService {
  // Operações de Usuário
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, name, photo_url, premium_status, free_qr_used, google_id)
      VALUES (${userData.email}, ${userData.name}, ${userData.photo_url}, ${userData.premium_status}, ${userData.free_qr_used}, ${userData.google_id})
      RETURNING *
    `;
    return result[0] as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result[0] as User || null;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE google_id = ${googleId} LIMIT 1
    `;
    return result[0] as User || null;
  }

  async updateUserPremiumStatus(userId: string, premiumStatus: boolean): Promise<void> {
    await sql`
      UPDATE users 
      SET premium_status = ${premiumStatus}, 
          premium_purchased_at = ${premiumStatus ? new Date() : null},
          updated_at = NOW()
      WHERE id = ${userId}
    `;
  }

  async updateUserSyncTime(userId: string): Promise<void> {
    await sql`
      UPDATE users 
      SET last_sync_at = NOW(),
          updated_at = NOW()
      WHERE id = ${userId}
    `;
  }

  // Operações de QR Codes
  async createQRCode(qrData: Omit<QRCode, 'id' | 'created_at' | 'updated_at'>): Promise<QRCode> {
    const result = await sql`
      INSERT INTO qr_codes (
        user_id, title, content, qr_type, qr_style, background_color, 
        foreground_color, gradient_colors, logo_enabled, logo_size, 
        logo_icon, custom_logo_uri, logo_type, error_correction_level, 
        settings, synced
      )
      VALUES (
        ${qrData.user_id}, ${qrData.title}, ${qrData.content}, ${qrData.qr_type}, 
        ${qrData.qr_style}, ${qrData.background_color}, ${qrData.foreground_color}, 
        ${JSON.stringify(qrData.gradient_colors)}, ${qrData.logo_enabled}, 
        ${qrData.logo_size}, ${qrData.logo_icon}, ${qrData.custom_logo_uri}, 
        ${qrData.logo_type}, ${qrData.error_correction_level}, 
        ${JSON.stringify(qrData.settings)}, ${qrData.synced}
      )
      RETURNING *
    `;
    
    const qrCode = result[0] as any;
    
    // Parse JSON fields safely
    try {
      qrCode.gradient_colors = qrCode.gradient_colors ? JSON.parse(qrCode.gradient_colors) : [];
    } catch {
      qrCode.gradient_colors = [];
    }
    
    try {
      qrCode.settings = qrCode.settings ? JSON.parse(qrCode.settings) : {};
    } catch {
      qrCode.settings = {};
    }
    
    return qrCode as QRCode;
  }

  async getQRCodesByUser(userId: string): Promise<QRCode[]> {
    // Validação de segurança: verificar se userId é válido
    if (!userId || typeof userId !== 'string') {
      throw new Error('UserId inválido');
    }

    const result = await sql`
      SELECT * FROM qr_codes 
      WHERE user_id = ${userId} AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
    
    return result.map((qr: any) => {
      // Parse JSON fields safely
      let gradient_colors = [];
      let settings = {};
      
      try {
        gradient_colors = qr.gradient_colors ? JSON.parse(qr.gradient_colors) : [];
      } catch {
        gradient_colors = [];
      }
      
      try {
        settings = qr.settings ? JSON.parse(qr.settings) : {};
      } catch {
        settings = {};
      }
      
      return {
        ...qr,
        gradient_colors,
        settings
      };
    }) as QRCode[];
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<void> {
    const setClause = Object.entries(updates)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => {
        if (key === 'gradient_colors' || key === 'settings') {
          return `${key} = '${JSON.stringify(value)}'`;
        }
        return `${key} = '${value}'`;
      })
      .join(', ');

    if (setClause) {
      await sql`
        UPDATE qr_codes 
        SET ${sql.unsafe(setClause)}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }
  }

  async deleteQRCode(id: string): Promise<void> {
    await sql`
      UPDATE qr_codes 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  // Operações de Histórico
  async createQRHistory(historyData: Omit<QRHistory, 'id' | 'scanned_at'>): Promise<QRHistory> {
    const result = await sql`
      INSERT INTO qr_history (
        user_id, type, raw_data, parsed_data, description, action_text, synced
      )
      VALUES (
        ${historyData.user_id}, ${historyData.type}, ${historyData.raw_data}, 
        ${JSON.stringify(historyData.parsed_data)}, ${historyData.description}, 
        ${historyData.action_text}, ${historyData.synced}
      )
      RETURNING *
    `;
    
    const history = result[0] as any;
    
    // Parse JSON safely
    try {
      history.parsed_data = history.parsed_data ? JSON.parse(history.parsed_data) : {};
    } catch {
      history.parsed_data = {};
    }
    
    return history as QRHistory;
  }

  async getQRHistoryByUser(userId: string, limit: number = 100): Promise<QRHistory[]> {
    // Validação de segurança
    if (!userId || typeof userId !== 'string') {
      throw new Error('UserId inválido');
    }

    // Limitar o limite máximo para evitar sobrecarga
    const safeLimit = Math.min(Math.max(limit, 1), 1000);

    const result = await sql`
      SELECT * FROM qr_history 
      WHERE user_id = ${userId}
      ORDER BY scanned_at DESC
      LIMIT ${safeLimit}
    `;
    
    return result.map((history: any) => {
      // Parse JSON safely
      let parsed_data = {};
      
      try {
        parsed_data = history.parsed_data ? JSON.parse(history.parsed_data) : {};
      } catch {
        parsed_data = {};
      }
      
      return {
        ...history,
        parsed_data
      };
    }) as QRHistory[];
  }

  // Operações de Pagamento
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const result = await sql`
      INSERT INTO payments (
        user_id, amount, currency, payment_provider, transaction_id, 
        product_id, status, processed_at
      )
      VALUES (
        ${paymentData.user_id}, ${paymentData.amount}, ${paymentData.currency}, 
        ${paymentData.payment_provider}, ${paymentData.transaction_id}, 
        ${paymentData.product_id}, ${paymentData.status}, ${paymentData.processed_at}
      )
      RETURNING *
    `;
    return result[0] as Payment;
  }

  async updatePaymentStatus(transactionId: string, status: Payment['status']): Promise<void> {
    await sql`
      UPDATE payments 
      SET status = ${status}, 
          processed_at = ${status === 'completed' ? new Date() : null}
      WHERE transaction_id = ${transactionId}
    `;
  }

  async getPaymentByTransaction(transactionId: string): Promise<Payment | null> {
    const result = await sql`
      SELECT * FROM payments WHERE transaction_id = ${transactionId} LIMIT 1
    `;
    return result[0] as Payment || null;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    const result = await sql`
      SELECT * FROM payments 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result as Payment[];
  }

  // Operações de Sincronização
  async getUnsyncedQRCodes(userId: string): Promise<QRCode[]> {
    const result = await sql`
      SELECT * FROM qr_codes 
      WHERE user_id = ${userId} AND synced = false
      ORDER BY updated_at DESC
    `;
    
    return result.map((qr: any) => {
      // Parse JSON fields safely
      let gradient_colors = [];
      let settings = {};
      
      try {
        gradient_colors = qr.gradient_colors ? JSON.parse(qr.gradient_colors) : [];
      } catch {
        gradient_colors = [];
      }
      
      try {
        settings = qr.settings ? JSON.parse(qr.settings) : {};
      } catch {
        settings = {};
      }
      
      return {
        ...qr,
        gradient_colors,
        settings
      };
    }) as QRCode[];
  }

  async markQRCodeAsSynced(id: string): Promise<void> {
    await sql`
      UPDATE qr_codes 
      SET synced = true, updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  async getUnsyncedHistory(userId: string): Promise<QRHistory[]> {
    const result = await sql`
      SELECT * FROM qr_history 
      WHERE user_id = ${userId} AND synced = false
      ORDER BY scanned_at DESC
    `;
    
    return result.map((history: any) => {
      // Parse JSON safely
      let parsed_data = {};
      
      try {
        parsed_data = history.parsed_data ? JSON.parse(history.parsed_data) : {};
      } catch {
        parsed_data = {};
      }
      
      return {
        ...history,
        parsed_data
      };
    }) as QRHistory[];
  }

  async markHistoryAsSynced(id: string): Promise<void> {
    await sql`
      UPDATE qr_history 
      SET synced = true
      WHERE id = ${id}
    `;
  }

  // Verificação de Conectividade
  async testConnection(): Promise<boolean> {
    try {
      await sql`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Erro de conexão com Neon:', error);
      return false;
    }
  }

  // Estatísticas
  async getUserStats(userId: string): Promise<{
    totalQRCodes: number;
    totalScans: number;
    premiumStatus: boolean;
  }> {
    const [qrStats, historyStats, userInfo] = await Promise.all([
      sql`SELECT COUNT(*) as total FROM qr_codes WHERE user_id = ${userId} AND deleted_at IS NULL`,
      sql`SELECT COUNT(*) as total FROM qr_history WHERE user_id = ${userId}`,
      sql`SELECT premium_status FROM users WHERE id = ${userId}`
    ]);

    return {
      totalQRCodes: parseInt(qrStats[0].total),
      totalScans: parseInt(historyStats[0].total),
      premiumStatus: userInfo[0]?.premium_status || false
    };
  }
}

export const neonService = new NeonService();