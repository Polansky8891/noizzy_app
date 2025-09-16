import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from "../firebase/config";
import { logout } from "../store/auth/authSlice";

export default function LogoutButton() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);

        try {
            await signOut(FirebaseAuth);
        } catch (error) {
            console.warn('Firebase signOut error:', error);
        } finally {
             dispatch(logout());
        }

    
        navigate(redirectTo, { replace: true });
        setLoading(false);
    };

    return (
        <button 
            onClick={handleLogout}
            disabled={loading}
            className="px-3 py-2 rounded bg-gray-700 text-white"
        >
            {loading ? 'Loading out...' : 'Logout'}
        </button>
    );
}
