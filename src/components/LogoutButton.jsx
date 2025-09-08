import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from "../firebase/config";
import { logout } from "../store/auth/authSlice";
import { axiosInstance } from "../api/axiosInstance";

export default function LogoutButton() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {

        try {
            await signOut(FirebaseAuth);
        } catch (error) {
            console.warn('Firebase signOut error:', error);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('photoURL');

        delete axiosInstance.defaults.headers.common?.Authorization;

        dispatch(logout());

        navigate('/profile', { replace: true });
    };

    return (
        <button onClick={handleLogout} className="px-3 py-2 rounded bg-gray-700 text-white">
            Logout
        </button>
    );
}
