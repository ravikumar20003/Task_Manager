const Project = require("../models/Project");

const requireProjectAccess = async (req, res, next) => {
  const { projectId } = req.validated || req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (req.user.role === "ADMIN") {
    req.project = project;
    return next();
  }

  const hasAccess = project.members.some((member) => member.toString() === req.user._id.toString());
  if (!hasAccess) {
    return res.status(403).json({ message: "No access to this project" });
  }

  req.project = project;
  next();
};

module.exports = { requireProjectAccess };
