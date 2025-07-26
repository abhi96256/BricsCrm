const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Machine name is required'],
    trim: true,
    unique: true
  },
  model: {
    type: String,
    required: [true, 'Machine model is required']
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['Operational', 'Maintenance', 'Repair', 'Offline', 'Retired'],
    default: 'Operational'
  },
  location: {
    type: String,
    required: [true, 'Machine location is required']
  },
  department: {
    type: String,
    default: 'Production'
  },
  manufacturer: {
    type: String,
    default: ''
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  lastMaintenance: {
    type: Date,
    default: null
  },
  nextMaintenance: {
    type: Date,
    default: null
  },
  maintenanceInterval: {
    type: Number, // in days
    default: 30
  },
  specifications: {
    power: String,
    capacity: String,
    dimensions: String,
    weight: String
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  operatingHours: {
    type: Number,
    default: 0
  },
  efficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  documents: [{
    title: String,
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Preventive', 'Corrective', 'Emergency']
    },
    description: String,
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cost: {
      type: Number,
      default: 0
    },
    parts: [String]
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['Maintenance Due', 'Performance Issue', 'Safety Concern', 'Other']
    },
    message: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
machineSchema.index({ status: 1 });
machineSchema.index({ location: 1 });
machineSchema.index({ nextMaintenance: 1 });

module.exports = mongoose.model('Machine', machineSchema); 