import PaymentModel from "../models/payment.model.js";

class PaymentController {
  // Constructor is not needed since we don't have any initialization
  constructor() {}

  async show(req, res) {
    try {
      const payments = await PaymentModel.show();

      res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: payments
      });
    } catch (error) {
      console.error("Error retrieving payments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async showById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required"
        });
      }

      const payment = await PaymentModel.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado"
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment found successfully",
        data: payment
      });
    } catch (error) {
      console.error("Error finding payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { status_id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required"
        });
      }

      if (!status_id) {
        return res.status(400).json({
          success: false,
          error: "Status ID is required"
        });
      }

      // Get existing payment first
      const existingPayment = await PaymentModel.findById(id);
      
      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado"
        });
      }

      // Only allow status updates
      const updated = await PaymentModel.update(id, {
        status_id
      });

      if (!updated) {
        return res.status(500).json({
          success: false,
          error: "Error al actualizar el estado del pago"
        });
      }

      // Get the updated payment to return in response
      const updatedPayment = await PaymentModel.findById(id);

      res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        data: updatedPayment
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      if (error.message === "Invalid payment status transition") {
        res.status(400).json({
          success: false,
          error: "Transición de estado de pago inválida"
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || "Error interno del servidor"
        });
      }
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Payment ID is required"
        });
      }

      const deleted = await PaymentModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado"
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async getOwnerPayments(req, res) {
    try {
      const owner_id = req.params.owner_id;

      // Debug logging
      console.log('User object:', req.user);
      console.log('Role name:', req.user.Role_name);
      console.log('Role ID:', req.user.roleId);
      console.log('Owner ID check:', {
        requestedOwnerId: owner_id,
        userOwnerId: req.user.Owner_id,
        isAdmin: req.user.roleId === 1 // Admin role ID is 1
      });

      if (!owner_id) {
        return res.status(400).json({
          success: false,
          error: "Owner ID is required"
        });
      }

      // Check if user is admin (either by Role_name or roleId)
      const isAdmin = req.user.Role_name === 'ADMIN' || req.user.roleId === 1;

      // If user is not admin, verify they're accessing their own payments
      if (!isAdmin) {
        // For non-admin users, check if they're the owner
        if (!req.user.Owner_id || req.user.Owner_id !== parseInt(owner_id)) {
          return res.status(403).json({
            success: false,
            error: "No tienes permiso para ver los pagos de este propietario"
          });
        }
      }

      const payments = await PaymentModel.findByOwner(owner_id);

      res.status(200).json({
        success: true,
        message: "Owner payments retrieved successfully",
        data: payments
      });
    } catch (error) {
      console.error("Error finding owner payments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async getPaymentStats(req, res) {
    try {
      const stats = await PaymentModel.getPaymentStats();

      res.status(200).json({
        success: true,
        message: "Payment statistics retrieved successfully",
        data: stats
      });
    } catch (error) {
      console.error("Error getting payment stats:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async getPendingPayments(req, res) {
    try {
      const owner_id = req.params.owner_id;

      if (!owner_id) {
        return res.status(400).json({
          success: false,
          error: "Owner ID is required"
        });
      }

      // If user is not admin, verify they're accessing their own payments
      if (req.user.Role_name !== 'ADMIN') {
        // For non-admin users, check if they're the owner
        if (!req.user.Owner_id || req.user.Owner_id !== parseInt(owner_id)) {
          return res.status(403).json({
            success: false,
            error: "No tienes permiso para ver los pagos pendientes de este propietario"
          });
        }
      }

      const pendingPayments = await PaymentModel.getOwnerPendingPayments(owner_id);

      res.status(200).json({
        success: true,
        message: "Pending payments retrieved successfully",
        data: pendingPayments
      });
    } catch (error) {
      console.error("Error getting pending payments:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async create(req, res) {
    try {
      const { amount, owner_id, payment_type, description } = req.body;

      // Validate required fields
      if (!amount || !owner_id || !payment_type || !description) {
        return res.status(400).json({
          success: false,
          error: "Amount, owner ID, payment type, and description are required"
        });
      }

      // Only admins can create payments
      const isAdmin = req.user.Role_name === 'ADMIN' || req.user.roleId === 1;
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Solo los administradores pueden crear pagos"
        });
      }

      const payment = await PaymentModel.create({
        amount,
        owner_id,
        payment_type,
        description
      });

      res.status(201).json({
        success: true,
        message: "Pago creado exitosamente",
        data: payment
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }

  async makePayment(req, res) {
    try {
      const { owner_id, payment_id } = req.params;
      const { method, payment_date } = req.body;

      // Debug logging
      console.log('Make payment request:', {
        requestedOwnerId: owner_id,
        paymentId: payment_id,
        userOwnerId: req.user.Owner_id,
        userRole: req.user.Role_name,
        roleId: req.user.roleId,
        method,
        payment_date
      });

      if (!payment_id || !method) {
        return res.status(400).json({
          success: false,
          error: "Payment ID and payment method are required"
        });
      }

      // Validate payment method
      const validMethods = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({
          success: false,
          error: `Método de pago inválido. Debe ser uno de: ${validMethods.join(', ')}`
        });
      }

      // Get the payment first
      const payment = await PaymentModel.findById(payment_id);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: "Pago no encontrado"
        });
      }

      // Check if user is admin or the owner of this specific payment
      const isAdmin = req.user.Role_name === 'ADMIN' || req.user.roleId === 1;
      const isPaymentOwner = req.user.Owner_id && req.user.Owner_id === payment.Owner_ID_FK;

      if (!isAdmin && !isPaymentOwner) {
        return res.status(403).json({
          success: false,
          error: "No tienes permiso para realizar este pago"
        });
      }

      // Process the payment
      const updatedPayment = await PaymentModel.processPayment(payment_id, {
        method,
        payment_date: payment_date || new Date()
      });

      res.status(200).json({
        success: true,
        message: "Pago realizado exitosamente",
        data: updatedPayment
      });
    } catch (error) {
      console.error("Error making payment:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  }
}

// Export a singleton instance
const paymentController = new PaymentController();
export default paymentController;
