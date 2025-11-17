import express from 'express';
import PaymentController from '../controllers/payment.controller.js';

const router = express.Router();


// Webhook específico para Wompi
router.post('/wompi-events', async (req, res) => {
  try {
    console.log('🔔 Webhook recibido de Wompi:', req.body);
    
    const webhookData = req.body;
    
    // Procesar diferentes eventos de Wompi
    switch (webhookData.event) {
      case 'transaction.updated':
        await PaymentController.processWompiWebhook(webhookData);
        break;
      case 'charge.updated':
        await handleChargeUpdate(webhookData.data);
        break;
      default:
        console.log('Evento no manejado:', webhookData.event);
    }
    
    // Siempre responder 200 OK a Wompi
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(200).json({ received: true });
  }
});

export default router;