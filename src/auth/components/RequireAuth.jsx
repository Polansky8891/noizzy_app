import { Link, Navigate, useLocation } from "react-router-dom";

export default function RequireAuth ({ children }) {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {

        return (
            <div className="p-8 text-center text-white">
                <p className="mb-4 text-lg"> You must log in to see this page</p>
                <Link
                    to="/profile"
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