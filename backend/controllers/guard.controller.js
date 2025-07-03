import GuardModel from "../models/guard.model.js";

class GuardController {
  static async create(req, res) {
    try {
      const {
        username,
        password,
        arl,
        eps,
        shift,
        fullName,
        documentType,
        documentNumber,
        telephoneNumber,
        photo
      } = req.body;

      // Validate required fields
      const requiredFields = {
        username: 'Username',
        password: 'Password',
        arl: 'ARL',
        eps: 'EPS',
        shift: 'Shift',
        fullName: 'Full Name',
        documentType: 'Document Type',
        documentNumber: 'Document Number'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !req.body[field])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters long"
        });
      }

      // Validate shift value
      const validShifts = ['Morning', 'Afternoon', 'Night', 'Evening'];
      if (!validShifts.includes(shift)) {
        return res.status(400).json({
          error: `Invalid shift value. Must be one of: ${validShifts.join(', ')}`
        });
      }

      // Validate document type
      const validDocTypes = ['CC', 'CE', 'PP', 'TI'];
      if (!validDocTypes.includes(documentType)) {
        return res.status(400).json({
          error: `Invalid document type. Must be one of: ${validDocTypes.join(', ')}`
        });
      }

      // Validate phone number format (assuming Colombian format)
      const phoneRegex = /^3\d{9}$/;
      if (telephoneNumber && !phoneRegex.test(telephoneNumber)) {
        return res.status(400).json({
          error: "Invalid phone number format. Must be a Colombian mobile number starting with 3"
        });
      }

      const result = await GuardModel.create({
        username,
        password,
        arl,
        eps,
        shift,
        fullName,
        documentType,
        documentNumber,
        telephoneNumber,
        photo
      });

      if (result.error) {
        // Check for duplicate username
        if (result.error.includes('Users_name')) {
          return res.status(409).json({
            error: "Username already exists"
          });
        }
        // Check for duplicate document number
        if (result.error.includes('Profile_document_number')) {
          return res.status(409).json({
            error: "Document number already registered"
          });
        }
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json({
        message: "Guard created successfully",
        data: {
          guardId: result.guardId,
          username,
          fullName,
          documentNumber,
          shift
        }
      });
    } catch (error) {
      console.error('Error creating guard:', error);
      return res.status(500).json({ 
        error: "Internal server error while creating guard" 
      });
    }
  }

  static async show(req, res) {
    try {
      const result = await GuardModel.show();
      
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Transform the data to remove sensitive information
      const transformedData = result.map(guard => ({
        id: guard.Guard_id,
        fullName: guard.Profile_fullName,
        username: guard.Users_name,
        documentNumber: guard.Profile_document_number,
        shift: guard.Guard_shift,
        status: guard.User_status_name,
        arl: guard.Guard_arl,
        eps: guard.Guard_eps,
        createdAt: guard.Guard_createdAt,
        telephoneNumber: guard.Profile_telephone_number,
        photo: guard.Profile_photo
      }));

      return res.status(200).json({
        message: "Guards retrieved successfully",
        count: transformedData.length,
        data: transformedData
      });
    } catch (error) {
      console.error('Error fetching guards:', error);
      return res.status(500).json({ 
        error: "Internal server error while fetching guards" 
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        arl,
        eps,
        shift,
        fullName,
        documentType,
        documentNumber,
        telephoneNumber,
        photo,
        userStatus
      } = req.body;

      // Validate that at least one field is provided
      if (!Object.keys(req.body).length) {
        return res.status(400).json({
          error: "At least one field must be provided for update"
        });
      }

      // Validate shift if provided
      if (shift) {
        const validShifts = ['Morning', 'Afternoon', 'Night', 'Evening'];
        if (!validShifts.includes(shift)) {
          return res.status(400).json({
            error: `Invalid shift value. Must be one of: ${validShifts.join(', ')}`
          });
        }
      }

      // Validate document type if provided
      if (documentType) {
        const validDocTypes = ['CC', 'CE', 'PP', 'TI'];
        if (!validDocTypes.includes(documentType)) {
          return res.status(400).json({
            error: `Invalid document type. Must be one of: ${validDocTypes.join(', ')}`
          });
        }
      }

      // Validate phone number if provided
      if (telephoneNumber) {
        const phoneRegex = /^3\d{9}$/;
        if (!phoneRegex.test(telephoneNumber)) {
          return res.status(400).json({
            error: "Invalid phone number format. Must be a Colombian mobile number starting with 3"
          });
        }
      }

      // Validate user status if provided
      if (userStatus) {
        const validStatuses = [1, 2, 3, 4]; // Active, Inactive, Pending, Blocked
        if (!validStatuses.includes(Number(userStatus))) {
          return res.status(400).json({
            error: "Invalid user status"
          });
        }
      }

      const result = await GuardModel.update(id, {
        arl,
        eps,
        shift,
        fullName,
        documentType,
        documentNumber,
        telephoneNumber,
        photo,
        userStatus
      });

      if (result.error) {
        if (result.error === "Guard not found") {
          return res.status(404).json({ error: result.error });
        }
        // Check for duplicate document number
        if (result.error.includes('Profile_document_number')) {
          return res.status(409).json({
            error: "Document number already registered"
          });
        }
        return res.status(400).json({ error: result.error });
      }

      return res.status(200).json({
        message: "Guard updated successfully",
        data: { id, ...req.body }
      });
    } catch (error) {
      console.error('Error updating guard:', error);
      return res.status(500).json({ 
        error: "Internal server error while updating guard" 
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "Guard ID is required"
        });
      }

      const result = await GuardModel.delete(id);

      if (result.error) {
        if (result.error === "Guard not found") {
          return res.status(404).json({ error: result.error });
        }
        return res.status(400).json({ error: result.error });
      }

      return res.status(200).json({
        message: "Guard deleted successfully",
        data: { id }
      });
    } catch (error) {
      console.error('Error deleting guard:', error);
      return res.status(500).json({ 
        error: "Internal server error while deleting guard" 
      });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "Guard ID is required"
        });
      }

      const result = await GuardModel.findById(id);

      if (!result) {
        return res.status(404).json({ error: "Guard not found" });
      }

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Transform the data to remove sensitive information
      const transformedData = {
        id: result.Guard_id,
        fullName: result.Profile_fullName,
        username: result.Users_name,
        documentNumber: result.Profile_document_number,
        documentType: result.Profile_document_type,
        shift: result.Guard_shift,
        status: result.User_status_name,
        arl: result.Guard_arl,
        eps: result.Guard_eps,
        createdAt: result.Guard_createdAt,
        telephoneNumber: result.Profile_telephone_number,
        photo: result.Profile_photo
      };

      return res.status(200).json({
        message: "Guard found successfully",
        data: transformedData
      });
    } catch (error) {
      console.error('Error finding guard:', error);
      return res.status(500).json({ 
        error: "Internal server error while finding guard" 
      });
    }
  }

  static async findByShift(req, res) {
    try {
      const { shift } = req.params;

      if (!shift) {
        return res.status(400).json({
          error: "Shift parameter is required"
        });
      }

      const validShifts = ['Morning', 'Afternoon', 'Night', 'Evening'];
      if (!validShifts.includes(shift)) {
        return res.status(400).json({
          error: `Invalid shift value. Must be one of: ${validShifts.join(', ')}`
        });
      }

      const result = await GuardModel.findByShift(shift);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Transform the data to remove sensitive information
      const transformedData = result.map(guard => ({
        id: guard.Guard_id,
        fullName: guard.Profile_fullName,
        username: guard.Users_name,
        documentNumber: guard.Profile_document_number,
        shift: guard.Guard_shift,
        status: guard.User_status_name,
        arl: guard.Guard_arl,
        eps: guard.Guard_eps,
        createdAt: guard.Guard_createdAt,
        telephoneNumber: guard.Profile_telephone_number,
        photo: guard.Profile_photo
      }));

      return res.status(200).json({
        message: "Guards found successfully",
        count: transformedData.length,
        data: transformedData
      });
    } catch (error) {
      console.error('Error finding guards by shift:', error);
      return res.status(500).json({ 
        error: "Internal server error while finding guards by shift" 
      });
    }
  }

  static async findByDocument(req, res) {
    try {
      const { documentNumber } = req.params;

      if (!documentNumber) {
        return res.status(400).json({
          error: "Document number is required"
        });
      }

      const result = await GuardModel.findByDocument(documentNumber);

      if (!result) {
        return res.status(404).json({ error: "Guard not found" });
      }

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Transform the data to remove sensitive information
      const transformedData = {
        id: result.Guard_id,
        fullName: result.Profile_fullName,
        username: result.Users_name,
        documentNumber: result.Profile_document_number,
        documentType: result.Profile_document_type,
        shift: result.Guard_shift,
        status: result.User_status_name,
        arl: result.Guard_arl,
        eps: result.Guard_eps,
        createdAt: result.Guard_createdAt,
        telephoneNumber: result.Profile_telephone_number,
        photo: result.Profile_photo
      };

      return res.status(200).json({
        message: "Guard found successfully",
        data: transformedData
      });
    } catch (error) {
      console.error('Error finding guard by document:', error);
      return res.status(500).json({ 
        error: "Internal server error while finding guard by document" 
      });
    }
  }
}

export default GuardController;