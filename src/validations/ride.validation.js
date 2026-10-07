const { z } = require('zod');
const { RIDE_TIERS, PAYMENT_METHODS } = require('../constants/ride.constants');

const createRideSchema = {
  body: z.object({
    tier: z.enum([RIDE_TIERS.ECO, RIDE_TIERS.VIP]).default(RIDE_TIERS.ECO),
    pickupLocation: z.object({
      address: z.string().min(1, 'L’adresse de départ est requise'),
      coordinates: z
        .array(z.number())
        .length(2, 'Les coordonnées de départ doivent être [longitude, latitude]')
    }),
    dropoffLocation: z.object({
      address: z.string().min(1, 'L’adresse d’arrivée est requise'),
      coordinates: z
        .array(z.number())
        .length(2, 'Les coordonnées d’arrivée doivent être [longitude, latitude]')
    }),
    fare: z
      .object({
        basePrice: z.number().min(0),
        distanceKm: z.number().min(0),
        durationMin: z.number().min(0),
        totalPrice: z.number().min(0)
      })
      .optional(),
    paymentMethod: z
      .enum([PAYMENT_METHODS.CASH, PAYMENT_METHODS.WAVE])
      .default(PAYMENT_METHODS.CASH)
  })
};

const cancelRideSchema = {
  body: z.object({
    reason: z.string().optional().default('Annulée par l’utilisateur')
  })
};

module.exports = {
  createRideSchema,
  cancelRideSchema
};
