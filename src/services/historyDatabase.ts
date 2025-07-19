import * as SQLite from 'expo-sqlite';
import { QRCodeData } from '../utils/qrCodeProcessor';

export interface QRCodeHistoryItem {
  id?: number;
  type: string;
  rawData: string;
  parsedData: string; // JSON string
  description: string;
  actionText: string;
  timestamp: number;
  userEmail?: string;
}

class HistoryDatabase {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase() {
    try {
      this.db = await SQLite.openDatabaseAsync('qr_history.db');
      
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS qr_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          rawData TEXT NOT NULL,
          parsedData TEXT NOT NULL,
          description TEXT NOT NULL,
          actionText TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          userEmail TEXT
        );
      `);
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  async saveQRCode(qrData: QRCodeData, userEmail?: string): Promise<number | null> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const result = await this.db!.runAsync(
        `INSERT INTO qr_history (type, rawData, parsedData, description, actionText, timestamp, userEmail) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          qrData.type,
          qrData.rawData,
          JSON.stringify(qrData.parsedData),
          qrData.description,
          qrData.actionText,
          Date.now(),
          userEmail || null
        ]
      );
      
      console.log('QR Code saved to history with ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error saving QR code to history:', error);
      return null;
    }
  }

  async getHistory(userEmail?: string, limit: number = 100): Promise<QRCodeHistoryItem[]> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      let query = 'SELECT * FROM qr_history';
      let params: any[] = [];

      if (userEmail) {
        query += ' WHERE userEmail = ?';
        params.push(userEmail);
      }

      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limit);

      const rows = await this.db!.getAllAsync(query, params);
      
      return rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        rawData: row.rawData,
        parsedData: row.parsedData,
        description: row.description,
        actionText: row.actionText,
        timestamp: row.timestamp,
        userEmail: row.userEmail
      }));
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  async deleteHistoryItem(id: number): Promise<boolean> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      await this.db!.runAsync('DELETE FROM qr_history WHERE id = ?', [id]);
      console.log('History item deleted:', id);
      return true;
    } catch (error) {
      console.error('Error deleting history item:', error);
      return false;
    }
  }

  async clearHistory(userEmail?: string): Promise<boolean> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      if (userEmail) {
        await this.db!.runAsync('DELETE FROM qr_history WHERE userEmail = ?', [userEmail]);
      } else {
        await this.db!.runAsync('DELETE FROM qr_history');
      }
      console.log('History cleared');
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  }

  async getHistoryItemById(id: number): Promise<QRCodeHistoryItem | null> {
    if (!this.db) {
      await this.initDatabase();
    }

    try {
      const row = await this.db!.getFirstAsync('SELECT * FROM qr_history WHERE id = ?', [id]);
      
      if (row) {
        return {
          id: (row as any).id,
          type: (row as any).type,
          rawData: (row as any).rawData,
          parsedData: (row as any).parsedData,
          description: (row as any).description,
          actionText: (row as any).actionText,
          timestamp: (row as any).timestamp,
          userEmail: (row as any).userEmail
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting history item by ID:', error);
      return null;
    }
  }

  // Função para deletar completamente todo o histórico de um usuário
  async deleteUserHistory(userEmail: string): Promise<boolean> {
    return await this.clearHistory(userEmail);
  }
}

export const historyDB = new HistoryDatabase();