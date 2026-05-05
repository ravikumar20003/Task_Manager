const { Router } = require("express");
const { createTask, listTasksByProject, updateTask } = require("../controllers/taskController");
const { requireAuth } = require("../middleware/auth");
const { requireProjectAccess } = require("../middleware/projectAccess");
const { allowRoles } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { createTaskRules, projectTaskParams, updateTaskRules } = require("../validators/taskValidators");

const router = Router();

router.use(requireAuth);
router.get("/project/:projectId", projectTaskParams, validate, requireProjectAccess, listTasksByProject);
router.post("/project/:projectId", allowRoles("ADMIN"), createTaskRules, validate, requireProjectAccess, createTask);
router.patch("/project/:projectId/:taskId", updateTaskRules, validate, requireProjectAccess, updateTask);

module.exports = router;
