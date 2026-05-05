const Task = require("../models/Task");

const isProjectMember = (project, userId) =>
  project.members.some((memberId) => memberId.toString() === userId.toString());

const populateTask = (task) =>
  task.populate([
    { path: "assignee", select: "name email role" },
    { path: "createdBy", select: "name email role" },
  ]);

const createTask = async (req, res) => {
  const { title, description, assigneeId, dueDate } = req.validated;

  if (assigneeId && !isProjectMember(req.project, assigneeId)) {
    return res.status(400).json({ message: "Assignee must be a project member" });
  }

  const task = await Task.create({
    title,
    description: description || "",
    project: req.project._id,
    createdBy: req.user._id,
    assignee: assigneeId || null,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  res.status(201).json(await populateTask(task));
};

const listTasksByProject = async (req, res) => {
  const tasks = await Task.find({ project: req.project._id })
    .populate("assignee", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(tasks);
};

const updateTask = async (req, res) => {
  const data = req.validated;
  const task = await Task.findOne({ _id: data.taskId, project: req.project._id });

  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.user.role !== "ADMIN") {
    if (!task.assignee || task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Members can only update their assigned tasks" });
    }

    const changedFields = Object.keys(req.body);
    if (changedFields.length !== 1 || changedFields[0] !== "status") {
      return res.status(403).json({ message: "Members can only update task status" });
    }
  }

  if (data.assigneeId && !isProjectMember(req.project, data.assigneeId)) {
    return res.status(400).json({ message: "Assignee must be a project member" });
  }

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.assigneeId !== undefined) task.assignee = data.assigneeId || null;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.status !== undefined) task.status = data.status;

  await task.save();
  res.json(await populateTask(task));
};

module.exports = { createTask, listTasksByProject, updateTask };
