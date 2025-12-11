import PackageDelivery from "../models/packages.model.js";
import UserModel from "../models/user.model.js"; // MySQL
import OwnerModel from "../models/owner.model.js"; // MySQL
import mongoose from "mongoose";
import transporter from "../utils/email.js";
import packageTemplate from "../utils/templates/packageTemplate.js";

class PackageDeliveryController {
  // Helper: determine if a string looks like our business ID (e.g., PKG-...)
  isBusinessPackageId(id) {
    return typeof id === "string" && /^PKG-/i.test(id);
  }

  // Helper: fetch a package by either Mongo ObjectId or business package_id
  async findPackageByFlexibleId(id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await PackageDelivery.findById(id);
    }
    if (this.isBusinessPackageId(id)) {
      return await PackageDelivery.findOne({ package_id: id });
    }
    return null;
  }

  // Helper to get owner from MySQL (optimized)
  async getOwnerFromMySQL(ownerId) {
    try {
      const owner = await OwnerModel.findById(ownerId, {
        attributes: [
          "Owner_id",
          "Apartment_number",
          "Tower_name",
          "User_FK_ID",
        ], // Solo los datos que necesitas
      });
      return owner;
    } catch (error) {
      console.error("Error fetching owner from MySQL:", error);
      return null;
    }
  }

  // Helper to get user from MySQL (optimized)
  async getUserFromMySQL(userId) {
    try {
      const user = await UserModel.findById(userId, {
        attributes: ["Users_id", "Users_name", "Users_email"], // Incluye el username (Users_name)
      });
      return user;
    } catch (error) {
      console.error("Error fetching user from MySQL:", error);
      return null;
    }
  }

  // Helper to check if logged user can access owner's packages
  async canAccessOwnerPackages(req, ownerId) {
    const { isGuard, isOwner, isAdmin } = req.userAccess;

    if (isGuard || isAdmin) {
      return true; // Guards can access all packages
    }

    if (isOwner) {
      // Check if the logged user is linked to this owner
      const userOwner = await OwnerModel.findByUserId(req.user.userId);
      return userOwner && userOwner.Owners_id === parseInt(ownerId);
    }

    return false;
  }

  async registerPackage(req, res) {
    try {
      const {
        recipient_owner_id,
        package_type = "package",
        sender_name,
        description,
        carrier,
        urgent = false,
      } = req.body;

      // Validar campo obligatorio
      if (!recipient_owner_id) {
        return res.status(400).json({
          error: "recipient_owner_id es requerido",
        });
      }

      // Obtener owner
      const owner = await OwnerModel.findById(recipient_owner_id);
      if (!owner) {
        return res.status(400).json({
          error: `Owner con ID ${recipient_owner_id} no encontrado`,
        });
      }

      // Obtener user
      const user = await UserModel.findById(owner.User_FK_ID);
      if (!user) {
        return res.status(400).json({
          error: "Usuario asociado no encontrado",
        });
      }

      // Validar guardia
      if (!req.user?.userId) {
        return res.status(401).json({
          error: "No autorizado. Se requiere autenticación de guardia",
        });
      }

      // Generar ID único
      const packageId = `PKG-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;

      // Preparar datos para MongoDB
      const packageData = {
        package_id: packageId,
        package_type: package_type,
        recipient_owner_id: Number(recipient_owner_id),
        recipient_apartment: String(owner.Apartment_number || "").trim(),
        recipient_tower: String(owner.Tower_name || "").trim(),
        received_by_guard: {
          guard_id: Number(req.user.userId),
          received_at: new Date(),
        },
        photos: [],
        delivered_to_owner: null,
        urgent: Boolean(urgent),
      };

      // Agregar campos opcionales
      if (sender_name) packageData.sender_name = sender_name.trim();
      if (description) packageData.description = description.trim();
      if (carrier) packageData.carrier = carrier.trim();

      // Guardar en MongoDB
      const newPackage = new PackageDelivery(packageData);
      await newPackage.save();

      // Enviar notificación por correo
      if (user.Users_email) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.Users_email,
            subject: `📦 Nuevo paquete recibido - ${packageId}`,
            html: packageTemplate({
              ownerName: user.Users_name,
              packageId: packageId,
              packageType: package_type,
              sender: sender_name || "No especificado",
              description: description || "Sin descripción",
              apartment: owner.Apartment_number,
              tower: owner.Tower_name,
              receivedAt: new Date().toLocaleString(),
              guardName: req.user.username || "Guardia de seguridad",
            }),
          };

          await transporter.sendMail(mailOptions);
        } catch (emailError) {
          // No fallar si el email no se envía, solo loguear
          console.warn("⚠️ No se pudo enviar el correo:", emailError.message);
        }
      }

      // Responder con éxito
      return res.status(201).json({
        success: true,
        message: "Paquete registrado exitosamente",
        data: {
          package_id: packageId,
          recipient: {
            owner_id: owner.Owner_id,
            owner_name: user.Users_name,
            apartment: owner.Apartment_number,
            tower: owner.Tower_name,
            email: user.Users_email,
          },
          sender: sender_name || "No especificado",
          description: description || "Sin descripción",
          carrier: carrier || "No especificado",
          status: "recibido",
          urgent: Boolean(urgent),
          received_by: {
            guard_id: req.user.userId,
            received_at: new Date().toISOString(),
          },
          notification_sent: !!user.Users_email,
        },
      });
    } catch (error) {
      console.error("Error registrando paquete:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Error de validación",
          details: error.message,
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          error: "ID de paquete duplicado",
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  }

  // READ - Get packages with user filtering
  async getPackages(req, res) {
    try {
      const {
        status,
        package_type,
        page = 1,
        limit = 10,
        start_date,
        end_date,
      } = req.query;

      // Build MongoDB filter
      const filter = {};

      // User-specific filtering
      if (!req.userAccess.canSeeAll) {
        // For owners, only show their packages
        const userOwner = await OwnerModel.findByUserId(req.user.userId);
        if (!userOwner) {
          return res.status(403).json({
            error: "Owner profile not found for this user",
          });
        }
        filter.recipient_owner_id = userOwner.Owners_id;
      }

      if (status) filter.delivery_status = status;
      if (package_type) filter.package_type = package_type;

      if (start_date || end_date) {
        filter["received_by_guard.received_at"] = {};
        if (start_date)
          filter["received_by_guard.received_at"].$gte = new Date(start_date);
        if (end_date)
          filter["received_by_guard.received_at"].$lte = new Date(end_date);
      }

      // Query MongoDB
      const packages = await PackageDelivery.find(filter)
        .sort({ "received_by_guard.received_at": -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Enrich with MySQL data - OBTENER USERNAME DEL USER
      const enrichedPackages = await Promise.all(
        packages.map(async (pkg) => {
          try {
            // Obtener owner desde MySQL
            const ownerInfo = await this.getOwnerFromMySQL(
              pkg.recipient_owner_id
            );

            // Obtener USER (no guard) para el username del owner
            let ownerUserInfo = null;
            if (ownerInfo && ownerInfo.User_FK_ID) {
              ownerUserInfo = await this.getUserFromMySQL(ownerInfo.User_FK_ID);
            }

            // Obtener guard info
            const guardInfo = await this.getUserFromMySQL(
              pkg.received_by_guard.guard_id
            );

            return {
              ...pkg.toObject(),
              owner_info: ownerInfo
                ? {
                    name: ownerUserInfo
                      ? ownerUserInfo.Users_name
                      : "No disponible",
                    email: ownerUserInfo
                      ? ownerUserInfo.Users_email
                      : "No disponible",
                    apartment: ownerInfo.Apartment_number,
                    tower: ownerInfo.Tower_name,
                    // Otros campos que quieras
                  }
                : null,
              guard_info: guardInfo
                ? {
                    name: guardInfo.Users_name,
                    email: guardInfo.Users_email,
                  }
                : null,
            };
          } catch (error) {
            console.error("Error enriching package:", error);
            return {
              ...pkg.toObject(),
              owner_info: null,
              guard_info: null,
            };
          }
        })
      );

      const total = await PackageDelivery.countDocuments(filter);

      res.status(200).json({
        data: enrichedPackages,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get packages error:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  }

  // READ - Get package by ID with access control
  async getPackageById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID format
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const isBizId = this.isBusinessPackageId(id);
      if (!isObjectId && !isBizId) {
        return res.status(400).json({
          error: "Invalid package identifier",
        });
      }

      const packageItem = await this.findPackageByFlexibleId(id);

      if (!packageItem) {
        return res.status(404).json({ error: "Package not found" });
      }

      // Check access permissions
      const hasAccess = await this.canAccessOwnerPackages(
        req,
        packageItem.recipient_owner_id
      );
      if (!hasAccess) {
        return res.status(403).json({
          error: "Access denied. You can only view your own packages.",
        });
      }

      // Enrich with owner and guard info - OBTENER USERNAME DEL USER
      let ownerUserInfo = null;
      let ownerInfo = null;

      // Obtener owner desde MySQL
      ownerInfo = await this.getOwnerFromMySQL(packageItem.recipient_owner_id);

      // Obtener USER para el username del owner
      if (ownerInfo && ownerInfo.User_FK_ID) {
        ownerUserInfo = await this.getUserFromMySQL(ownerInfo.User_FK_ID);
      }

      // Obtener guard info
      const guardInfo = await this.getUserFromMySQL(
        packageItem.received_by_guard.guard_id
      );

      const enrichedPackage = {
        ...packageItem.toObject(),
        owner_info: ownerInfo
          ? {
              id: ownerInfo.Owner_id,
              name: ownerUserInfo ? ownerUserInfo.Users_name : "No disponible",
              email: ownerUserInfo
                ? ownerUserInfo.Users_email
                : "No disponible",
              apartment: ownerInfo.Apartment_number,
              tower: ownerInfo.Tower_name,
              phone: ownerInfo.Owners_phone || "No disponible",
            }
          : null,
        guard_info: guardInfo
          ? {
              id: guardInfo.Users_id,
              name: guardInfo.Users_name,
              email: guardInfo.Users_email,
            }
          : null,
      };

      res.status(200).json({ data: enrichedPackage });
    } catch (error) {
      console.error("Get package by ID error:", error);
      res.status(500).json({ error: "Failed to fetch package" });
    }
  }

  // UPDATE - Update package status
  async updatePackageStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, delivery_notes, recipient_signature } = req.body;

      // Validate ID format or support business code lookup
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const isBizId = this.isBusinessPackageId(id);
      if (!isObjectId && !isBizId) {
        return res.status(400).json({
          error:
            "Invalid package identifier. Provide a valid Mongo ObjectId or business package_id (e.g., PKG-...)",
        });
      }

      // Get package from MongoDB (first fetch to check access)
      const packageItem = await this.findPackageByFlexibleId(id);
      if (!packageItem) {
        return res.status(404).json({ error: "Package not found" });
      }

      // Check access permissions
      const hasAccess = await this.canAccessOwnerPackages(
        req,
        packageItem.recipient_owner_id
      );
      if (!hasAccess) {
        return res.status(403).json({
          error: "Access denied. You can only update your own packages.",
        });
      }

      // Build update data
      const updateData = {
        delivery_status: status,
        updated_at: new Date(),
      };

      if (status === "delivered") {
        updateData.delivered_to_owner = {
          delivered_at: new Date(),
          delivered_by_guard: req.user.userId, // MySQL user ID
          recipient_signature: recipient_signature || "",
        };
      }

      // Update in MongoDB using flexible filter
      const filter = isObjectId ? { _id: id } : { package_id: id };
      const updatedPackage = await PackageDelivery.findOneAndUpdate(
        filter,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: "Package status updated successfully",
        data: updatedPackage,
      });
    } catch (error) {
      console.error("Update package status error:", error);
      res.status(500).json({ error: "Failed to update package status" });
    }
  }

  // DELETE - Delete package (Guards only)
  async deletePackage(req, res) {
    try {
      const { id } = req.params;
      // Validate ID format or support business code lookup
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const isBizId = this.isBusinessPackageId(id);
      if (!isObjectId && !isBizId) {
        return res.status(400).json({
          error:
            "Invalid package identifier. Provide a valid Mongo ObjectId or business package_id (e.g., PKG-...)",
        });
      }

      const filter = isObjectId ? { _id: id } : { package_id: id };
      const deletedPackage = await PackageDelivery.findOneAndDelete(filter);

      if (!deletedPackage) {
        return res.status(404).json({ error: "Package not found" });
      }

      res.status(200).json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Delete package error:", error);
      res.status(500).json({ error: "Failed to delete package" });
    }
  }

  // AGGREGATION - Get package statistics (MongoDB aggregation)
  async getPackageStats(req, res) {
    try {
      const [statusStats, typeStats, monthlyStats] = await Promise.all([
        // Status aggregation
        PackageDelivery.aggregate([
          {
            $group: {
              _id: "$delivery_status",
              count: { $sum: 1 },
              latest_delivery: { $max: "$received_by_guard.received_at" },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Type aggregation
        PackageDelivery.aggregate([
          {
            $group: {
              _id: "$package_type",
              count: { $sum: 1 },
            },
          },
        ]),

        // Monthly aggregation
        PackageDelivery.aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$received_by_guard.received_at" },
                month: { $month: "$received_by_guard.received_at" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } },
          { $limit: 12 },
        ]),
      ]);

      res.status(200).json({
        status_stats: statusStats,
        type_stats: typeStats,
        monthly_stats: monthlyStats,
      });
    } catch (error) {
      console.error("Get package stats error:", error);
      res.status(500).json({ error: "Failed to fetch package statistics" });
    }
  }

  // AGGREGATION - Get monthly delivery report
  async getMonthlyReport(req, res) {
    try {
      const { year = new Date().getFullYear() } = req.query;

      const monthlyReport = await PackageDelivery.aggregate([
        {
          $match: {
            "received_by_guard.received_at": {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${parseInt(year) + 1}-01-01`),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$received_by_guard.received_at" },
              status: "$delivery_status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.month",
            deliveries: {
              $push: {
                status: "$_id.status",
                count: "$count",
              },
            },
            total: { $sum: "$count" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.status(200).json({ data: monthlyReport });
    } catch (error) {
      console.error("Get monthly report error:", error);
      res.status(500).json({ error: "Failed to fetch monthly report" });
    }
  }

  // AGGREGATION - Get owner package summary
  async getOwnerPackageSummary(req, res) {
    try {
      const ownerSummary = await PackageDelivery.aggregate([
        {
          $group: {
            _id: "$recipient_owner_id",
            total_packages: { $sum: 1 },
            pending_packages: {
              $sum: { $cond: [{ $eq: ["$delivery_status", "pending"] }, 1, 0] },
            },
            delivered_packages: {
              $sum: {
                $cond: [{ $eq: ["$delivery_status", "delivered"] }, 1, 0],
              },
            },
            last_delivery: { $max: "$received_by_guard.received_at" },
          },
        },
        {
          $sort: { total_packages: -1 },
        },
      ]);

      res.status(200).json({ data: ownerSummary });
    } catch (error) {
      console.error("Get owner summary error:", error);
      res.status(500).json({ error: "Failed to fetch owner summary" });
    }
  }

  // Get my packages (for owners)
  async getMyPackages(req, res) {
    try {
      if (!req.userAccess.isOwner) {
        return res.status(403).json({
          error: "This endpoint is only for package recipients",
        });
      }

      // Get owner from MySQL
      const userOwner = await OwnerModel.findByUserId(req.user.userId);
      if (!userOwner) {
        return res.status(404).json({
          error: "Owner profile not found for this user",
        });
      }

      // Get packages from MongoDB
      const packages = await PackageDelivery.find({
        recipient_owner_id: userOwner.Owners_id,
      }).sort({ "received_by_guard.received_at": -1 });

      res.status(200).json({
        data: packages,
        owner_info: {
          name: userOwner.Owners_name,
          email: userOwner.Owners_email,
        },
      });
    } catch (error) {
      console.error("Get my packages error:", error);
      res.status(500).json({ error: "Failed to fetch your packages" });
    }
  }
}

const packageDeliveryController = new PackageDeliveryController();
export default packageDeliveryController;
