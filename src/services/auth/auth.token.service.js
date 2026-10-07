const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const envConfig = require('../../config/env.config');

const generateAuthTokens = async (user) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
    fullName: user.fullName
  };

  const accessToken = jwt.sign(payload, envConfig.jwt.accessSecret, {
    expiresIn: envConfig.jwt.accessExpiresIn
  });

  const refreshToken = jwt.sign(payload, envConfig.jwt.refreshSecret, {
    expiresIn: envConfig.jwt.refreshExpiresIn
  });

  const salt = await bcrypt.genSalt(10);
  const refreshTokenHash = await bcrypt.hash(refreshToken, salt);

  return {
    accessToken,
    refreshToken,
    refreshTokenHash
  };
};

const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, envConfig.jwt.refreshSecret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAuthTokens,
  verifyRefreshToken
};
