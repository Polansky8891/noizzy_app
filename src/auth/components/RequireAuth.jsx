import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/auth/authSlice";

export default function RequireAuth({ children }) {
  const { status } = useSelector(selectAuth); // 'checking' | 'authenticated' | 'not-authenticated'
  const location = useLocation();

  // mientras Firebase decide
  if (status === "checking") return null; // o un spinner

  if (status !== "authenticated") {
    return (
      <div className="p-8 text-center text-white">
        <p className="mb-4 text-lg">You must log in to see this page</p>
        <Link
          to="/profile"                // tu ruta de login
          state={{ from: location }}   // para volver luego
          className="inline-block bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2"
        >
          Log in
        </Link>
      </div>
    );
  }

  return children;
}