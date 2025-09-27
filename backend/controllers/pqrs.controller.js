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

        // Validate required fields
        if (!owner_id || !category_id || !subject || !description) {
          // Clean up any uploaded files if validation fails
          if (req.files) {
            req.files.forEach(file => {
              fs.unlinkSync(file.path);
            });
          }
          return res.status(400).json({ 
            error: "Owner ID, category ID, subject, and description are required" 
          });
        }

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => file.filename).join(',') : null;

        const pqrsId = await PQRSModel.create({
          owner_id: parseInt(owner_id),
          category_id: parseInt(category_id),
          subject,
          description,
          priority: priority || 'MEDIUM',
          file: attachments
        });

        if (pqrsId.error) {
          // Clean up any uploaded files if creation fails
          if (req.files) {
            req.files.forEach(file => {
              fs.unlinkSync(file.path);
            });
          }
          return res.status(400).json({ error: pqrsId.error });
        }

        // Get the created PQRS with all its details
        const createdPQRS = await PQRSModel.findById(pqrsId);

        res.status(201).json({
          success: true,
          message: "PQRS created successfully",
          data: {
            id: pqrsId,
            pqrs: createdPQRS,
            attachments: req.files ? req.files.map(file => ({
              filename: file.filename,
              originalname: file.originalname,
              path: `/uploads/pqrs/${file.filename}`,
              size: file.size,
              mimetype: file.mimetype
            })) : []
          }
        });
      } catch (error) {
        // Clean up any uploaded files if an error occurs
        if (req.files) {
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
        }
        console.error("Error creating PQRS:", error);
        res.status(500).json({ 
          success: false,
          error: error.message || "Error creating PQRS" 
        });
      }
    });
  }

  async show(req, res) {
    try {
      const pqrsList = await PQRSModel.show();

      if (pqrsList.error) {
        return res.status(500).json({ 
          success: false,
          error: pqrsList.error 
        });
      }

      res.status(200).json({
        success: true,
        message: "PQRS list retrieved successfully",
        data: pqrsList
      });
    } catch (error) {
      console.error("Error retrieving PQRS list:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error retrieving PQRS list" 
      });
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
        priority
      } = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "PQRS ID is required" 
        });
      }

      const updateResult = await PQRSModel.update(id, {
        owner_id: owner_id ? parseInt(owner_id) : undefined,
        category_id: category_id ? parseInt(category_id) : undefined,
        subject,
        description,
        priority
      });

      if (updateResult.error) {
        return res.status(404).json({ 
          success: false,
          error: updateResult.error 
        });
      }

      // Get the updated PQRS with all its details
      const updatedPQRS = await PQRSModel.findById(id);

      res.status(200).json({
        success: true,
        message: "PQRS updated successfully",
        data: updatedPQRS
      });
    } catch (error) {
      console.error("Error updating PQRS:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error updating PQRS" 
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const id = req.params.id;
      const { status_id, admin_response } = req.body;

      if (!id || !status_id) {
        return res.status(400).json({ 
          success: false,
          error: "PQRS ID and status ID are required" 
        });
      }

      const updateResult = await PQRSModel.updateStatus(id, { 
        status_id: parseInt(status_id), 
        admin_response 
      });

      if (updateResult.error) {
        return res.status(404).json({ 
          success: false,
          error: updateResult.error 
        });
      }

      // Get the updated PQRS with all its details
      const updatedPQRS = await PQRSModel.findById(id);

      res.status(200).json({
        success: true,
        message: "PQRS status updated successfully",
        data: updatedPQRS
      });
    } catch (error) {
      console.error("Error updating PQRS status:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error updating PQRS status" 
      });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "PQRS ID is required" 
        });
      }

      // Get PQRS details before deletion to handle file cleanup
      const pqrs = await PQRSModel.findById(id);
      
      const deleteResult = await PQRSModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ 
          success: false,
          error: deleteResult.error 
        });
      }

      // Clean up attached files if they exist
      if (pqrs && pqrs.PQRS_file) {
        const files = pqrs.PQRS_file.split(',');
        files.forEach(filename => {
          const filePath = path.join('uploads/pqrs/', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      res.status(200).json({
        success: true,
        message: "PQRS deleted successfully",
        data: { id }
      });
    } catch (error) {
      console.error("Error deleting PQRS:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error deleting PQRS" 
      });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "PQRS ID is required" 
        });
      }

      const pqrs = await PQRSModel.findById(id);

      if (!pqrs) {
        return res.status(404).json({ 
          success: false,
          error: "PQRS not found" 
        });
      }

      // Transform file attachments into full URLs if they exist
      let attachments = [];
      if (pqrs.PQRS_file) {
        attachments = pqrs.PQRS_file.split(',').map(filename => ({
          filename,
          url: `/uploads/pqrs/${filename}`
        }));
      }

      res.status(200).json({
        success: true,
        message: "PQRS found successfully",
        data: {
          ...pqrs,
          attachments
        }
      });
    } catch (error) {
      console.error("Error finding PQRS by ID:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error finding PQRS" 
      });
    }
  }

  async findByOwner(req, res) {
    try {
      const owner_id = req.params.owner_id;

      if (!owner_id) {
        return res.status(400).json({ 
          success: false,
          error: "Owner ID is required" 
        });
      }

      const pqrsList = await PQRSModel.findByOwner(owner_id);

      if (pqrsList.error) {
        return res.status(500).json({ 
          success: false,
          error: pqrsList.error 
        });
      }

      // Transform file attachments into full URLs for each PQRS
      const pqrsWithAttachments = pqrsList.map(pqrs => {
        let attachments = [];
        if (pqrs.PQRS_file) {
          attachments = pqrs.PQRS_file.split(',').map(filename => ({
            filename,
            url: `/uploads/pqrs/${filename}`
          }));
        }
        return {
          ...pqrs,
          attachments
        };
      });

      res.status(200).json({
        success: true,
        message: "Owner PQRS retrieved successfully",
        data: pqrsWithAttachments
      });
    } catch (error) {
      console.error("Error finding PQRS by owner:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error finding owner PQRS" 
      });
    }
  }

  async findByStatus(req, res) {
    try {
      const status_id = req.params.status_id;

      if (!status_id) {
        return res.status(400).json({ 
          success: false,
          error: "Status ID is required" 
        });
      }

      const pqrsList = await PQRSModel.findByStatus(status_id);

      if (pqrsList.error) {
        return res.status(500).json({ 
          success: false,
          error: pqrsList.error 
        });
      }

      // Transform file attachments into full URLs for each PQRS
      const pqrsWithAttachments = pqrsList.map(pqrs => {
        let attachments = [];
        if (pqrs.PQRS_file) {
          attachments = pqrs.PQRS_file.split(',').map(filename => ({
            filename,
            url: `/uploads/pqrs/${filename}`
          }));
        }
        return {
          ...pqrs,
          attachments
        };
      });

      res.status(200).json({
        success: true,
        message: "PQRS by status retrieved successfully",
        data: pqrsWithAttachments
      });
    } catch (error) {
      console.error("Error finding PQRS by status:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error finding PQRS by status" 
      });
    }
  }

  async findByCategory(req, res) {
    try {
      const category_id = req.params.category_id;

      if (!category_id) {
        return res.status(400).json({ 
          success: false,
          error: "Category ID is required" 
        });
      }

      const pqrsList = await PQRSModel.findByCategory(category_id);

      if (pqrsList.error) {
        return res.status(500).json({ 
          success: false,
          error: pqrsList.error 
        });
      }

      // Transform file attachments into full URLs for each PQRS
      const pqrsWithAttachments = pqrsList.map(pqrs => {
        let attachments = [];
        if (pqrs.PQRS_file) {
          attachments = pqrs.PQRS_file.split(',').map(filename => ({
            filename,
            url: `/uploads/pqrs/${filename}`
          }));
        }
        return {
          ...pqrs,
          attachments
        };
      });

      res.status(200).json({
        success: true,
        message: "PQRS by category retrieved successfully",
        data: pqrsWithAttachments
      });
    } catch (error) {
      console.error("Error finding PQRS by category:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error finding PQRS by category" 
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await PQRSModel.getPQRSStats();

      if (stats.error) {
        return res.status(500).json({ 
          success: false,
          error: stats.error 
        });
      }

      res.status(200).json({
        success: true,
        message: "PQRS statistics retrieved successfully",
        data: stats
      });
    } catch (error) {
      console.error("Error getting PQRS stats:", error);
      res.status(500).json({ 
        success: false,
        error: error.message || "Error retrieving PQRS statistics" 
      });
    }
  }
}

export default new PQRSController();