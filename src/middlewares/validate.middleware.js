const HTTP_STATUS = require('../constants/httpStatus.constants');

const validateRequest = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};

    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    const parsed = schema.parse ? schema.parse(dataToValidate) : schema.body.parse(req.body);

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Données transmises invalides',
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validateRequest;
