const { body, param } = require("express-validator");

const projectTaskParams = [
  param("projectId").isMongoId().withMessage("Project id must be valid"),
];

const taskParams = [
  ...projectTaskParams,
  param("taskId").isMongoId().withMessage("Task id must be valid"),
];

const createTaskRules = [
  ...projectTaskParams,
  body("title").trim().isLength({ min: 2, max: 120 }).withMessage("Task title must be between 2 and 120 characters"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("assigneeId").optional({ values: "falsy" }).isMongoId().withMessage("Assignee id must be valid"),
  body("dueDate").optional({ values: "falsy" }).isISO8601().withMessage("Due date must be valid"),
];

const updateTaskRules = [
  ...taskParams,
  body("title").optional().trim().isLength({ min: 2, max: 120 }).withMessage("Task title must be between 2 and 120 characters"),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("assigneeId").optional({ values: "falsy" }).isMongoId().withMessage("Assignee id must be valid"),
  body("dueDate").optional({ values: "falsy" }).isISO8601().withMessage("Due date must be valid"),
  body("status").optional().isIn(["TODO", "IN_PROGRESS", "DONE"]).withMessage("Status must be TODO, IN_PROGRESS, or DONE"),
];

module.exports = { projectTaskParams, taskParams, createTaskRules, updateTaskRules };
