const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, ALL_ROLES } = require('../constants/roles.constants');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Le nom complet est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit comporter au moins 2 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire'],
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: [true, 'L’adresse e-mail est obligatoire'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      select: false
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: ROLES.CLIENT,
      index: true
    },
    avatarUrl: {
      type: String,
      default: null
    },
    expoPushToken: {
      type: String,
      default: null,
      trim: true
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
