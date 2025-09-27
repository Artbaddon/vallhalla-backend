import PackageDelivery from '../models/packages.model.js';
import UserModel from '../models/user.model.js'; // MySQL
import OwnerModel from '../models/owner.model.js'; // MySQL
import mongoose from 'mongoose';

class PackageDeliveryController {
  
  // Helper: determine if a string looks like our business ID (e.g., PKG-...)
  isBusinessPackageId(id) {
    return typeof id === 'string' && /^PKG-/i.test(id);
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
  
  // Helper to get owner from MySQL
  async getOwnerFromMySQL(ownerId) {
    try {
      const owner = await OwnerModel.findById(ownerId);
      return owner;
    } catch (error) {
      console.error('Error fetching owner from MySQL:', error);
      return null;
    }
  }

  // Helper to get user from MySQL
  async getUserFromMySQL(userId) {
    try {
      const user = await UserModel.findById(userId);
      return user;
    } catch (error) {
      console.error('Error fetching user from MySQL:', error);
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

  // CREATE - Register new package (Guards only)
  async registerPackage(req, res) {
    try {
      const { recipient_owner_id } = req.body;
      
      // Validate owner exists in MySQL
      const owner = await this.getOwnerFromMySQL(recipient_owner_id);
      if (!owner) {
        return res.status(400).json({ 
          error: 'Invalid owner ID. Owner not found in system.' 
        });
      }

      // Generate unique package ID
      const packageId = `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create package data for MongoDB
      const packageData = {
        ...req.body,
        package_id: packageId,
        received_by_guard: {
          guard_id: req.user.userId, // From JWT (MySQL user)
          received_at: new Date(),
        }
      };

      // Save to MongoDB
      const newPackage = new PackageDelivery(packageData);
      await newPackage.save();

      res.status(201).json({
        message: 'Package registered successfully',
        data: {
          ...newPackage.toObject(),
          owner_info: {
            name: owner.Owners_name,
            email: owner.Owners_email
          }
        }
      });
    } catch (error) {
      console.error('Register package error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: Object.values(error.errors).map(e => e.message)
        });
      }
      res.status(500).json({ 
        error: 'Failed to register package',
        details: error.message 
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
        end_date 
      } = req.query;

      // Build MongoDB filter
      const filter = {};
      
      // User-specific filtering
      if (!req.userAccess.canSeeAll) {
        // For owners, only show their packages
        const userOwner = await OwnerModel.findByUserId(req.user.userId);
        if (!userOwner) {
          return res.status(403).json({ 
            error: 'Owner profile not found for this user' 
          });
        }
        filter.recipient_owner_id = userOwner.Owners_id;
      }
      
      if (status) filter.delivery_status = status;
      if (package_type) filter.package_type = package_type;
      
      if (start_date || end_date) {
        filter['received_by_guard.received_at'] = {};
        if (start_date) filter['received_by_guard.received_at'].$gte = new Date(start_date);
        if (end_date) filter['received_by_guard.received_at'].$lte = new Date(end_date);
      }

      // Query MongoDB
      const packages = await PackageDelivery.find(filter)
        .sort({ 'received_by_guard.received_at': -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Enrich with MySQL data
      const enrichedPackages = await Promise.all(
        packages.map(async (pkg) => {
          const [ownerInfo, guardInfo] = await Promise.all([
            this.getOwnerFromMySQL(pkg.recipient_owner_id),
            this.getUserFromMySQL(pkg.received_by_guard.guard_id)
          ]);
          
          return {
            ...pkg.toObject(),
            owner_info: ownerInfo ? {
              name: ownerInfo.Owners_name,
              email: ownerInfo.Owners_email,
              phone: ownerInfo.Owners_phone
            } : null,
            guard_info: guardInfo ? {
              name: guardInfo.Users_name
            } : null
          };
        })
      );

      const total = await PackageDelivery.countDocuments(filter);

      res.status(200).json({
        data: enrichedPackages,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get packages error:', error);
      res.status(500).json({ error: 'Failed to fetch packages' });
    }
  }

  // READ - Get package by ID with access control
  async getPackageById(req, res) {
    try {
      const { id } = req.params;
      // Validate ID format or support business code lookup
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const isBizId = this.isBusinessPackageId(id);
      if (!isObjectId && !isBizId) {
        return res.status(400).json({
          error: 'Invalid package identifier. Provide a valid Mongo ObjectId or business package_id (e.g., PKG-...)'
        });
      }

      const packageItem = await this.findPackageByFlexibleId(id);

      if (!packageItem) {
        return res.status(404).json({ error: 'Package not found' });
      }

      // Check access permissions
      const hasAccess = await this.canAccessOwnerPackages(req, packageItem.recipient_owner_id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied. You can only view your own packages.' 
        });
      }

      // Enrich with owner and guard info
      const [ownerInfo, guardInfo] = await Promise.all([
        this.getOwnerFromMySQL(packageItem.recipient_owner_id),
        this.getUserFromMySQL(packageItem.received_by_guard.guard_id)
      ]);

      const enrichedPackage = {
        ...packageItem.toObject(),
        owner_info: ownerInfo ? {
          name: ownerInfo.Owners_name,
          email: ownerInfo.Owners_email,
          phone: ownerInfo.Owners_phone
        } : null,
        guard_info: guardInfo ? {
          name: guardInfo.Users_name
        } : null
      };

      res.status(200).json({ data: enrichedPackage });
    } catch (error) {
      console.error('Get package by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch package' });
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
          error: 'Invalid package identifier. Provide a valid Mongo ObjectId or business package_id (e.g., PKG-...)'
        });
      }

      // Get package from MongoDB (first fetch to check access)
      const packageItem = await this.findPackageByFlexibleId(id);
      if (!packageItem) {
        return res.status(404).json({ error: 'Package not found' });
      }

      // Check access permissions
      const hasAccess = await this.canAccessOwnerPackages(req, packageItem.recipient_owner_id);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied. You can only update your own packages.' 
        });
      }

      // Build update data
      const updateData = { 
        delivery_status: status,
        updated_at: new Date()
      };

      if (status === 'delivered') {
        updateData.delivered_to_owner = {
          delivered_at: new Date(),
          delivered_by_guard: req.user.userId, // MySQL user ID
          recipient_signature: recipient_signature || ''
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
        message: 'Package status updated successfully',
        data: updatedPackage
      });
    } catch (error) {
      console.error('Update package status error:', error);
      res.status(500).json({ error: 'Failed to update package status' });
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
          error: 'Invalid package identifier. Provide a valid Mongo ObjectId or business package_id (e.g., PKG-...)'
        });
      }

      const filter = isObjectId ? { _id: id } : { package_id: id };
      const deletedPackage = await PackageDelivery.findOneAndDelete(filter);

      if (!deletedPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }

      res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
      console.error('Delete package error:', error);
      res.status(500).json({ error: 'Failed to delete package' });
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
              _id: '$delivery_status',
              count: { $sum: 1 },
              latest_delivery: { $max: '$received_by_guard.received_at' }
            }
          },
          { $sort: { count: -1 } }
        ]),
        
        // Type aggregation
        PackageDelivery.aggregate([
          {
            $group: {
              _id: '$package_type',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Monthly aggregation
        PackageDelivery.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$received_by_guard.received_at' },
                month: { $month: '$received_by_guard.received_at' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ])
      ]);

      res.status(200).json({
        status_stats: statusStats,
        type_stats: typeStats,
        monthly_stats: monthlyStats
      });
    } catch (error) {
      console.error('Get package stats error:', error);
      res.status(500).json({ error: 'Failed to fetch package statistics' });
    }
  }

  // AGGREGATION - Get monthly delivery report
  async getMonthlyReport(req, res) {
    try {
      const { year = new Date().getFullYear() } = req.query;

      const monthlyReport = await PackageDelivery.aggregate([
        {
          $match: {
            'received_by_guard.received_at': {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${parseInt(year) + 1}-01-01`)
            }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$received_by_guard.received_at' },
              status: '$delivery_status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.month',
            deliveries: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      res.status(200).json({ data: monthlyReport });
    } catch (error) {
      console.error('Get monthly report error:', error);
      res.status(500).json({ error: 'Failed to fetch monthly report' });
    }
  }

  // AGGREGATION - Get owner package summary
  async getOwnerPackageSummary(req, res) {
    try {
      const ownerSummary = await PackageDelivery.aggregate([
        {
          $group: {
            _id: '$recipient_owner_id',
            total_packages: { $sum: 1 },
            pending_packages: {
              $sum: { $cond: [{ $eq: ['$delivery_status', 'pending'] }, 1, 0] }
            },
            delivered_packages: {
              $sum: { $cond: [{ $eq: ['$delivery_status', 'delivered'] }, 1, 0] }
            },
            last_delivery: { $max: '$received_by_guard.received_at' }
          }
        },
        {
          $sort: { total_packages: -1 }
        }
      ]);

      res.status(200).json({ data: ownerSummary });
    } catch (error) {
      console.error('Get owner summary error:', error);
      res.status(500).json({ error: 'Failed to fetch owner summary' });
    }
  }

  // Get my packages (for owners)
  async getMyPackages(req, res) {
    try {
      if (!req.userAccess.isOwner) {
        return res.status(403).json({ 
          error: 'This endpoint is only for package recipients' 
        });
      }

      // Get owner from MySQL
      const userOwner = await OwnerModel.findByUserId(req.user.userId);
      if (!userOwner) {
        return res.status(404).json({ 
          error: 'Owner profile not found for this user' 
        });
      }

      // Get packages from MongoDB
      const packages = await PackageDelivery.find({ 
        recipient_owner_id: userOwner.Owners_id 
      }).sort({ 'received_by_guard.received_at': -1 });

      res.status(200).json({ 
        data: packages,
        owner_info: {
          name: userOwner.Owners_name,
          email: userOwner.Owners_email
        }
      });
    } catch (error) {
      console.error('Get my packages error:', error);
      res.status(500).json({ error: 'Failed to fetch your packages' });
    }
  }
}

const packageDeliveryController = new PackageDeliveryController();
export default packageDeliveryController;
