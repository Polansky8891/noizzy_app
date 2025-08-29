import { useState } from 'react';
import { axiosInstance } from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { login } from '../../store/auth/authSlice';
import { fetchFavoriteTracks } from '../../store/favoritesSlice';

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
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'First Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'First Name must be at least 2 characters';
    } else if (!/^[A-Za-z]+$/.test(form.name)) {
      newErrors.name = 'First Name can only contain letters';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    } else if (form.lastName.trim().length < 2) {
      newErrors.lastName = 'Last Name must be at least 2 characters';
    } else if (!/^[A-Za-z]+$/.test(form.lastName)) {
      newErrors.lastName = 'Last Name can only contain letters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Email is not valid';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setErrorMsg(null);

    const isValid = validate();
    if (!isValid) return;

    const { name, email, password } = form;

    try {
      const { data } = await axiosInstance.post('/auth/new', { name, email, password });

      if (!data?.token) throw new Error('Token not received');

      localStorage.setItem('token', data.token);
      localStorage.setItem('uid', data.uid);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', email);

      dispatch(
        login({
          uid: data.uid,
          email,
          displayName: data.name,
          photoURL: null
        })
      );

      dispatch(fetchFavoriteTracks());

      navigate('/');
      
    } catch (error) {
      const message = error.response?.data?.msg || 'Register failed';
      setErrorMsg(message);

      
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-full max-w-lg bg-gray-300 rounded-xl shadow-md py-8 px-8">
        <h2 className="text-[28px] font-bold text-white mb-6 text-center">Sign Up</h2>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
            <div className="w-full">
              <input 
                className="bg-gray-200 text-black border-0 rounded-md p-2 w-full" 
                placeholder="First Name" 
                name="name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && ( <span className="text-red-600 text-sm block mt-1 text-left">{errors.name}</span> )}
            </div>
            <div className="w-full">
              <input 
                className="bg-gray-200 text-black border-0 rounded-md p-2 w-full" 
                placeholder="Last Name" 
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="text-red-600 text-sm block mt-1 text-left">{errors.lastName}</span>}
            </div>
          </div>

          <div className="w-full mb-4">
            <input 
              className="bg-gray-200 text-black border-0 rounded-md p-2 w-full" 
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-red-600 text-sm block mt-1 text-left">
                {errors.email}
              </span>
            )}
          </div>

          <div className="w-full mb-4 relative">
          <input 
            className="bg-gray-200 text-black border-0 rounded-md p-2 w-full pr-10" 
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800'
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <span className="text-red-600 text-sm block mt-1 text-left">
              {errors.password}
            </span>
          )}
          </div>

          <div className="w-full mb-4 relative">
          <input 
            className="bg-gray-200 text-black border-0 rounded-md p-2 w-full pr-10" 
            placeholder="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800'
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <span className="text-red-600 text-sm block mt-1 text-left">
              {errors.password}
            </span>
          )}
          </div>

          <button 
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:bg-indigo-600 hover:to-blue-600 transition ease-in duration-200 mt-2" 
            type="submit"
          >
            Submit
          </button>
          <div className="flex justify-center items-center mt-2">
          <h3 className="text-black text-sm">Already have an account?</h3>
          <a href="/login" className="text-sm px-4 no-underline text-blue-700">Sign In</a>
        </div>
        </form>
      </div>
    </div>
  );
};
