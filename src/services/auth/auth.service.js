const bcrypt = require('bcryptjs');
const User = require('../../models/User.model');
const Driver = require('../../models/Driver.model');
const { generateAuthTokens, verifyRefreshToken } = require('./auth.token.service');
const { ROLES } = require('../../constants/roles.constants');

const registerUser = async (data) => {
  const { fullName, phone, email, password, role, vehicleInfo } = data;

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }]
  });

  if (existingUser) {
    const field = existingUser.email === email.toLowerCase() ? 'adresse e-mail' : 'numéro de téléphone';
    const error = new Error(`Cette ${field} est déjà utilisée.`);
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await User.hashPassword(password);

  const newUser = new User({
    fullName,
    phone,
    email: email.toLowerCase(),
    passwordHash,
    role: role || ROLES.CLIENT
  });

  await newUser.save();

  if (newUser.role === ROLES.DRIVER) {
    await Driver.create({
      user: newUser._id,
      vehicleInfo: vehicleInfo || {}
    });
  }

  const tokens = await generateAuthTokens(newUser);
  newUser.refreshTokenHash = tokens.refreshTokenHash;
  await newUser.save();

  return {
    user: {
      id: newUser._id,
      fullName: newUser.fullName,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  };
};

const loginUser = async ({ identifier, password }) => {
  const cleanId = identifier.trim();
  const isPhone = /^\+?[0-9\s-]{6,}$/.test(cleanId);

  const query = isPhone
    ? { phone: cleanId.replace(/\s+/g, ''), isArchived: false }
    : { email: cleanId.toLowerCase(), isArchived: false };

  const user = await User.findOne(query).select('+passwordHash +refreshTokenHash');

  if (!user) {
    const error = new Error('Identifiant ou mot de passe incorrect.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Identifiant ou mot de passe incorrect.');
    error.statusCode = 401;
    throw error;
  }

  const tokens = await generateAuthTokens(user);
  user.refreshTokenHash = tokens.refreshTokenHash;
  await user.save();

  let driverDetails = null;
  if (user.role === ROLES.DRIVER) {
    driverDetails = await Driver.findOne({ user: user._id });
  }

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      driverInfo: driverDetails
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  };
};

const refreshSession = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    const error = new Error('Jeton de rafraîchissement invalide ou expiré.');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId).select('+refreshTokenHash');
  if (!user || user.isArchived) {
    const error = new Error('Utilisateur introuvable ou compte désactivé.');
    error.statusCode = 401;
    throw error;
  }

  const isTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isTokenValid) {
    const error = new Error('Session révoquée. Veuillez vous reconnecter.');
    error.statusCode = 401;
    throw error;
  }

  const tokens = await generateAuthTokens(user);
  user.refreshTokenHash = tokens.refreshTokenHash;
  await user.save();

  return tokens;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    const error = new Error('Utilisateur introuvable.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Le mot de passe actuel est incorrect.');
    error.statusCode = 400;
    throw error;
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();

  return { success: true, message: 'Mot de passe modifié avec succès.' };
};

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  changePassword
};
