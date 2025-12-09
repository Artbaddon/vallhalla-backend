import PaymentModel from "../models/payment.model.js";
import WompiService from "../services/wompiService.js";
import { resolveOwnerId } from "../utils/ownerUtils.js";
import { getPaymentReportData } from "../services/paymentReportService.js";
import { generateExcelReport } from "../utils/excelGenerator.js";

class PaymentController {
  // Constructor is not needed since we don't have any initialization
  constructor() {}

  async getAllpayment() {
    const payments = await PaymentModel.show();
    if (payments.error) throw new Error(payments.error);
    return payments;
  }

  async show(req, res) {
    try {
      let payments;

      // If user is an owner, only show their payments
      if (req.user.roleId === 2) {
        // Owner role
        const ownerId = req.user.Owner_id;
        if (!ownerId) {
          return res.status(403).json({
            success: false,
            error: "Owner ID not found for this user",
          });
        }
        payments = await PaymentModel.findByOwner(ownerId);
      } else {
        // Admin or other roles can see all payments
        payments = await PaymentModel.show();
      }

      res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: payments,
      });
    } catch (error) {
      console.error("Error retrieving payments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async showById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      const payment = await PaymentModel.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment found successfully",
        data: payment,
      });
    } catch (error) {
      console.error("Error finding payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required",
        });
      }

      const deleted = await PaymentModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async getOwnerPayments(req, res) {
    try {
      const ownerIdentifier = req.params.owner_id;

      // Debug logging
      console.log("User object:", req.user);
      console.log("Role name:", req.user.Role_name);
      console.log("Role ID:", req.user.roleId);
      console.log("Owner identifier received:", ownerIdentifier);

      if (!ownerIdentifier) {
        return res.status(400).json({
          success: false,
          error: "Owner identifier is required",
        });
      }

      const ownerId = await resolveOwnerId(ownerIdentifier);
      if (!ownerId) {
        return res.status(404).json({
          success: false,
          error: "Propietario no encontrado",
        });
      }

      // Check if user is admin (either by Role_name or roleId)
      const isAdmin = req.user.Role_name === "ADMIN" || req.user.roleId === 1;

      // If user is not admin, verify they're accessing their own payments
      if (!isAdmin) {
        if (!req.user.Owner_id || req.user.Owner_id !== ownerId) {
          return res.status(403).json({
            success: false,
            error: "No tienes permiso para ver los pagos de este propietario",
          });
        }
      }

      const payments = await PaymentModel.findByOwner(ownerId);

      res.status(200).json({
        success: true,
        message: "Owner payments retrieved successfully",
        data: payments,
      });
    } catch (error) {
      console.error("Error finding owner payments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async getPaymentStats(req, res) {
    try {
      const stats = await PaymentModel.getPaymentStats();

      res.status(200).json({
        success: true,
        message: "Payment statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error getting payment stats:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async getPendingPayments(req, res) {
    try {
      const ownerIdentifier = req.params.owner_id;

      if (!ownerIdentifier) {
        return res.status(400).json({
          success: false,
          error: "Owner identifier is required",
        });
      }

      const ownerId = await resolveOwnerId(ownerIdentifier);
      if (!ownerId) {
        return res.status(404).json({
          success: false,
          error: "Propietario no encontrado",
        });
      }

      // If user is not admin, verify they're accessing their own payments
      if (req.user.Role_name !== "ADMIN") {
        if (!req.user.Owner_id || req.user.Owner_id !== ownerId) {
          return res.status(403).json({
            success: false,
            error:
              "No tienes permiso para ver los pagos pendientes de este propietario",
          });
        }
      }

      const pendingPayments = await PaymentModel.findPendingByOwner(ownerId);

      res.status(200).json({
        success: true,
        message: "Pending payments retrieved successfully",
        data: pendingPayments,
      });
    } catch (error) {
      console.error("Error getting pending payments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async pay(req, res) {
    try {
      let {
        amount,
        owner_id,
        currency = "COP",
        payment_method,
        customer_email,
        customer_data,
      } = req.body;

      // Validaciones básicas
      if (!amount || !payment_method) {
        return res.status(400).json({
          success: false,
          error: "Amount y payment method son requeridos",
        });
      }


      // VALIDAR QUE HAY TELÉFONO PARA NEQUI
      if (payment_method === "NEQUI" && !customer_data?.phone) {
        return res.status(400).json({
          success: false,
          error: "Teléfono requerido para pagos con Nequi",
        });
      }

      // Generar referencia única
      const reference = `PAY_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`.toUpperCase();

      // Obtener acceptance token
      const acceptanceToken = await WompiService.getAcceptanceToken();

      // FORMATEO DE TELÉFONO
      let phoneNumber = null;
      if (customer_data?.phone) {
        phoneNumber = customer_data.phone.replace(/\D/g, "");

        if (phoneNumber.startsWith("57") && phoneNumber.length > 10) {
          phoneNumber = phoneNumber.substring(2);
        }

        if (phoneNumber.length !== 10) {
          return res.status(400).json({
            success: false,
            error: `El teléfono debe tener 10 dígitos. Actual: ${phoneNumber.length} dígitos (${phoneNumber})`,
          });
        }
      }

      // Crear transacción en Wompi
      const wompiData = {
        amount_in_cents: Math.round(amount * 100),
        currency: currency,
        reference: reference,
        customer_email: customer_email,
        payment_method: {
          type: "NEQUI",
          installments: 1,
          phone_number: phoneNumber,
        },
        acceptance_token: acceptanceToken,
      };

      console.log("📦 Datos enviados a Wompi:", wompiData);

      const wompiTransaction = await WompiService.createTransaction(wompiData);

      // Mapear estado de Wompi
      const wompiStatus = wompiTransaction.data?.status || "PENDING";
      const statusMapping = {
        PENDING: 1, // Pendiente
        APPROVED: 2, // Completado/Aprobado
        DECLINED: 3, // Rechazado
        VOIDED: 4, // Anulado
        ERROR: 5, // Error
      };
      const paymentStatus = statusMapping[wompiStatus] || 1;

      // AJUSTE PRINCIPAL: Cambiar 'total' por 'amount' para coincidir con la tabla
      const paymentData = {
        user_id: owner_id,
        amount: amount,
        currency: currency,
        status: paymentStatus, // Este debe ser el ID del estado (1, 2, 3, etc.)
        payment_method: payment_method,
        reference: reference,
      };

      console.log("📋 Datos para PaymentModel.create():", paymentData);

      const payment = await PaymentModel.create(paymentData);

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        message: "Pago procesado exitosamente",
        data: {
          payment_id: payment.payment_id,
          reference: reference,
          amount: amount,
          currency: currency,
          status: paymentStatus,
          wompi_status: wompiStatus,
          wompi_transaction_id: wompiTransaction.data?.id,
          wompi_response: wompiTransaction.data,
        },
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async createPending(req, res) {
    try {
      const {
        owner_id,
        Payment_method = "NEQUI",
        amount,
        currency = "COP",
        Payment_reference_number = null,
      } = req.body;

      // Validaciones básicas
      if (!owner_id || !amount) {
        return res.status(400).json({
          success: false,
          error: "Owner_ID_FK y amount son requeridos",
        });
      }

      // Generar referencia única
      const reference = `PAY_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`.toUpperCase();

      // Crear el pago pendiente (status = 1)
      const paymentData = {
        user_id: owner_id, // ← Tu método espera user_id, no Owner_ID_FK
        amount: amount,
        currency: currency,
        status: 1, // Pendiente
        payment_method: Payment_method,
        reference: Payment_reference_number || reference,
      };

      console.log("📋 Datos para PaymentModel.create():", paymentData);

      const payment = await PaymentModel.create(paymentData);

      // Respuesta exitosa con TODOS los datos insertados
      res.status(201).json({
        success: true,
        message: "Pago pendiente creado exitosamente",
        data: {
          payment_id: payment.payment_id,
          Owner_ID_FK: payment.Owner_ID_FK,
          Payment_Status_ID_FK: payment.Payment_Status_ID_FK,
          Payment_method: payment.Payment_method,
          amount: payment.amount,
          currency: payment.currency,
          Payment_reference_number: payment.Payment_reference_number,
          Payment_date: payment.Payment_date,
        },
      });
    } catch (error) {
      console.error("Error creating pending payment:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al crear pago pendiente",
      });
    }
  }

  async preparePaymentForWompi(req, res) {
    try {
      const { payment_id, customer_email, customer_phone } = req.body;

      // Validaciones
      if (!payment_id || !customer_email || !customer_phone) {
        return res.status(400).json({
          success: false,
          error: "payment_id, customer_email y customer_phone son requeridos",
        });
      }

      // Buscar el pago pendiente
      const pendingPayment = await PaymentModel.findById(payment_id);

      if (!pendingPayment) {
        return res.status(404).json({
          success: false,
          error: "Pago pendiente no encontrado",
        });
      }

      // Validar que el pago esté pendiente
      if (pendingPayment.Payment_Status_ID_FK !== 1) {
        return res.status(400).json({
          success: false,
          error: "El pago no está en estado pendiente",
        });
      }

      // Formatear teléfono
      let phoneNumber = customer_phone.replace(/\D/g, "");

      if (phoneNumber.startsWith("57") && phoneNumber.length > 10) {
        phoneNumber = phoneNumber.substring(2);
      }

      if (phoneNumber.length !== 10) {
        return res.status(400).json({
          success: false,
          error: `El teléfono debe tener 10 dígitos. Actual: ${phoneNumber.length} dígitos`,
        });
      }

      // Obtener acceptance token de Wompi
      const acceptanceToken = await WompiService.getAcceptanceToken();

      // Crear transacción en Wompi
      const wompiData = {
        amount_in_cents: Math.round(pendingPayment.amount * 100),
        currency: pendingPayment.currency,
        reference: pendingPayment.Payment_reference_number,
        customer_email: customer_email,
        payment_method: {
          type: pendingPayment.Payment_method,
          installments: 1,
          phone_number: phoneNumber,
        },
        acceptance_token: acceptanceToken,
      };

      console.log("📦 Datos enviados a Wompi:", wompiData);

      // ENVIAR PAGO A WOMPI
      const wompiTransaction = await WompiService.createTransaction(wompiData);

      // Respuesta con el resultado del pago de Wompi
      res.status(200).json({
        success: true,
        message: "Pago enviado a Wompi exitosamente",
        data: {
          payment_id: pendingPayment.payment_id,
          reference: pendingPayment.Payment_reference_number,
          amount: pendingPayment.amount,
          currency: pendingPayment.currency,
          wompi_transaction: wompiTransaction.data, // Respuesta completa de Wompi
        },
      });
    } catch (error) {
      console.error("Error processing payment with Wompi:", error);

      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || "Error procesando el pago con Wompi",
      });
    }
  }

  async processWompiWebhook(webhookData) {
    try {
      const { event, data } = webhookData;

      if (event !== "transaction.updated") {
        return { success: false, message: "Event not supported" };
      }

      const transaction = data.transaction;
      const reference = transaction.reference;
      const wompiStatus = transaction.status;

      // Mapear estados de Wompi a tus estados internos
      const statusMap = {
        APPROVED: 2, // Completado/Aprobado
        DECLINED: 3, // Rechazado
        VOIDED: 4, // Anulado
        ERROR: 5, // Error
        PENDING: 1, // Pendiente
      };

      const payment_status_id = statusMap[wompiStatus];

      if (!payment_status_id) {
        throw new Error(`Unknown Wompi status: ${wompiStatus}`);
      }

      // Llamar al model para actualizar el pago
      const updated = await PaymentModel.updateByReference(reference, {
        Payment_Status_ID_FK: payment_status_id, // ✅ Usar el nombre correcto de la columna
      });

      return {
        success: true,
        updated,
        reference,
        wompiStatus,
        internalStatus: payment_status_id,
      };
    } catch (error) {
      console.error("Error processing Wompi webhook:", error);
      throw error;
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      const { reference } = req.params;

      // Usar tu método existente
      const payment = await PaymentModel.findByReference(reference);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        });
      }

      // Mapear estados numéricos a texto legible
      const statusMap = {
        1: "PENDING",
        2: "APPROVED",
        3: "DECLINED",
        4: "VOIDED",
        5: "ERROR",
      };

      res.json({
        success: true,
        data: {
          reference: payment.Payment_reference_number,
          status: payment.Payment_Status_ID_FK, // Tu estado numérico
          status_text: statusMap[payment.Payment_Status_ID_FK] || "UNKNOWN",
          amount: payment.Payment_total_payment,
          currency: payment.Payment_currency, // si tienes este campo
          created_at: payment.Payment_date,
        },
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  async downloadPaymentReport(req, res) {
    try {
      console.log("🔍 Iniciando generación de reporte...");

      // Obtener los pagos directamente (ya que retorna el array)
      const payments = await paymentController.getAllpayment();
      console.log("📋 Respuesta de getAllPayments:", payments);

      if (!payments || payments.length === 0) {
        console.log("📭 No hay pagos encontrados");
        return res.status(404).json({
          success: false,
          message: "No se encontraron pagos para el reporte",
        });
      }

      console.log(`✅ Encontrados ${payments.length} pagos`);

      const headers = [
        { key: "fecha", label: "Fecha de Pago" },
        { key: "metodo", label: "Método de Pago" },
        { key: "referencia", label: "Referencia" },
        { key: "moneda", label: "Moneda" },
        { key: "estado", label: "Estado" },
        { key: "propietario", label: "Propietario" },
      ];

      // Formatear datos directamente desde el array
      const formattedData = payments.map((payment) => ({
        fecha: new Date(payment.Payment_date).toLocaleDateString("es-CO"),
        metodo: payment.Payment_method,
        referencia: payment.Payment_reference_number,
        moneda: payment.currency,
        estado: payment.Payment_status_name,
        propietario: payment.owner_name,
      }));

      console.log("📊 Datos formateados:", formattedData);

      const buffer = await generateExcelReport(
        formattedData,
        headers,
        "reporte_pagos",
        false
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="reporte_pagos.xlsx"'
      );

      console.log(`✅ Reporte generado exitosamente: ${payments.length} pagos`);
      res.send(buffer);
    } catch (error) {
      console.error("❌ Error generando reporte:", error);
      res.status(500).json({
        success: false,
        message: "Error al generar el reporte",
        error: error.message,
      });
    }
  }
}

const paymentController = new PaymentController();
export default paymentController;
