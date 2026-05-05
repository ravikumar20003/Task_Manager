import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const { bootstrapped, status, user } = useSelector((state) => state.auth);

  if (!bootstrapped || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-slate-700">
        Checking your session...
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
