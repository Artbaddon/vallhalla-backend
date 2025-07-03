import VisitorModel from "../models/visitor.model.js";
import OwnerModel from "../models/owner.model.js";

class VisitorController {
  async register(req, res) {
    try {
      const { host_id, visitor_name, document_number } = req.body;

      //check if host exists
      const host = await OwnerModel.findById(host_id);
      if (!host) {
        return res.status(404).json({ error: "Host not found" });
      }

      if (!host_id || !visitor_name || !document_number) {
        return res.status(400).json({
          error: "Host ID, visitor name, and document number are required"
        });
      }

      const visitorId = await VisitorModel.create({
        host_id,
        visitor_name,
        document_number
      });

      if (visitorId.error) {
        return res.status(400).json({ error: visitorId.error });
      }

      res.status(201).json({
        message: "Visitor registered successfully",
        id: visitorId
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
        visitors: visitors
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { visitor_name, document_number } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Visitor ID is required" });
      }

      if (!visitor_name || !document_number) {
        return res.status(400).json({
          error: "Visitor name and document number are required"
        });
      }

      const updateResult = await VisitorModel.update(id, {
        visitor_name,
        document_number
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Visitor updated successfully",
        id: id
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
        id: id
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

      if (visitor.error) {
        return res.status(500).json({ error: visitor.error });
      }

      res.status(200).json({
        message: "Visitor found successfully",
        visitor: visitor
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
        visitors: visitors
      });
    } catch (error) {
      console.error("Error finding visitors by host:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByDate(req, res) {
    try {
      const enter_date = req.params.enter_date;

      if (!enter_date) {
        return res.status(400).json({ error: "Enter date is required" });
      }

      // Validate and format the date
      let formattedDate;
      try {
        const date = new Date(enter_date);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ 
            error: "Invalid date format. Please use YYYY-MM-DD format" 
          });
        }
        // Format date as YYYY-MM-DD
        formattedDate = date.toISOString().split('T')[0];
      } catch (error) {
        return res.status(400).json({ 
          error: "Invalid date format. Please use YYYY-MM-DD format" 
        });
      }

      const visitors = await VisitorModel.findByDate(formattedDate);

      if (visitors.error) {
        return res.status(500).json({ error: visitors.error });
      }

      // Don't return 404 if no visitors found, just return an empty array
      res.status(200).json({
        message: visitors.length > 0 
          ? "Visitors by date retrieved successfully" 
          : "No visitors found for this date",
        visitors: visitors
      });
    } catch (error) {
      console.error("Error finding visitors by date:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new VisitorController();
