const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true
    },
    isBusy: {
      type: Boolean,
      default: false,
      index: true
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [-4.008256, 5.359952],
        index: '2dsphere'
      }
    },
    heading: {
      type: Number,
      default: 0
    },
    vehicleInfo: {
      brand: { type: String, default: '' },
      model: { type: String, default: '' },
      color: { type: String, default: '' },
      licensePlate: { type: String, default: '' }
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0
    },
    totalRides: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

driverSchema.index({ currentLocation: '2dsphere' });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
