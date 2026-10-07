const mongoose = require('mongoose');
const { RIDE_STATUS, RIDE_TIERS, PAYMENT_METHODS } = require('../constants/ride.constants');

const rideSchema = new mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    tier: {
      type: String,
      enum: [RIDE_TIERS.ECO, RIDE_TIERS.VIP],
      default: RIDE_TIERS.ECO,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(RIDE_STATUS),
      default: RIDE_STATUS.SEARCHING,
      index: true
    },
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    dropoffLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    fare: {
      basePrice: { type: Number, required: true, default: 500 },
      distanceKm: { type: Number, required: true, default: 0 },
      durationMin: { type: Number, required: true, default: 0 },
      totalPrice: { type: Number, required: true, default: 500 }
    },
    paymentMethod: {
      type: String,
      enum: [PAYMENT_METHODS.CASH, PAYMENT_METHODS.WAVE],
      default: PAYMENT_METHODS.CASH
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    isArchivedByPassenger: {
      type: Boolean,
      default: false,
      index: true
    },
    isArchivedByDriver: {
      type: Boolean,
      default: false,
      index: true
    },
    cancelledBy: {
      type: String,
      enum: ['passenger', 'driver', 'system', null],
      default: null
    },
    cancelReason: {
      type: String,
      default: null
    },
    acceptedAt: { type: Date, default: null },
    driverArrivedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

rideSchema.index({ createdAt: -1 });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
