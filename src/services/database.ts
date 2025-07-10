import * as SQLite from 'expo-sqlite';

// Abrir/criar o banco de dados usando a nova API
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync('qrfacil_v2.db'); // Nova versão para limpar cache
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
        background_color TEXT DEFAULT '#FFFFFF',
        foreground_color TEXT DEFAULT '#000000',
        logo_enabled INTEGER DEFAULT 0,
        logo_size REAL DEFAULT 0.2,
        logo_icon TEXT DEFAULT '❤️',
        error_correction_level TEXT DEFAULT 'M',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email)
      );
    `);
    
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
  qr_type: 'text' | 'url' | 'email' | 'phone' | 'sms' | 'wifi' | 'contact' | 'payment';
  background_color?: string;
  foreground_color?: string;
  logo_enabled?: boolean;
  logo_size?: number;
  logo_icon?: string;
  error_correction_level?: 'L' | 'M' | 'Q' | 'H';
}

export const insertQRCode = async (userEmail: string, qrData: QRCodeData) => {
  try {
    const db = await openDatabase();
    
    const result = await db.runAsync(
      `INSERT INTO qr_codes 
       (user_email, title, content, qr_type, background_color, foreground_color, logo_enabled, logo_size, logo_icon, error_correction_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userEmail,
        qrData.title,
        qrData.content,
        qrData.qr_type,
        qrData.background_color || '#FFFFFF',
        qrData.foreground_color || '#000000',
        qrData.logo_enabled ? 1 : 0,
        qrData.logo_size || 0.2,
        qrData.logo_icon || '❤️',
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
  deleteQRCode
};