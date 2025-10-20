import paymentController from "../controllers/payment.controller.js";

export async function getPaymentReportData() {
  // obtenemos los pagos desde tu controlador principal
  const payments = await paymentController.getAllpayment();

  // mapeamos solo los datos que te interesan
  return payments.map((p) => ({
    total_payment: p.Payment_total_payment,
    payment_date: p.Payment_date,
    payment_method: p.Payment_method,
    payment_reference: p.Payment_reference_number,
    owner_name: p.owner_name,
  }));
}