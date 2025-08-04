import { useState } from 'react';
import { startGoogleSignIn }  from '../../store/auth/thunks';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


export const Login = () => {

  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    setErrorMsg(null);
    
    try {
      const { data } = await axiosInstance.post('/auth', formData);

      // verify if we have received the token correctly
      if (!data.token) {
        throw new Error('Token not received');
      }

      // save token and optional data
      localStorage.setItem('token', data.token);
      localStorage.setItem('uid', data.uid);
      localStorage.setItem('name', data.name);


      navigate('/');
      
    } catch (error) {
      const message = error.response?.data?.msg || 'Login failed';
      setErrorMsg(message);
    }
  };

  const onGoogleSignIn = () => {

    dispatch( startGoogleSignIn() );
    
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
              value={formData.email}
              onChange={handleChange}
            />
            <div className='relative w-full'>
              <input
              className="bg-gray-200 text-black border-0 rounded-md p-2 w-full"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 tranform -translate-y-1/2 text-gray-600 hover:text-gray-800'
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
            </div>
            
          </div>

          {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-md hover:from-indigo-600 hover:to-blue-600 transition w-full py-2 px-3"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={onGoogleSignIn}
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