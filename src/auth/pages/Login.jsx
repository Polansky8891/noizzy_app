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
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 533.5 544.3"><title>Google</title></svg>
                <span>Google</span>
              </button>
            </div>

            <Link to="/profile" className="text-sm px-4 no-underline text-blue-700 mt-4">
              Create an account
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};