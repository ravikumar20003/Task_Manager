const { body, param } = require("express-validator");

const projectIdParam = [
  param("projectId").isMongoId().withMessage("Project id must be valid"),
];

const createProjectRules = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Project name must be between 2 and 100 characters"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const addMemberRules = [
  ...projectIdParam,
  body("email").trim().isEmail().withMessage("Enter a valid member email").normalizeEmail(),
];

module.exports = { projectIdParam, createProjectRules, addMemberRules };
