import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { checkingCredentials } from '../../store/auth/authSlice';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';

export const Register = () => {
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'First Name is required';
    else if (form.name.trim().length < 2) e.name = 'First Name must be at least 2 characters';
    else if (!/^[A-Za-z]+$/.test(form.name)) e.name = 'First Name can only contain letters';

    if (!form.lastName.trim()) e.lastName = 'Last Name is required';
    else if (form.lastName.trim().length < 2) e.lastName = 'Last Name must be at least 2 characters';
    else if (!/^[A-Za-z]+$/.test(form.lastName)) e.lastName = 'Last Name can only contain letters';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email is not valid';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Password must contain uppercase, lowercase, and a number';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!validate()) return;

    dispatch(checkingCredentials());
    try {
      const { user } = await createUserWithEmailAndPassword(FirebaseAuth, form.email, form.password);
      const fullName = `${form.name} ${form.lastName}`.trim();
      if (fullName) await updateProfile(user, { displayName: fullName });
      navigate('/', { replace: true });
    } catch (error) {
      const code = error?.code || '';
      let msg = error?.message || 'Register failed';
      if (code === 'auth/email-already-in-use') msg = 'Email is already in use';
      if (code === 'auth/invalid-email') msg = 'Invalid email';
      if (code === 'auth/weak-password') msg = 'Password should be at least 6 characters';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="grid place-items-center px-4 min-h-[calc(100dvh-var(--player-h,0px))]">
      <div className="translate-y-[-12vh] w-full max-w-lg">
        <div
          className="
            rounded-2xl border border-[#0A84FF]/40 bg-[#0F0F0F]/90
            backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_40px_rgba(0,0,0,0.6)]
            px-6 py-7
          "
          style={{ WebkitBackdropFilter: 'blur(12px)' }}
        >
          <h2 className="text-[26px] font-semibold text-[#0A84FF] mb-6 text-center tracking-tight">
            Sign Up
          </h2>

          <form className="flex flex-col" onSubmit={handleSubmit}>
            {/* First / Last Name */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-5 md:space-y-0 mb-5">
              <div className="w-full">
                <input
                  className="bg-[#111] text-white placeholder-white/40 border border-[#0A84FF] rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/60"
                  placeholder="First Name"
                  name="name"
                  autoComplete="given-name"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="text-red-400 text-sm block mt-1">{errors.name}</span>}
              </div>
              <div className="w-full">
                <input
                  className="bg-[#111] text-white placeholder-white/40 border border-[#0A84FF] rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/60"
                  placeholder="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <span className="text-red-400 text-sm block mt-1">{errors.lastName}</span>}
              </div>
            </div>

            <div className="w-full mb-4">
              <input
                className="bg-[#111] text-white placeholder-white/40 border border-[#0A84FF] rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/60"
                placeholder="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className="text-red-400 text-sm block mt-1">{errors.email}</span>}
            </div>

            <div className="w-full mb-4 relative">
              <input
                className="bg-[#111] text-white placeholder-white/40 border border-[#0A84FF] rounded-lg p-3 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/60"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash className='text-[#0A84FF]'/> : <FaEye className='text-[#0A84FF]' />}
              </button>
              {errors.password && <span className="text-red-400 text-sm block mt-1">{errors.password}</span>}
            </div>

            <div className="w-full mb-4 relative">
              <input
                className="bg-[#111] text-white placeholder-white/40 border border-[#0A84FF] rounded-lg p-3 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/60"
                placeholder="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash className='text-[#0A84FF]'/> : <FaEye className='text-[#0A84FF]' />}
              </button>
              {errors.confirmPassword && (
                <span className="text-red-400 text-sm block mt-1">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              className="w-full py-2.5 rounded-lg bg-[#0A84FF] text-white font-medium shadow-[0_0_20px_rgba(10,132,255,0.25)] hover:bg-[#0a7be6] transition focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/60"
              type="submit"
            >
              Submit
            </button>

            <div className="flex justify-center items-center mt-3 text-sm">
              <span className="text-white/70">Already have an account? </span>
              <Link
                to="/login"
                className="inline ml-1 font-medium !text-[#0A84FF] visited:!text-[#0A84FF] hover:underline focus:underline"
              >
                Sign In
              </Link>
            </div>

            {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};