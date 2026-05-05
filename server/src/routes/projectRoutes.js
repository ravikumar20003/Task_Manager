const { Router } = require("express");
const { addMember, createProject, listProjects } = require("../controllers/projectController");
const { requireAuth } = require("../middleware/auth");
const { requireProjectAccess } = require("../middleware/projectAccess");
const { allowRoles } = require("../middleware/roles");
const { validate } = require("../middleware/validate");
const { addMemberRules, createProjectRules } = require("../validators/projectValidators");

const router = Router();

router.use(requireAuth);
router.get("/", listProjects);
router.post("/", allowRoles("ADMIN"), createProjectRules, validate, createProject);
router.post("/:projectId/members", allowRoles("ADMIN"), addMemberRules, validate, requireProjectAccess, addMember);

module.exports = router;
