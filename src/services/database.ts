import * as SQLite from 'expo-sqlite';

// Abrir/criar o banco de dados usando a nova API
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync('qrfacil_v3.db'); // Nova versão para incluir novos campos
};

export const initDatabase = async () => {
  try {
    const db = await openDatabase();
    
    // Criar a tabela users se não existir
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        name TEXT,
        photo TEXT,
        premium_status INTEGER DEFAULT 0,
        free_qr_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar a tabela qr_codes se não existir
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        qr_type TEXT NOT NULL,
        qr_style TEXT DEFAULT 'traditional',
        background_color TEXT DEFAULT '#FFFFFF',
        foreground_color TEXT DEFAULT '#000000',
        gradient_colors TEXT DEFAULT '["#F58529","#DD2A7B","#8134AF","#515BD4"]',
        logo_enabled INTEGER DEFAULT 0,
        logo_size REAL DEFAULT 0.2,
        logo_icon TEXT DEFAULT '❤️',
        custom_logo_uri TEXT,
        logo_type TEXT DEFAULT 'icon',
        error_correction_level TEXT DEFAULT 'M',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email)
      );
    `);

    // Adicionar as novas colunas se a tabela já existir (migração)
    try {
      await db.execAsync(`ALTER TABLE qr_codes ADD COLUMN custom_logo_uri TEXT;`);
    } catch (error) {
      // Coluna já existe
    }
    
    try {
      await db.execAsync(`ALTER TABLE qr_codes ADD COLUMN logo_type TEXT DEFAULT 'icon';`);
    } catch (error) {
      // Coluna já existe
    }

    // Adicionar campos premium aos users se não existirem
    try {
      await db.execAsync(`ALTER TABLE users ADD COLUMN premium_status INTEGER DEFAULT 0;`);
    } catch (error) {
      // Coluna já existe
    }
    
    try {
      await db.execAsync(`ALTER TABLE users ADD COLUMN free_qr_used INTEGER DEFAULT 0;`);
    } catch (error) {
      // Coluna já existe
    }
    
    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

export const insertUser = async (userInfo: { email: string; name?: string; photo?: string }) => {
  try {
    const db = await openDatabase();
    
    // Verificar se o usuário já existe
    const existingUser = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?',
      [userInfo.email]
    );
    
    if (existingUser) {
      console.log('Usuário já existe no banco de dados');
      return existingUser;
    }
    
    // Inserir novo usuário
    const result = await db.runAsync(
      'INSERT INTO users (email, name, photo) VALUES (?, ?, ?)',
      [userInfo.email, userInfo.name || '', userInfo.photo || '']
    );
    
    console.log('Usuário inserido com sucesso, ID:', result.lastInsertRowId);
    return result;
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    throw error;
  }
};

export const getUser = async (email: string) => {
  try {
    const db = await openDatabase();
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const db = await openDatabase();
    const users = await db.getAllAsync('SELECT * FROM users');
    return users;
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw error;
  }
};

// Funções para QR Codes
export interface QRCodeData {
  title: string;
  content: string;
  qr_type: 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'contact';
  qr_style?: 'traditional' | 'instagram' | 'dots' | 'rounded';
  background_color?: string;
  foreground_color?: string;
  gradient_colors?: string[];
  logo_enabled?: boolean;
  logo_size?: number;
  logo_icon?: string;
  custom_logo_uri?: string | null;
  logo_type?: 'icon' | 'image';
  error_correction_level?: 'L' | 'M' | 'Q' | 'H';
}

export const insertQRCode = async (userEmail: string, qrData: QRCodeData) => {
  try {
    const db = await openDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO qr_codes 
       (user_email, title, content, qr_type, qr_style, background_color, foreground_color, gradient_colors, logo_enabled, logo_size, logo_icon, custom_logo_uri, logo_type, error_correction_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userEmail,
        qrData.title,
        qrData.content,
        qrData.qr_type,
        qrData.qr_style || 'traditional',
        qrData.background_color || '#FFFFFF',
        qrData.foreground_color || '#000000',
        JSON.stringify(qrData.gradient_colors || ['#F58529', '#DD2A7B', '#8134AF', '#515BD4']),
        qrData.logo_enabled ? 1 : 0,
        qrData.logo_size || 0.2,
        qrData.logo_icon || '❤️',
        qrData.custom_logo_uri || null,
        qrData.logo_type || 'icon',
        qrData.error_correction_level || 'M'
      ]
    );
    
    console.log('QR Code inserido com sucesso, ID:', result.lastInsertRowId);
    return result;
  } catch (error) {
    console.error('Erro ao inserir QR Code:', error);
    throw error;
  }
};

export const getUserQRCodes = async (userEmail: string) => {
  try {
    const db = await openDatabase();
    const qrCodes = await db.getAllAsync(
      'SELECT * FROM qr_codes WHERE user_email = ? ORDER BY created_at DESC',
      [userEmail]
    );
    return qrCodes;
  } catch (error) {
    console.error('Erro ao buscar QR codes do usuário:', error);
    throw error;
  }
};

export const deleteQRCode = async (qrCodeId: number, userEmail: string) => {
  try {
    const db = await openDatabase();
    const result = await db.runAsync(
      'DELETE FROM qr_codes WHERE id = ? AND user_email = ?',
      [qrCodeId, userEmail]
    );
    
    console.log('QR Code deletado com sucesso');
    return result;
  } catch (error) {
    console.error('Erro ao deletar QR Code:', error);
    throw error;
  }
};

export default {
  initDatabase,
  insertUser,
  getUser,
  getAllUsers,
  insertQRCode,
  getUserQRCodes,
  deleteQRCode,
  deleteUserAccount
};

// Funções para gerenciar status premium
export const updateUserPremiumStatus = async (userEmail: string, isPremium: boolean) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      'UPDATE users SET premium_status = ? WHERE email = ?',
      [isPremium ? 1 : 0, userEmail]
    );
    console.log('Premium status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating premium status:', error);
    return false;
  }
};

export const markFreeQRUsed = async (userEmail: string) => {
  try {
    const db = await openDatabase();
    await db.runAsync(
      'UPDATE users SET free_qr_used = 1 WHERE email = ?',
      [userEmail]
    );
    console.log('Free QR marked as used');
    return true;
  } catch (error) {
    console.error('Error marking free QR as used:', error);
    return false;
  }
};

export const getUserPremiumInfo = async (userEmail: string) => {
  try {
    const db = await openDatabase();
    const user = await db.getFirstAsync(
      'SELECT premium_status, free_qr_used FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (user) {
      return {
        isPremium: (user as any).premium_status === 1,
        freeQRUsed: (user as any).free_qr_used === 1
      };
    }
    
    return { isPremium: false, freeQRUsed: false };
  } catch (error) {
    console.error('Error getting premium info:', error);
    return { isPremium: false, freeQRUsed: false };
  }
};

// Função para deletar completamente a conta do usuário e todos os dados associados
export const deleteUserAccount = async (userEmail: string) => {
  try {
    const db = await openDatabase();
    
    // Deletar todos os QR codes do usuário
    await db.runAsync(
      'DELETE FROM qr_codes WHERE user_email = ?',
      [userEmail]
    );
    
    // Deletar o usuário
    await db.runAsync(
      'DELETE FROM users WHERE email = ?',
      [userEmail]
    );
    
    console.log('User account and all associated data deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    return false;
  }
};