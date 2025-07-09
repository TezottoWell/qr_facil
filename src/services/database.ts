import * as SQLite from 'expo-sqlite';

// Abrir/criar o banco de dados usando a nova API
const openDatabase = async () => {
  return await SQLite.openDatabaseAsync('qrfacil.db');
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

export default {
  initDatabase,
  insertUser,
  getUser,
  getAllUsers
};