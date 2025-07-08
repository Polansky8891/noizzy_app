import { useNavigate } from "react-router-dom";

export const SettingsMenu = ({ closeMenu }) => {

  const navigate = useNavigate();

  return (

    <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-lg w-40 z-50">
      <ul className="py-1">
        <li>
          <button
            onClick={() => {
              navigate('/account');
              closeMenu();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Account
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Settings
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Option 3
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Option 4
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Option 5
          </button>
        </li>
      </ul>
    </div>
  );
};
            
    
 
    
  
