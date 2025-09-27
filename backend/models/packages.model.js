import mongoose from 'mongoose';

const packageDeliverySchema = new mongoose.Schema({
  package_id: {
    type: String,
    required: [true, 'Package ID is required'],
    unique: true,
    trim: true
  },
  package_type: {
    type: String,
    required: [true, 'Package type is required'],
    enum: ['package', 'bill', 'letter', 'food_delivery', 'other'],
    default: 'package'
  },
  recipient_owner_id: {
    type: Number,
    required: [true, 'Owner ID is required'],
    ref: 'Owner'
  },
  recipient_apartment: {
    type: String,
    required: [true, 'Apartment number is required'],
    trim: true
  },
  recipient_tower: {
    type: String,
    required: [true, 'Tower is required'],
    trim: true
  },

  received_by_guard: {
    guard_id: {
      type: Number,
      required: [true, 'Guard ID is required'],
      ref: 'Guard'
    },
    received_at: {
      type: Date,
      required: [true, 'Received date is required'],
      default: Date.now
    },

  },

  delivered_to_owner: {
    delivered_at: Date,
    delivered_by_guard: {
      type: Number,
      ref: 'Guard'
    },
    recipient_signature: String,
   
  },
  photos: [{
    filename: String,
    url: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'package_deliveries'
});

// Schema validation middleware
packageDeliverySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Indexes for better performance
packageDeliverySchema.index({ recipient_owner_id: 1 });
packageDeliverySchema.index({ delivery_status: 1 });
packageDeliverySchema.index({ 'received_by_guard.received_at': -1 });
packageDeliverySchema.index({ package_type: 1 });

const PackageDelivery = mongoose.model('PackageDelivery', packageDeliverySchema);

export default PackageDelivery;