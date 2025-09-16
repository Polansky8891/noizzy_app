import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseAuth, GoogleProvider } from '../../firebase/config'; 
import { login, setToken, checkingCredentials } from '../../store/auth/authSlice';

const mapAuthError = (e) => {
  const code = e?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Email o contraseña incorrectos.';
  if (code.includes('user-not-found')) return 'No existe una cuenta con ese email.';
  if (code.includes('too-many-requests')) return 'Demasiados intentos. Prueba más tarde.';
  if (code.includes('popup-closed-by-user')) return 'Se cerró la ventana de Google.';
  return e?.message || 'Error de autenticación.';
};

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const location = useLocation();                            
  const from = location.state?.from?.pathname || '/';        

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, errorMessage } = useSelector((s) => s.auth);
  const disabled = status === 'checking' || submitting;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      dispatch(checkingCredentials());
      const cred = await signInWithEmailAndPassword(FirebaseAuth, formData.email, formData.password);
      const user = cred.user;
      const token = await user.getIdToken(false);

      dispatch(login({
        uid: user.uid,
        email: user.email || formData.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        token,
      }));
      dispatch(setToken(token));

      navigate(from, { replace: true});
    } catch (err) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      dispatch(checkingCredentials());
      const res = await signInWithPopup(FirebaseAuth, GoogleProvider);
      const user = res.user;
      const token = await user.getIdToken(false);

      dispatch(login({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || user.providerData?.[0]?.photoURL || null,
        token,
      }));
      dispatch(setToken(token));

      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-lg bg-gray-300 rounded-xl shadow-md py-8 px-8">
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
              autoComplete='email'
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
                autoComplete='current-password'
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
              disabled={disabled}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition w-full"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">...</svg>
              <span>Google</span>
            </button>
          </div>

          <a href="/profile" className="text-sm px-4 no-underline text-blue-700 mt-4">
            Create an account
          </a>
        </form>
      </div>
    </div>
  );
};