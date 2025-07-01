import PaymentModel from "../models/payment.model.js";

class PaymentController {
  async register(req, res) {
    try {
      const {
        reference_number,
        amount,
        owner_id,
        status_id,
        payment_date,
        method
      } = req.body;

      if (!reference_number || !amount || !owner_id || !status_id || !method) {
        return res.status(400).json({
          error:
            "Reference number, amount, owner_id, status_id, and method are required",
        });
      }

      const paymentId = await PaymentModel.create({
        reference_number,
        amount,
        owner_id,
        status_id,
        payment_date: payment_date || new Date(),
        method
      });

      if (paymentId.error) {
        return res.status(400).json({ error: paymentId.error });
      }

      res.status(201).json({
        message: "Payment created successfully",
        id: paymentId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const payments = await PaymentModel.show();

      if (payments.error) {
        return res.status(500).json({ error: payments.error });
      }

      res.status(200).json({
        message: "Payments retrieved successfully",
        payments: payments,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const {
        reference_number,
        amount,
        owner_id,
        status_id,
        payment_date,
        method
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Payment ID is required" });
      }

      const updateResult = await PaymentModel.update(id, {
        reference_number,
        amount,
        owner_id,
        status_id,
        payment_date,
        method
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Payment updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ error: error.message });
    }
  }

  

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Payment ID is required" });
      }

      const payment = await PaymentModel.findById(id);

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      res.status(200).json({
        message: "Payment found successfully",
        payment: payment,
      });
    } catch (error) {
      console.error("Error finding payment by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByOwner(req, res) {
    try {
      const owner_id = req.params.owner_id;

      if (!owner_id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      const payments = await PaymentModel.findByOwner(owner_id);

      if (payments.error) {
        return res.status(500).json({ error: payments.error });
      }

      res.status(200).json({
        message: "Owner payments retrieved successfully",
        payments: payments,
      });
    } catch (error) {
      console.error("Error finding payments by owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await PaymentModel.getPaymentStats();

      if (stats.error) {
        return res.status(500).json({ error: stats.error });
      }

      res.status(200).json({
        message: "Payment statistics retrieved successfully",
        stats: stats,
      });
    } catch (error) {
      console.error("Error getting payment stats:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PaymentController();
