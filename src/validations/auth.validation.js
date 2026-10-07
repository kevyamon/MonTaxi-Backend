const { z } = require('zod');
const { ROLES } = require('../constants/roles.constants');

const registerSchema = {
  body: z.object({
    fullName: z
      .string({ required_error: 'Le nom complet est obligatoire' })
      .trim()
      .min(2, 'Le nom doit comporter au moins 2 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    phone: z
      .string({ required_error: 'Le numéro de téléphone est obligatoire' })
      .trim()
      .min(8, 'Le numéro de téléphone doit comporter au moins 8 caractères')
      .max(20, 'Numéro de téléphone trop long'),
    email: z
      .string({ required_error: 'L’adresse e-mail est obligatoire' })
      .trim()
      .email('Format d’adresse e-mail invalide')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Le mot de passe est obligatoire' })
      .min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
    role: z
      .enum([ROLES.CLIENT, ROLES.DRIVER], {
        invalid_type_error: 'Le rôle doit être soit client soit driver'
      })
      .default(ROLES.CLIENT),
    vehicleInfo: z
      .object({
        brand: z.string().optional(),
        model: z.string().optional(),
        color: z.string().optional(),
        licensePlate: z.string().optional()
      })
      .optional()
  })
};

const loginSchema = {
  body: z.object({
    identifier: z
      .string({ required_error: 'L’identifiant (e-mail ou téléphone) est obligatoire' })
      .trim()
      .min(3, 'Identifiant trop court'),
    password: z
      .string({ required_error: 'Le mot de passe est obligatoire' })
      .min(1, 'Veuillez saisir votre mot de passe')
  })
};

const refreshTokenSchema = {
  body: z.object({
    refreshToken: z
      .string({ required_error: 'Le jeton de rafraîchissement est obligatoire' })
      .min(10, 'Jeton de rafraîchissement invalide')
  })
};

const updateProfileSchema = {
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(8).max(20).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
    avatarUrl: z.string().url().nullable().optional()
  })
};

const updatePasswordSchema = {
  body: z.object({
    currentPassword: z
      .string({ required_error: 'Le mot de passe actuel est obligatoire' })
      .min(1, 'Le mot de passe actuel est requis'),
    newPassword: z
      .string({ required_error: 'Le nouveau mot de passe est obligatoire' })
      .min(6, 'Le nouveau mot de passe doit comporter au moins 6 caractères')
  })
};

const updatePushTokenSchema = {
  body: z.object({
    expoPushToken: z
      .string({ required_error: 'Le jeton Expo Push est obligatoire' })
      .trim()
      .min(5, 'Jeton Expo Push invalide')
  })
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  updatePasswordSchema,
  updatePushTokenSchema
};
