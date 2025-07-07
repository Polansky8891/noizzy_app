import { useState } from 'react';
import { startGoogleSignIn }  from '../../store/auth/thunks';
import { useDispatch } from 'react-redux';

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Aquí puedes añadir lógica de login, fetch, etc.
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
            <div className="w-full mb-4 md:mb-0">
              <input 
                className="bg-gray-200 text-black border-0 rounded-md p-2 w-full" 
                placeholder="Email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="w-full">
              <input 
                className="bg-gray-200 text-black border-0 rounded-md p-2 w-full" 
                placeholder="Password" 
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
           <div className="flex space-x-2">
            <button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:bg-indigo-600 hover:to-blue-600 transition ease-in duration-200p-2 w-full py-1.5 px-3">
              Sign In
            </button>
            <button 
              type="button" 
              onClick={onGoogleSignIn}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md hover:from-indigo-600 hover:to-blue-600 transition ease-in duration-200 p-2 w-full"
>
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                <path fill="#4285f4" d="M533.5 278.4c0-17.7-1.6-35.2-4.7-52H272v98.5h146.9c-6.3 34-25.2 62.7-53.8 81.9v68h86.8c50.9-46.9 81.6-116 81.6-196.4z"/>
                <path fill="#34a853" d="M272 544.3c72.6 0 133.7-24 178.3-65.3l-86.8-68c-24.1 16.2-54.8 25.6-91.5 25.6-70 0-129.2-47.2-150.5-110.5h-89v69.4C82.8 482 171.5 544.3 272 544.3z"/>
                <path fill="#fbbc04" d="M121.5 325.9c-10.4-30.8-10.4-64.2 0-95l-89-69.4C-10 228-10 316.2 32.5 387.2l89-61.3z"/>
                <path fill="#ea4335" d="M272 107.7c39.5 0 75 13.6 102.9 40.3l77-77C405.6 24 344.5 0 272 0 171.5 0 82.8 62.3 32.5 154.7l89 69.4C142.8 154.9 202 107.7 272 107.7z"/>
            </svg>
            <span>Google</span>
            </button>
            
          </div>
          <a href="/profile" className="text-sm px-4 no-underline text-blue-700">Create an account</a>
        </form>
      </div>
    </div>
  );
};
