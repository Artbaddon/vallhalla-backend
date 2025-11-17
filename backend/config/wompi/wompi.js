// config/wompi/wompi.js
import axios from "axios";

const wompiConfig = {
  publicKey: process.env.WOMPI_PUBLIC_KEY,
  privateKey: process.env.WOMPI_PRIVATE_KEY,
  integrityKey: process.env.WOMPI_INTEGRITY_KEY, // ✅ nueva línea
  baseUrl: "https://sandbox.wompi.co/v1", // o producción si ya estás en live
};

// ✅ Agrega este logging para verificar las keys
console.log("🔑 Verificando configuración Wompi:");
console.log("Base URL:", wompiConfig.baseURL);
console.log("Public Key existe:", !!wompiConfig.publicKey);
console.log("Public Key:", wompiConfig.publicKey?.substring(0, 10) + "...");

export const wompiAPI = axios.create({
  baseURL: wompiConfig.baseUrl,
  headers: {
    Authorization: `Bearer ${wompiConfig.publicKey}`,
    "Content-Type": "application/json",
  },
});

export { wompiConfig };
