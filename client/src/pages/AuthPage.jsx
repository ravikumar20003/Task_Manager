import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { clearAuthError, loginUser, signupUser } from "../features/auth/authSlice";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-600">{message}</p>;
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, status, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "MEMBER",
    },
  });

  useEffect(() => {
    dispatch(clearAuthError());
    reset({ name: "", email: "", password: "", role: "MEMBER" });
  }, [dispatch, isSignup, reset]);

  const onSubmit = async (values) => {
    const action = isSignup ? signupUser(values) : loginUser({ email: values.email, password: values.password });
    try {
      await dispatch(action).unwrap();
      navigate("/app", { replace: true });
    } catch {
      // The Redux slice owns the visible auth error state.
    }
  };

  if (user) return <Navigate to="/app" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-teal-700">Team Task Manager</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">{isSignup ? "Create account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-slate-600">{isSignup ? "Start with a simple workspace" : "Sign in to continue"}</p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <Link
            to="/login"
            className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition ${!isSignup ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-teal-700"}`}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition ${isSignup ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-teal-700"}`}
          >
            Sign up
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          {isSignup && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...register("name")} />
              <FieldError message={errors.name?.message} />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input type="email" className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input type="password" className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </label>

          {isSignup && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select className="mt-1 w-full rounded-md border border-slate-300 p-2 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...register("role")}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-teal-600 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            {status === "loading" ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </button>

          {error && <p className="rounded-md bg-rose-50 p-2 text-sm font-medium text-rose-700">{error}</p>}
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
