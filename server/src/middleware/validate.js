const { matchedData, validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: result.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  req.validated = matchedData(req, {
    includeOptionals: true,
    locations: ["body", "params", "query"],
  });

  next();
};

module.exports = { validate };
