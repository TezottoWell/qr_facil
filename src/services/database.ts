import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('qrfacil.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT);'
    );
  });
};

export default db;
