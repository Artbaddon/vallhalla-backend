import VisitorModel from "../models/visitor.model.js";

class VisitorController {
  async register(req, res) {
    try {
      const {
        host_id,
        visitor_name,
        document_number,
        phone,
        visit_date,
        visit_purpose,
        vehicle_plate,
      } = req.body;

      if (!host_id || !visitor_name || !document_number || !visit_date) {
        return res.status(400).json({
          error:
            "Host ID, visitor name, document number, and visit date are required",
        });
      }

      const visitorId = await VisitorModel.create({
        host_id,
        visitor_name,
        document_number,
        phone: phone || null,
        visit_date,
        visit_purpose: visit_purpose || null,
        vehicle_plate: vehicle_plate || null,
      });

      if (visitorId.error) {
        return res.status(400).json({ error: visitorId.error });
      }

      res.status(201).json({
        message: "Visitor registered successfully",
        id: visitorId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const visitors = await VisitorModel.show();

      if (visitors.error) {
        return res.status(500).json({ error: visitors.error });
      }

      res.status(200).json({
        message: "Visitors retrieved successfully",
        visitors: visitors,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const {
        host_id,
        visitor_name,
        document_number,
        phone,
        visit_date,
        visit_purpose,
        vehicle_plate,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Visitor ID is required" });
      }

      const updateResult = await VisitorModel.update(id, {
        host_id,
        visitor_name,
        document_number,
        phone,
        visit_date,
        visit_purpose,
        vehicle_plate,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Visitor updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating visitor:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Visitor ID is required" });
      }

      const deleteResult = await VisitorModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "Visitor deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting visitor:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Visitor ID is required" });
      }

      const visitor = await VisitorModel.findById(id);

      if (!visitor) {
        return res.status(404).json({ error: "Visitor not found" });
      }

      res.status(200).json({
        message: "Visitor found successfully",
        visitor: visitor,
      });
    } catch (error) {
      console.error("Error finding visitor by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByHost(req, res) {
    try {
      const host_id = req.params.host_id;

      if (!host_id) {
        return res.status(400).json({ error: "Host ID is required" });
      }

      const visitors = await VisitorModel.findByHost(host_id);

      if (visitors.error) {
        return res.status(500).json({ error: visitors.error });
      }

      res.status(200).json({
        message: "Host visitors retrieved successfully",
        visitors: visitors,
      });
    } catch (error) {
      console.error("Error finding visitors by host:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByDate(req, res) {
    try {
      const visit_date = req.params.visit_date;

      if (!visit_date) {
        return res.status(400).json({ error: "Visit date is required" });
      }

      const visitors = await VisitorModel.findByDate(visit_date);

      if (visitors.error) {
        return res.status(500).json({ error: visitors.error });
      }

      res.status(200).json({
        message: "Visitors by date retrieved successfully",
        visitors: visitors,
      });
    } catch (error) {
      console.error("Error finding visitors by date:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new VisitorController();
