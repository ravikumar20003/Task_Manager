import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import api, { getApiError } from "../api";
import { logoutUser } from "../features/auth/authSlice";

const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters"),
  description: z.string().trim().max(500, "Description is too long").optional(),
});

const memberSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

const taskSchema = z.object({
  title: z.string().trim().min(2, "Task title must be at least 2 characters"),
  description: z.string().trim().max(1000, "Description is too long").optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

const statusLabels = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const statusStyles = {
  TODO: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const statStyles = [
  "bg-cyan-50 text-cyan-800 ring-cyan-100",
  "bg-amber-50 text-amber-800 ring-amber-100",
  "bg-indigo-50 text-indigo-800 ring-indigo-100",
  "bg-emerald-50 text-emerald-800 ring-emerald-100",
  "bg-rose-50 text-rose-800 ring-rose-100",
];

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-600">{message}</p>;
}

function StatCard({ label, value, className }) {
  return (
    <div className={`rounded-lg p-4 ring-1 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";
  const pageTitle = isAdmin ? "Admin dashboard" : "My dashboard";
  const roleBadgeClass = isAdmin
    ? "bg-teal-50 text-teal-700 ring-teal-200"
    : "bg-indigo-50 text-indigo-700 ring-indigo-200";

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    reset: resetProject,
    formState: { errors: projectErrors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "" },
  });

  const {
    register: registerMember,
    handleSubmit: handleMemberSubmit,
    reset: resetMember,
    formState: { errors: memberErrors },
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: { email: "" },
  });

  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    reset: resetTask,
    formState: { errors: taskErrors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", assigneeId: "", dueDate: "" },
  });

  const loadTasks = async (projectId) => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    const res = await api.get(`/tasks/project/${projectId}`);
    setTasks(res.data);
  };

  const loadWorkspace = async (preferredProjectId = "") => {
    setMessage("");
    setLoading(true);

    try {
      const [dashboardRes, projectsRes] = await Promise.all([api.get("/dashboard"), api.get("/projects")]);
      setDashboard(dashboardRes.data);
      setProjects(projectsRes.data);

      const targetProjectId = preferredProjectId || projectsRes.data[0]?._id || "";
      setSelectedProjectId(targetProjectId);
      await loadTasks(targetProjectId);
    } catch (error) {
      setMessage(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const selectProject = async (projectId) => {
    setSelectedProjectId(projectId);
    setMessage("");

    try {
      await loadTasks(projectId);
    } catch (error) {
      setMessage(getApiError(error));
    }
  };

  const createProject = async (values) => {
    setMessage("");

    try {
      const res = await api.post("/projects", values);
      resetProject();
      await loadWorkspace(res.data._id);
    } catch (error) {
      setMessage(getApiError(error));
    }
  };

  const addMember = async (values) => {
    if (!selectedProjectId) return;
    setMessage("");

    try {
      await api.post(`/projects/${selectedProjectId}/members`, values);
      resetMember();
      await loadWorkspace(selectedProjectId);
      setMessage("Member added to project.");
    } catch (error) {
      setMessage(getApiError(error));
    }
  };

  const createTask = async (values) => {
    if (!selectedProjectId) return;
    setMessage("");

    try {
      await api.post(`/tasks/project/${selectedProjectId}`, values);
      resetTask({ title: "", description: "", assigneeId: "", dueDate: "" });
      await Promise.all([loadTasks(selectedProjectId), api.get("/dashboard").then((res) => setDashboard(res.data))]);
    } catch (error) {
      setMessage(getApiError(error));
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    setMessage("");

    try {
      await api.patch(`/tasks/project/${selectedProjectId}/${taskId}`, { status });
      await Promise.all([loadTasks(selectedProjectId), api.get("/dashboard").then((res) => setDashboard(res.data))]);
    } catch (error) {
      setMessage(getApiError(error));
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const stats = [
    ["Total", dashboard?.totalTasks ?? 0],
    ["To do", dashboard?.todo ?? 0],
    ["In progress", dashboard?.inProgress ?? 0],
    ["Done", dashboard?.done ?? 0],
    ["Overdue", dashboard?.overdue ?? 0],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <aside className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-sm font-semibold text-teal-700">Team Task Manager</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{pageTitle}</h1>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ring-1 ${roleBadgeClass}`}>
                {user?.role}
              </span>
            </div>
          </div>

          {isAdmin && (
            <form onSubmit={handleProjectSubmit(createProject)} className="border-b border-slate-200 py-4">
              <p className={labelClass}>New project</p>
              <div className="mt-2 space-y-2">
                <input className={inputClass} placeholder="Project name" {...registerProject("name")} />
                <FieldError message={projectErrors.name?.message} />
                <textarea className={inputClass} rows="3" placeholder="Short description" {...registerProject("description")} />
                <FieldError message={projectErrors.description?.message} />
                <button className="w-full rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
                  Create project
                </button>
              </div>
            </form>
          )}

          <div className="py-4">
            <div className="flex items-center justify-between gap-3">
              <p className={labelClass}>Projects</p>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {projects.length}
              </span>
            </div>

            <div className="mt-3 max-h-[46vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[calc(100vh-25rem)]">
              {loading && <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">Loading projects...</p>}
              {!loading && projects.length === 0 && (
                <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No projects yet.</p>
              )}
              {projects.map((project) => {
                const active = selectedProjectId === project._id;

                return (
                  <button
                    type="button"
                    key={project._id}
                    onClick={() => selectProject(project._id)}
                    className={`w-full rounded-md border p-3 text-left transition ${
                      active
                        ? "border-teal-400 bg-teal-50 text-teal-950 shadow-sm"
                        : "border-slate-200 bg-white text-slate-800 hover:border-teal-200 hover:bg-slate-50"
                    }`}
                  >
                    <span className="block truncate text-sm font-semibold">{project.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {project.members?.length || 0} members
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-auto w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            Logout
          </button>
        </aside>

        <section className="min-w-0 space-y-5">
          <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={labelClass}>{isAdmin ? "Admin overview" : "Member overview"}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {selectedProject ? selectedProject.name : "Select a project"}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  {selectedProject?.description || "Tasks, team members, and progress are shown here."}
                </p>
              </div>
              {selectedProject && (
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                  {selectedProject.members?.length || 0} project members
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map(([label, value], index) => (
                <StatCard key={label} label={label} value={value} className={statStyles[index]} />
              ))}
            </div>
          </header>

          {message && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
              {message}
            </p>
          )}

          {selectedProject && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={labelClass}>Tasks</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">Project work</h2>
                  </div>
                  <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {tasks.length} tasks
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {tasks.length === 0 && (
                    <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No tasks yet.
                    </p>
                  )}

                  {tasks.map((task) => {
                    const canUpdateStatus = isAdmin || task.assignee?._id === user?.id;
                    const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

                    return (
                      <article key={task._id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="min-w-0 break-words text-base font-bold text-slate-950">{task.title}</h3>
                              <span className={`rounded-md px-2 py-1 text-xs font-bold ring-1 ${statusStyles[task.status]}`}>
                                {statusLabels[task.status]}
                              </span>
                              {overdue && (
                                <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                                  Overdue
                                </span>
                              )}
                            </div>
                            {task.description && <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>}
                            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                              <p>
                                <span className="font-semibold text-slate-800">Assigned:</span>{" "}
                                {task.assignee?.name || "Unassigned"}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">Due:</span> {formatDate(task.dueDate)}
                              </p>
                            </div>
                          </div>

                          <label className="w-full sm:w-48">
                            <span className="sr-only">Task status</span>
                            <select
                              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                              value={task.status}
                              disabled={!canUpdateStatus}
                              onChange={(event) => updateTaskStatus(task._id, event.target.value)}
                            >
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <div className="space-y-5">
                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className={labelClass}>Team</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950">Project members</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedProject.members?.map((member) => (
                      <span
                        key={member._id}
                        className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        {member.name} - {member.role}
                      </span>
                    ))}
                  </div>
                </section>

                {isAdmin ? (
                  <>
                    <form onSubmit={handleMemberSubmit(addMember)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <p className={labelClass}>Add member</p>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">Invite by email</h2>
                      <div className="mt-3 space-y-2">
                        <input className={inputClass} placeholder="member@example.com" {...registerMember("email")} />
                        <FieldError message={memberErrors.email?.message} />
                        <button className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                          Add member
                        </button>
                      </div>
                    </form>

                    <form onSubmit={handleTaskSubmit(createTask)} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <p className={labelClass}>Create task</p>
                      <h2 className="mt-1 text-lg font-bold text-slate-950">New work item</h2>
                      <div className="mt-3 space-y-2">
                        <input className={inputClass} placeholder="Task title" {...registerTask("title")} />
                        <FieldError message={taskErrors.title?.message} />
                        <textarea className={inputClass} rows="3" placeholder="Description" {...registerTask("description")} />
                        <FieldError message={taskErrors.description?.message} />
                        <select className={inputClass} {...registerTask("assigneeId")}>
                          <option value="">Unassigned</option>
                          {selectedProject.members?.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                        <input type="date" className={inputClass} {...registerTask("dueDate")} />
                        <button className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                          Create task
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                    <p className={labelClass}>Member view</p>
                    <h2 className="mt-1 text-lg font-bold text-indigo-950">Simple task updates</h2>
                    <p className="mt-2 text-sm leading-6 text-indigo-800">
                      You can update the status of tasks assigned to you. Admin tasks and team changes stay with project admins.
                    </p>
                  </section>
                )}
              </div>
            </div>
          )}

          {!selectedProject && !loading && (
            <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-slate-950">No project selected</h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose a project from the sidebar to see its tasks and team members.
              </p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

export default DashboardPage;
