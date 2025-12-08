import dotenv from "dotenv";
import { createPool } from "mysql2/promise";
import fs from 'fs';

dotenv.config();

const getSSLConfig = () => {
  // 1. Check for explicitly configured CA path
  if (process.env.DB_SSL_CA_PATH && fs.existsSync(process.env.DB_SSL_CA_PATH)) {
    return {
      ca: fs.readFileSync(process.env.DB_SSL_CA_PATH),
      rejectUnauthorized: false
    };
  }
  
  // 2. Fallback to the known deployment path
  const defaultCertPath = '/home/deploy/DigiCertGlobalRootCA.crt.pem';
  if (fs.existsSync(defaultCertPath)) {
    return {
      ca: fs.readFileSync(defaultCertPath),
      rejectUnauthorized: false
    };
  }

  // 3. If SSL is required but no CA found, allow insecure SSL connection
  // This fixes "Connections using insecure transport are prohibited" when no cert is available
  // You can force this by setting DB_SSL_REQUIRED=true in .env
  // Or if we are in a production-like environment where we suspect SSL is needed
  if (process.env.DB_SSL_REQUIRED === 'true' || process.env.NODE_ENV === 'production') {
    return {
      rejectUnauthorized: false
    };
  }

  return undefined;
};

const sslConfig = getSSLConfig();

export const connect = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: sslConfig
});

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  ssl: sslConfig
};