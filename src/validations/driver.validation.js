const { z } = require('zod');

const updateStatusSchema = {
  body: z.object({
    isOnline: z.boolean({ required_error: 'Le statut de disponibilité est obligatoire' }),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  })
};

const updateLocationSchema = {
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    heading: z.number().optional().default(0)
  })
};

module.exports = {
  updateStatusSchema,
  updateLocationSchema
};
