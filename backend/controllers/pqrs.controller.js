import PQRSModel from "../models/pqrs.model.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create PQRS upload function
const createPQRSUpload = () => {
  const uploadDir = 'uploads/pqrs/';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `pqrs-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDFs, and text files allowed!'), false);
      }
    }
  }).array('attachments', 5); // Max 5 files
};

class PQRSController {
  async register(req, res) {
    const pqrsUpload = createPQRSUpload();
    
    pqrsUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      try {
        const { 
          owner_id, 
          category_id, 
          subject, 
          description, 
          priority 
        } = req.body;

        if (!owner_id || !category_id || !subject || !description) {
          return res.status(400).json({ 
            error: "Owner ID, category ID, subject, and description are required" 
          });
        }

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: `/uploads/pqrs/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        })) : [];

        const pqrsId = await PQRSModel.create({
          owner_id,
          category_id,
          subject,
          description,
          priority: priority || 'MEDIUM',
          attachments
        });

        if (pqrsId.error) {
          return res.status(400).json({ error: pqrsId.error });
        }

        res.status(201).json({
          message: "PQRS created successfully",
          id: pqrsId,
          attachments: attachments
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async show(req, res) {
    try {
      const pqrsList = await PQRSModel.show();

      if (pqrsList.error) {
        return res.status(500).json({ error: pqrsList.error });
      }

      res.status(200).json({
        message: "PQRS list retrieved successfully",
        pqrs: pqrsList,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { 
        owner_id, 
        category_id, 
        subject, 
        description, 
        priority, 
        status_id,
        attachments 
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "PQRS ID is required" });
      }

      const updateResult = await PQRSModel.update(id, {
        owner_id,
        category_id,
        subject,
        description,
        priority,
        status_id,
        attachments
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "PQRS updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating PQRS:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const id = req.params.id;
      const { status_id, admin_response } = req.body;

      if (!id || !status_id) {
        return res.status(400).json({ error: "PQRS ID and status ID are required" });
      }

      const updateResult = await PQRSModel.updateStatus(id, status_id, admin_response);

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "PQRS status updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating PQRS status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "PQRS ID is required" });
      }

      const deleteResult = await PQRSModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "PQRS deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting PQRS:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "PQRS ID is required" });
      }

      const pqrs = await PQRSModel.findById(id);

      if (!pqrs) {
        return res.status(404).json({ error: "PQRS not found" });
      }

      res.status(200).json({
        message: "PQRS found successfully",
        pqrs: pqrs,
      });
    } catch (error) {
      console.error("Error finding PQRS by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByOwner(req, res) {
    try {
      const owner_id = req.params.owner_id;

      if (!owner_id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      const pqrsList = await PQRSModel.findByOwner(owner_id);

      if (pqrsList.error) {
        return res.status(500).json({ error: pqrsList.error });
      }

      res.status(200).json({
        message: "Owner PQRS retrieved successfully",
        pqrs: pqrsList,
      });
    } catch (error) {
      console.error("Error finding PQRS by owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByStatus(req, res) {
    try {
      const status_id = req.params.status_id;

      if (!status_id) {
        return res.status(400).json({ error: "Status ID is required" });
      }

      const pqrsList = await PQRSModel.findByStatus(status_id);

      if (pqrsList.error) {
        return res.status(500).json({ error: pqrsList.error });
      }

      res.status(200).json({
        message: "PQRS by status retrieved successfully",
        pqrs: pqrsList,
      });
    } catch (error) {
      console.error("Error finding PQRS by status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByCategory(req, res) {
    try {
      const category_id = req.params.category_id;

      if (!category_id) {
        return res.status(400).json({ error: "Category ID is required" });
      }

      const pqrsList = await PQRSModel.findByCategory(category_id);

      if (pqrsList.error) {
        return res.status(500).json({ error: pqrsList.error });
      }

      res.status(200).json({
        message: "PQRS by category retrieved successfully",
        pqrs: pqrsList,
      });
    } catch (error) {
      console.error("Error finding PQRS by category:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await PQRSModel.getPQRSStats();

      if (stats.error) {
        return res.status(500).json({ error: stats.error });
      }

      res.status(200).json({
        message: "PQRS statistics retrieved successfully",
        stats: stats,
      });
    } catch (error) {
      console.error("Error getting PQRS stats:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async search(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ error: "Search term is required" });
      }

      const pqrsList = await PQRSModel.searchPQRS(q);

      if (pqrsList.error) {
        return res.status(500).json({ error: pqrsList.error });
      }

      res.status(200).json({
        message: "PQRS search completed successfully",
        pqrs: pqrsList,
        searchTerm: q
      });
    } catch (error) {
      console.error("Error searching PQRS:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PQRSController();