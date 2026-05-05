const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  const { name, description } = req.validated;

  const project = await Project.create({
    name,
    description: description || "",
    owner: req.user._id,
    members: [req.user._id],
  });

  const populated = await project.populate([
    { path: "owner", select: "name email role" },
    { path: "members", select: "name email role" },
  ]);

  res.status(201).json(populated);
};

const listProjects = async (req, res) => {
  const filter = req.user.role === "ADMIN" ? {} : { members: req.user._id };
  const projects = await Project.find(filter)
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });

  res.json(projects);
};

const addMember = async (req, res) => {
  const { email } = req.validated;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const project = req.project;
  const exists = project.members.some((member) => member.toString() === user._id.toString());

  if (!exists) {
    project.members.push(user._id);
    await project.save();
  }

  const populated = await project.populate([
    { path: "owner", select: "name email role" },
    { path: "members", select: "name email role" },
  ]);

  res.json(populated);
};

module.exports = { createProject, listProjects, addMember };
