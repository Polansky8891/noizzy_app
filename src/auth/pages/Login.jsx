import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseAuth, GoogleProvider } from '../../firebase/config'; 
import { checkingCredentials } from '../../store/auth/authSlice';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    dispatch(checkingCredentials());

    try {
      await signInWithEmailAndPassword(FirebaseAuth, formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMsg(error?.message || 'Login failed');
      setSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    dispatch(checkingCredentials());

    try {
      const provider = GoogleProvider || new GoogleAuthProvider();
      await signInWithPopup(FirebaseAuth, provider);
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMsg(error?.message || 'Google sign-in failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="grid place-items-center px-4 min-h-[calc(100dvh-var(--player-h,0px))]">
      <div className="translate-y-[-12vh] w-full max-w-lg">
        <div className="bg-gray-300 rounded-xl shadow-md py-8 px-8">
          <h2 className="text-[28px] font-bold text-white mb-6 text-center">Sign In</h2>

          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
              <input
                className="bg-gray-200 text-black border-0 rounded-md p-2 w-full mb-4 md:mb-0"
                placeholder="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="relative w-full">
                <input
                  className="bg-gray-200 text-black border-0 rounded-md p-2 w-full"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-md hover:from-indigo-600 hover:to-blue-600 transition w-full py-2 px-3"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 533.5 544.3"
                  className="w-5 h-5"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h146.9c-6.3 34-25.5 62.7-54.4 82.1l88 68.3c51.5-47.5 80.9-117.5 80.9-195.3z"/>
                  <path fill="#34A853" d="M272 544.3c73 0 134.3-24.2 179-65.7l-88-68.3c-24.5 16.5-56 26-91 26-69.9 0-129.2-47.2-150.4-110.7H30.9v69.5C75.6 486.6 167.6 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M121.6 325.6c-10.2-30.4-10.2-63.5 0-93.9V162.2H30.9c-41.2 82.4-41.2 181.9 0 264.3l90.7-71z"/>
                  <path fill="#EA4335" d="M272 107.7c39.6-.6 77.6 14 106.7 40.9l79.7-79.7C404.7 24.4 340.6 0 272 0 167.6 0 75.6 57.7 30.9 162.2l90.7 69.5C142.8 154.9 202.1 107.7 272 107.7z"/>
                </svg>
                <span>Google</span>
              </button>
            </div>

            <div className="mt-4 text-center text-sm pointer-events-none">
            <span className="text-gray-700">Don’t have an account? </span>
            <Link
              to="/profile"
              className="text-blue-700 hover:underline focus:underline inline pointer-events-auto"
            >
              Create an account
            </Link>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};