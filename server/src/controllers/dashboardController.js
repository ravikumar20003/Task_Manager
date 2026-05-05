const Task = require("../models/Task");
const Project = require("../models/Project");

const getDashboard = async (req, res) => {
  const projectFilter = req.user.role === "ADMIN" ? {} : { members: req.user._id };
  const projects = await Project.find(projectFilter).select("_id");
  const projectIds = projects.map((p) => p._id);

  const taskFilter = { project: { $in: projectIds } };
  const tasks = await Task.find(taskFilter);

  const now = new Date();

  const stats = {
    totalTasks: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    overdue: tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "DONE").length,
  };

  res.json(stats);
};

module.exports = { getDashboard };
