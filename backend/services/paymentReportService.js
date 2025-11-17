import paymentController from "../controllers/payment.controller.js";

export async function getPaymentReportData() {
  try {
    // Obtenemos los pagos
    const payments = await paymentController.getAllpayment();

    if (!payments.success || !payments.data) {
      return [];
    }

    // Mapeamos SOLO los datos que necesitas
    return payments.data.map((payment) => ({
      payment_date: payment.Payment_date,
      payment_method: payment.Payment_method,
      payment_reference: payment.Payment_reference_number,
      currency: payment.currency,
      status_name: payment.Payment_status_name,
      owner_name: payment.owner_name,
    }));
  } catch (error) {
    console.error("Error en getPaymentReportData:", error);
    return [];
  }
}