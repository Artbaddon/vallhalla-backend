import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db/connectMysql.js';

export { dbConfig };

export async function createConnection(config = {}) {
  const finalConfig = { ...dbConfig, ...config };
  // If database is explicitly null, remove it from config to connect to server only
  if (config.database === null) {
    delete finalConfig.database;
  }
  return await mysql.createConnection(finalConfig);
}
