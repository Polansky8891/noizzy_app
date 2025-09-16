import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectToken } from "../../store/auth/authSlice";



export default function RequireAuth ({ children, loginPath = '/login' }) {
    const location = useLocation();
    const isAuth = useSelector(selectIsAuthenticated);
    const token = useSelector(selectToken);
    const checking = useSelector((s) => s.auth.status === 'checking');

    if (checking) {
        return (
            <div className="p-8 text-center text-white">
                <p className="opacity-70">Checking session...</p>
            </div>
        );
    }

    if (!isAuth || !token) {
        return (
            <div className="p-8 text-center text-white">
                <p className="mb-4 text-lg">You must log in to see this page</p>
                <Link
                    to={loginPath}
                    state={{ from: location }}
                    className="inline-block bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2"
                >
                    Log in
                </Link>
            </div>
        );
    }
    return children;
}