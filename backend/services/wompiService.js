import { wompiAPI, wompiConfig } from "../config/wompi/wompi.js";
import CryptoJS from "crypto-js";
import crypto from "crypto";

class WompiService {
  constructor() {
    this.baseUrl = process.env.WOMPI_BASE_URL;
    this.privateKey = process.env.WOMPI_PRIVATE_KEY;
    this.publicKey = process.env.WOMPI_PUBLIC_KEY;
    this.integrityKey = process.env.WOMPI_INTEGRITY_KEY;
  }

  // Calcular firma con crypto-js
  calculateSignature(reference, amountInCents, currency) {
    const data = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    console.log("📝 Datos para signature:", data);

    const signature = CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    console.log("🔐 Signature generada:", signature);

    return signature;
  }

  async createTransaction(paymentData) {
    try {
      const signature = this.calculateSignature(
        paymentData.reference,
        paymentData.amount_in_cents,
        paymentData.currency
      );

      const payloadWithSignature = {
        ...paymentData,
        signature: signature,
      };

      console.log("🔄 Enviando a Wompi...");

      const response = await wompiAPI.post(
        "/transactions",
        payloadWithSignature
      );

      console.log("✅ Transacción creada exitosamente en Wompi");
      return response.data;
    } catch (error) {
      console.error("❌ ERROR DETALLADO DE WOMPI:");
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error("Data:", error.response?.data);

      const wompiError = error.response?.data;
      if (wompiError) {
        throw new Error(`Wompi error: ${JSON.stringify(wompiError)}`);
      }

      throw new Error(`Error de conexión con Wompi: ${error.message}`);
    }
  }

  async getAcceptanceToken() {
    try {
      const response = await wompiAPI.get(`/merchants/${this.publicKey}`);

      console.log("📦 Respuesta completa de Wompi:", response.data);

      const token = response.data?.data?.presigned_acceptance?.acceptance_token;

      if (!token) {
        throw new Error("No se encontró presigned_acceptance en la respuesta");
      }

      console.log("✅ Acceptance token obtenido:", token);
      return token;
    } catch (error) {
      console.error(
        "Error obteniendo acceptance token:",
        error.response?.data || error.message
      );
      throw new Error("No se pudo obtener el acceptance token");
    }
  }

  // Verificar estado de transacción
  async getTransactionStatus(transactionId) {
    try {
      const response = await wompiAPI.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error obteniendo estado de transacción:",
        error.response?.data
      );
      throw new Error("Error al obtener estado de transacción");
    }
  }

  // Generar referencia única
  generateReference(prefix = "REF") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`.toUpperCase();
  }

  // Procesar webhook de Wompi
  async processWebhook(webhookData) {
    try {
      const { event, data, timestamp, signature } = webhookData;

      console.log("🔄 Procesando webhook de Wompi:");
      console.log("📧 Evento:", event);
      console.log("🆔 Transaction ID:", data.transaction?.id);
      console.log("📊 Estado:", data.transaction?.status);

      // Verificar la firma del webhook
      const isValidSignature = await this.verifyWebhookSignature(
        signature,
        webhookData
      );

      if (!isValidSignature) {
        throw new Error("Firma de webhook inválida");
      }

      const { id, reference, status } = data.transaction;

      // Buscar y actualizar el pago en tu base de datos
      // NOTA: Necesitas importar tu modelo Payment
      const payment = await this.updatePaymentStatus(reference, {
        status: this.mapWompiStatus(status),
        wompiTransactionId: id,
        receiptUrl: data.transaction.receipt_url || null,
        updatedAt: new Date(),
      });

      if (!payment) {
        console.warn(`⚠️ Pago con referencia ${reference} no encontrado`);
        return { success: false, error: "Pago no encontrado" };
      }

      console.log("✅ Webhook procesado exitosamente");
      return { success: true, payment };
    } catch (error) {
      console.error("❌ Error procesando webhook:", error);
      throw error;
    }
  }

  // Actualizar estado del pago en BD (debes implementar según tu modelo)
  async updatePaymentStatus(reference, updateData) {
    try {
      // EJEMPLO - Reemplaza con tu modelo real
      // const payment = await Payment.findOneAndUpdate(
      //   { reference },
      //   updateData,
      //   { new: true }
      // ).populate("user");

      // return payment;

      console.log(`📝 Actualizando pago ${reference}:`, updateData);
      // Implementa la lógica real con tu base de datos
      return { reference, ...updateData }; // Placeholder
    } catch (error) {
      console.error("Error actualizando pago:", error);
      throw error;
    }
  }

  // Mapear estados de Wompi a tus estados internos
  mapWompiStatus(wompiStatus) {
    const statusMap = {
      PENDING: 1, // PENDING
      APPROVED: 2, // APPROVED
      DECLINED: 3, // DECLINED
      VOIDED: 4, // VOIDED
      ERROR: 5, // ERROR
    };

    return statusMap[wompiStatus] || "unknown";
  }

  // Verificar firma del webhook (Método estático mejorado)
  static async verifyWebhookSignature(
    signature,
    payload,
    secret = process.env.WOMPI_INTEGRITY_KEY
  ) {
    try {
      console.log("🔐 Verificando firma del webhook...");

      // En sandbox, Wompi puede usar diferentes métodos de firma
      const event = payload.event;
      const data = payload.data ? JSON.stringify(payload.data) : "";
      const timestamp = payload.timestamp || "";

      // Método 1: event + data (común en sandbox)
      const message1 = event + data;
      const expectedSignature1 = crypto
        .createHmac("sha256", secret)
        .update(message1)
        .digest("hex");

      // Método 2: Solo con event (alternativo)
      const expectedSignature2 = crypto
        .createHmac("sha256", secret)
        .update(event)
        .digest("hex");

      console.log(`   Firma recibida: ${signature}`);
      console.log(`   Firma esperada (método 1): ${expectedSignature1}`);
      console.log(`   Firma esperada (método 2): ${expectedSignature2}`);

      // En desarrollo, puedes ser más permisivo
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️  Modo desarrollo: Verificación de firma relajada");

        // Si no hay firma en sandbox, aceptar
        if (!signature) {
          console.log("   No hay firma, aceptando en modo desarrollo");
          return true;
        }

        // Verificar contra ambos métodos posibles
        if (
          signature === expectedSignature1 ||
          signature === expectedSignature2
        ) {
          return true;
        }

        console.warn("   Firmas no coinciden, pero aceptando en desarrollo");
        return true;
      }

      // En producción, verificación estricta
      return (
        signature === expectedSignature1 || signature === expectedSignature2
      );
    } catch (error) {
      console.error("❌ Error verificando firma:", error);
      return false;
    }
  }

  // Método para validar estructura del webhook
  validateWebhookStructure(webhookData) {
    const requiredFields = ["event", "data", "timestamp", "signature"];
    const missingFields = requiredFields.filter((field) => !webhookData[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Campos faltantes en webhook: ${missingFields.join(", ")}`
      );
    }

    if (!webhookData.data.transaction) {
      throw new Error("Estructura de transacción inválida en webhook");
    }

    return true;
  }
}

export default new WompiService();
